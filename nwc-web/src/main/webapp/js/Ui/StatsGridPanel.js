/*global Ext,LOG,CONFIG,NWCUI,$,GeoExt,OpenLayers,gxp,*/
Ext.ns("NWCUI.ui");

NWCUI.ui.StatsGridPanel = Ext.extend(Ext.grid.GridPanel, {
    constructor: function (config) {
        var statsStore = config.statsStore || [];
        var columnObjs = NWCUI.util.wrapEachWithKey(statsStore.fields.keys, 'header');
        var colModel = new Ext.grid.ColumnModel({
            defaults: {
                width: 50,
                sortable: true
            },
            columns: columnObjs
        });

        config = Ext.apply(
            {
                store: statsStore,
                colModel: colModel,
                height: 350,
                width: 125
            },
            config
        );

        NWCUI.ui.StatsGridPanel.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.StatsGridPanel::constructor(): Construction complete.');
    }
});