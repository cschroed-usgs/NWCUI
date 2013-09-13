Ext.ns("NWCUI.ui");

NWCUI.ui.DataWindow = Ext.extend(Ext.Window, {
    constructor: function(config) {
        var self = this;
        var title = config.title || "";
        var width = config.width || 1000;
        var height = config.height || 400;
        self.data = [];
        self.toggleBar = new NWCUI.ui.SeriesToggleToolbar();
               //attach the contained components so that they can be easily referenced later
        self.graphPanel = new NWCUI.ui.StatsGraphPanel();
        self.labelPanel = new NWCUI.ui.StatsLabelPanel();
        
        config = Ext.apply({
            width: width,
            height: height,
//@todo restore tbar when more series given
            title: title,
            collapsible: true,
            layout : 'hbox',
            items: [self.graphPanel, self.labelPanel]
        }, config);

        NWCUI.ui.DataWindow.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.DataWindow::constructor(): Construction complete.');
    }
});
Ext.reg('dataWindow', NWCUI.ui.DataWindow);
