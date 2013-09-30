Ext.ns("NWCUI.ui");

NWCUI.ui.DataExportToolbar= Ext.extend(Ext.Toolbar, {
    constructor: function(config) {
        var self = this;
        var exportHandler = function(button, event){

            var win = button.findParentByType('dataWindow');
            var csvHeaderRow = 'Date and Time (ISO 8601),';

            var rawValueKey = button.rawValueKey;
            //prepare column headers
            var rawKeyValueToUnitsMap = {
                dayMet: 'Precipitation (mm/day)',
                eta: 'Evapotranspiration (mm/month)'
            };
            var unitString = rawKeyValueToUnitsMap[rawValueKey];
            if(undefined === unitString){
                NWCUI.ui.errorNotify('Error during export -- unknown raw value key used for unit string lookup');
                unitString = ' ';
            }
            csvHeaderRow += unitString + '\n';
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
            items : items,
        }, config);

        NWCUI.ui.DataExportToolbar.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.DataExportToolbar::constructor(): Construction complete.');
    }
});
Ext.reg('dataExportToolbar', NWCUI.ui.DataExportToolbar);