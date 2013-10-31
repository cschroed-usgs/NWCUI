/*global Ext,LOG,CONFIG,NWCUI,$,GeoExt,OpenLayers,gxp,*/
Ext.ns("NWCUI.ui");

NWCUI.ui.StatsGraphPanel = Ext.extend(Ext.Panel, {
    graph: undefined,
    headers: undefined,
    constructor: function (config) {
        var self = this;
        var destroyDygraph = function () {
            if (self.graph && self.graph.destroy) {
                self.graph.destroy();
            }
        };
        config = Ext.apply(
            {
                width: 800,
                listeners: {
                    beforedestroy: destroyDygraph
                }
            },
            config
        );

        NWCUI.ui.StatsGraphPanel.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.StatsGraphPanel::constructor(): Construction complete.');
    }
});