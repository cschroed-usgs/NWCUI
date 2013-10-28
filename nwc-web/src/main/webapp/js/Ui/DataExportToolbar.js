Ext.ns("NWCUI.ui");

NWCUI.ui.DataExportToolbar= Ext.extend(Ext.Toolbar, {
    constructor: function (config) {
        var self = this;
        var exportHandler = function (button, event) {

            var win = button.findParentByType('dataWindow');
            var csvHeaderRow = 'Date and Time (ISO 8601),';

            var rawValueKey = button.rawValueKey;
            //prepare column headers
            var rawValueKeyToFieldLabelMap = {
                dayMet: 'Precipitation (mm/day)',
                eta: 'Evapotranspiration (mm/month)'
            };
            var fieldLabel = rawValueKeyToFieldLabelMap[rawValueKey];
            if (undefined === fieldLabel) {
                NWCUI.ui.errorNotify('Error during export -- unknown raw value key used for field label lookup');
                fieldLabel = ' ';
            }
            csvHeaderRow += fieldLabel + '\n';
            //prepare data rows
            var rawValues = win.labeledRawValues[rawValueKey];
            var formattedValues = rawValues.replace(/ /g, '');//replace trailing space on end of each row
            //assemble data rows and column headers
            var formattedExport = escape(csvHeaderRow + formattedValues);

            var filename = win.title.length > 0 ? win.title : CONFIG.defaultExportFilename;
            filename = filename.replace(/ /g, '_');
            filename += '_' + rawValueKey;
            filename += '.csv';
            filename = escape(filename);
            var type = 'text/csv';
            $('#filename_value').val(filename);
            $('#type_value').val(type);
            $('#data_value').val(formattedExport);
            $('#download_form').submit();
        };

        var items = [
            '->',
            {
                xtype: 'button',
                text: 'Add Water Use Data',
                handler: function(button, event){
                    button.disable();
                    var dataWindow = button.findParentByType('dataWindow');
                    var feature = dataWindow.feature;
                    var countySelectedCallback = function(countyFeature){
                        dataWindow.restore();
                        var offeringId = countyFeature.attributes.FIPS;
                        var sosUrl = NWCUI.data.buildSosUrlFromSource(offeringId, NWCUI.data.SosSources.countyWaterUse);
                      
                        var waterUseFailure = function(data, status, jqXHR){
                            NWCUI.ui.errorNotify(
                                'An error occurred while retrieving water use data from:\n'+
                                this.url + '\n' +
                                'See browser logs for details'
                                );
                            LOG.error('Error while accessing: ' + this.url + '\n' + data);
                        };

                        var waterUseSuccess = function (data, status, jqXHR) {

                            if (null === data || //null data
                                    !data.documentElement || //not an xml document
                                    !data.documentElement.textContent || //malformed xmlDocument
                                    data.documentElement.textContent.has('exception') //xmlDocument with an exception message
                                    ) {
                                waterUseFailure.apply(this, arguments);
                            }
                            else {
                                var parsedTable = NWCUI.data.parseSosResponse(data);
                                var countyAreaSqMiles = countyFeature.attributes.AREA_SQMI;
                                var countyAreaAcres = NWCUI.data.convert.squareMilesToAcres(countyAreaSqMiles);
                                var convertedTable = NWCUI.data.convert.mgdTableToMmPerDayTable(parsedTable, countyAreaAcres);
                                //add a summation series to the table
                                convertedTable = convertedTable.map(function(row){
                                    var nonDateValues = row.from(1);//don't try to sum dates
                                    var rowSum = nonDateValues.sum();
                                    var newRow = row.clone();//shallow array copy
                                    newRow.push(rowSum);
                                    return newRow;
                                });
                                var waterUseDataSeries = new NWCUI.data.DataSeries();
                                waterUseDataSeries.data = convertedTable;
                                
                                //use the series metadata as labels
                                var additionalSeriesLabels = NWCUI.data.SosSources.countyWaterUse.observedProperty.split(',');
                                additionalSeriesLabels.push('Aggregate Water Use');
                                waterUseDataSeries.metadata.seriesLabels = waterUseDataSeries.metadata.seriesLabels.from(1).concat(additionalSeriesLabels);
                                
                                dataWindow.dataSeriesStore.updateWaterUseSeries(waterUseDataSeries);
                                dataWindow.expand();
                                dataWindow.updateGraph(dataWindow);
                            }
                        };

                        $.when($.ajax(sosUrl)).then(waterUseSuccess, waterUseFailure);
                    };
                    CONFIG.mapPanel.getCountyThatIntersectsWithHucFeature(feature, countySelectedCallback);

                    dataWindow.collapse();
                }
            },
            '-',
            {
                xtype: 'button',
                text: 'Download ETa Data',
                handler: exportHandler,
                cls: 'export_button',
                rawValueKey: 'eta'//used in handler
            },
            {
                xtype: 'button',
                text: 'Download DayMet Data',
                handler: exportHandler,
                cls: 'export_button',
                rawValueKey: 'dayMet'//used in handler
            }
        ];
        
        config = Ext.apply({
            items : items
        }, config);

        NWCUI.ui.DataExportToolbar.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.DataExportToolbar::constructor(): Construction complete.');
    }
});
Ext.reg('dataExportToolbar', NWCUI.ui.DataExportToolbar);