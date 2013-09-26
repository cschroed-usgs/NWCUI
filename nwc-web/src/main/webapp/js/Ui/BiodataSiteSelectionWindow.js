Ext.ns("NWCUI.ui");

NWCUI.ui.BiodataSiteSelectionWindow = Ext.extend(Ext.Window, {
    constructor: function(config) {
        var self = this;
        config.windowConfig = config.windowConfig || {};
        var fieldNames = {
            siteId: 'SiteNumber',
            siteName: 'SiteName'
        };
        var defaultId = NWCUI.ui.BiodataSiteSelectionWindow.id;
        var fields = [
            {name: fieldNames.siteId, type: 'string'},
            {name: fieldNames.siteName, type: 'string'}
        ];
        var featureSelectionModel = new Ext.grid.CheckboxSelectionModel();

        //prepare column configs for the feature selection dialog
        var columns = [
            featureSelectionModel,
            {header: 'Site Id', dataIndex: fieldNames.siteId},
            {header: 'Site Name', dataIndex: fieldNames.siteName}
        ];

        var siteFeatureStore = new GeoExt.data.FeatureStore({
            features: config.features,
            fields: fields,
            initDir: 0
        });

        var featureGrid = new Ext.grid.GridPanel({
            store: siteFeatureStore,
//            autoHeight: true,
//            deferRowRender: false,
//            forceLayout: true,
            sm: featureSelectionModel,
            viewConfig: {
                autoFill: true,
                forceFit: true
            },
            columns: columns
        });
        var biodataButton = {
            xtype: 'button',
            text: 'Explore Selected Sites in Biodata',
            handler: function() {
                var siteIds = featureSelectionModel.getSelections().map(
                        function(record) {
                            return record[fieldNames.siteId];
                        });
                console.dir(siteIds);
                debugger;
            }
        };
        var windowConfig = Ext.apply({
            title: 'BioData Site Selection',
            id: defaultId,
            layout: 'fit',
            width: 300,
            height: 300,
            items: [featureGrid],
            fbar: [
                '->',
                biodataButton
            ],
            featureSelectionModel: featureSelectionModel
        }, config.windowConfig);

        NWCUI.ui.BiodataSiteSelectionWindow.superclass.constructor.call(this, windowConfig);
        LOG.info('NWCUI.ui.BiodataSiteSelectionWindow::constructor(): Construction complete.');
    }
});
NWCUI.ui.BiodataSiteSelectionWindow.id = 'biodata-site-selection-window';