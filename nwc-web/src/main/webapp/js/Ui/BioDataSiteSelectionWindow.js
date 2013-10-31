/*global Ext,LOG,CONFIG,NWCUI,$,GeoExt,OpenLayers,gxp,XMLSerializer*/
Ext.ns("NWCUI.ui");

NWCUI.ui.BioDataSiteSelectionWindow = Ext.extend(Ext.Window, {
    constructor: function (config) {
        var self = this;
        config.windowConfig = config.windowConfig || {
        };
        var fieldNames = {
            siteId: 'SiteNumber',
            siteName: 'SiteName'
        };
        var defaultId = NWCUI.ui.BioDataSiteSelectionWindow.id;
        var fields = [
            {
                name: fieldNames.siteId,
                type: 'string'
            },
            {
                name: fieldNames.siteName,
                type: 'string'
            }
        ];
        var featureSelectionModel = new Ext.grid.CheckboxSelectionModel();

        //prepare column configs for the feature selection dialog
        var columns = [
            featureSelectionModel,
            {
                header: 'Site Id',
                dataIndex: fieldNames.siteId
            },
            {
                header: 'Site Name',
                dataIndex: fieldNames.siteName
            }
        ];

        var siteFeatureStore = new GeoExt.data.FeatureStore({
            features: config.features,
            fields: fields,
            initDir: 0
        });

        var featureGrid = new Ext.grid.GridPanel({
            store: siteFeatureStore,
            sm: featureSelectionModel,
            viewConfig: {
                autoFill: true,
                forceFit: true
            },
            columns: columns
        });
        var bioDataButton = {
            xtype: 'button',
            text: 'Explore Selected Sites in BioData',
            handler: function () {
                var siteIds = featureSelectionModel.getSelections().map(
                    function (record) {
                        return record.data[fieldNames.siteId];
                    }
                );
                if (siteIds.length) {
                    /**
                     * @param {array<String>} siteIds
                     */
                    var preselectBioDataSites = function (siteIds) {
                        var doc = CONFIG.bioDataSiteSelectionDoc;
                        var siteNumbersElt = $(doc).find('siteNumbers').empty()[0];
                        siteIds.each(function (siteId) {
                            var child = doc.createElement('siteNumber');
                            child.textContent = siteId;
                            siteNumbersElt.appendChild(child);
                        });

                        //serialize xml document
                        var xmlString;
                        //IE
                        if (window.ActiveXObject) {
                            xmlString = doc.xml;
                        } else {
                            // code for Mozilla, Firefox, Opera, etc.

                            xmlString = (new XMLSerializer()).serializeToString(doc);
                        }

                        $("[name='currentQuery']").val(xmlString);
                        $('#bioData_form').submit();
                    };


                    if (CONFIG.bioDataSiteSelectionDoc) {
                        preselectBioDataSites(siteIds, CONFIG.bioDataSiteSelectionDoc);
                    } else {
                        //retrieve document from server
                        $.when($.get('data/BioDataSiteSelection.xml')).then(
                            function (response, status, jqXHR) {
                                CONFIG.bioDataSiteSelectionDoc = response;
                                preselectBioDataSites(siteIds);
                            },
                            function (response, status, jqXHR) {
                                NWCUI.ui.errorNotify('Failed to retrieve BioData site pre-selection skeleton document');
                            }
                        );

                    }
                } else {
                    NWCUI.ui.errorNotify('No BioData Sites Selected');
                }
            }
        };
        var helpButton = {
            xtype: 'button',
            icon: 'js/ext/ux/notify/images/info.gif',
            handler: function () {
                var msg = 'In order to open BioData with your preselected sites, disable popup-blocking for this web site.';
                Ext.Msg.show({
                    title: 'Information',
                    msg: msg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.QUESTION,
                    minWidth: 300
                });
            }
        };
        var windowConfig = Ext.apply(
            {
                title: 'BioData Site Selection',
                id: defaultId,
                layout: 'fit',
                width: 300,
                height: 300,
                items: [featureGrid],
                fbar: [
                    '->',
                    bioDataButton,
                    helpButton
                ],
                featureSelectionModel: featureSelectionModel
            },
            config.windowConfig
        );

        NWCUI.ui.BioDataSiteSelectionWindow.superclass.constructor.call(this, windowConfig);
        LOG.info('NWCUI.ui.BioDataSiteSelectionWindow::constructor(): Construction complete.');
    }
});
NWCUI.ui.BioDataSiteSelectionWindow.id = 'bioData-site-selection-window';