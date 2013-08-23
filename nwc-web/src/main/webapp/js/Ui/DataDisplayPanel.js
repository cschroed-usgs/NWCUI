Ext.ns("NWCUI.ui");

NWCUI.ui.DataDisplayPanel = Ext.extend(Ext.Panel, {
    statsStore : undefined,
    constructor: function(config) {
        var statsStore = config.statsStore || [];
        var gridPanel = new NWCUI.ui.StatsGridPanel({
            region : 'center',
            statsStore : statsStore,
            height : 350,
            flex : 1
        });
        var graphPanel = new NWCUI.ui.StatsGraphPanel({
            region : 'east',
            statsStore : statsStore,
            flex : 0
        });
        
        config = Ext.apply({
            title : statsStore.title,
            items : [gridPanel, graphPanel],
            layout : 'hbox',
            pack : 'center'
        }, config);

        NWCUI.ui.DataDisplayPanel.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.DataDisplayPanel::constructor(): Construction complete.');
    }
});