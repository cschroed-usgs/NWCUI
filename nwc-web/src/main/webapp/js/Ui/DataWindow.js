Ext.ns("NWCUI.ui");

NWCUI.ui.DataWindow = Ext.extend(Ext.Window, {
    constructor: function(config) {
        var self = this;
        var title = config.title || "";
        var width = config.width || 1000;
        var height = config.height || 450;
        self.defaultSeries = 'monthly';
        self.dataSeriesStore = config.dataSeriesStore || {};
        self.toggleBar = new NWCUI.ui.SeriesToggleToolbar({window: self});
               //attach the contained components so that they can be easily referenced later
        self.graphPanel = new NWCUI.ui.StatsGraphPanel();
        self.labelPanel = new NWCUI.ui.StatsLabelPanel();
        var updateGraph = function(window){
            window = window || self;
            var graphDiv = window.graphPanel.getEl().dom;
            var legendDiv = window.labelPanel.getEl().dom;
            var values = self.dataSeriesStore[self.defaultSeries].data;
            var labels = self.dataSeriesStore[self.defaultSeries].metadata.seriesLabels;
            var graph = new NWCUI.ui.Graph(graphDiv, legendDiv, values, labels);
            window.doLayout();
            self.graphPanel.graph = graph;
        };
        config = Ext.apply({
            width: width,
            height: height,
            tbar: self.toggleBar,
            title: title,
            collapsible: true,
            layout : 'hbox',
            items: [self.graphPanel, self.labelPanel],
            bbar: new NWCUI.ui.DataExportToolbar(),
            listeners:{
                afterrender: function(window){
                    updateGraph(window);
                },
                collapse: function(window){
                    window.alignTo(Ext.get('nwcui-body-panel'), 'tl', [50, 0], true);
                },
                expand: function (window) {
                    window.center();

                }
            },
            updateGraph: updateGraph
        }, config);

        NWCUI.ui.DataWindow.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.DataWindow::constructor(): Construction complete.');
    }
});
Ext.reg('dataWindow', NWCUI.ui.DataWindow);
