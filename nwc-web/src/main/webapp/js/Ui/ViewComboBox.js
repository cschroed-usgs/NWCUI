Ext.ns("NWCUI.ui");
NWCUI.ui.ViewComboBoxMixin = function(){
    var self = this;
    self.constructor = function(config){
        var win = config.window;
        var comboStoreData = [];
        var handler = function(combo, record, index){
            win.graphPanel.graph.destroy();
            var graphDiv = win.graphPanel.getEl().dom;
            var legendDiv = win.labelPanel.getEl().dom;
            var values = win.dataSeriesStore[record.get('viewId')].data;
            var labels = win.dataSeriesStore[record.get('viewId')].metadata.seriesLabels;
            var graph = new NWCUI.ui.Graph(graphDiv, legendDiv, values, labels);
            win.doLayout();
            win.graphPanel.graph = graph;
        };
        var dataKeys = ['monthly', 'daily'];
        Ext.iterate(dataKeys, function(key, value){
            comboStoreData.push([key, key.capitalize()]);
        });
        var comboStore = new Ext.data.ArrayStore({
            fields: ['viewId', 'displayText'],
            data: comboStoreData,
        });
        config = Ext.apply({
            editable: false,
            mode: 'local',
            store: comboStore,
            valueField: 'viewId',
            displayField: 'displayText',
            triggerAction: 'all',
            forceSelection: true,
            emptyText: win.defaultSeries.capitalize(),
            listeners: {
                select: handler
            }
        }, config);
        NWCUI.ui.ViewComboBox.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.ViewComboBox::constructor(): Construction complete.');
    };
};
NWCUI.ui.ViewComboBox = Ext.extend(Ext.form.ComboBox, new NWCUI.ui.ViewComboBoxMixin());