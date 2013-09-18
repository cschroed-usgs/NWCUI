Ext.ns("NWCUI.ui");
NWCUI.ui.ViewComboBoxMixin = function(){
    var self = this;
    self.constructor = function(config){
        var window = config.window;
        var comboStoreData = [];
        var handler = function(combo, record, index){
            window.graphPanel.graph.destroy();
            var graphDiv = window.graphPanel.getEl().dom;
            var legendDiv = window.labelPanel.getEl().dom;
            var values = window.dataSeriesStore[record.get('viewId')].data;
            var labels = window.dataSeriesStore[record.get('viewId')].metadata.seriesLabels;
            var graph = new NWCUI.ui.Graph(graphDiv, legendDiv, values, labels);
            window.doLayout();
            window.graphPanel.graph = graph;
        };
        Ext.iterate(window.dataSeriesStore, function(key, value){
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
            emptyText: window.defaultSeries.capitalize(),
            listeners: {
                select: handler
            }
        }, config);
        NWCUI.ui.ViewComboBox.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.ViewComboBox::constructor(): Construction complete.');
    };
};
NWCUI.ui.ViewComboBox = Ext.extend(Ext.form.ComboBox, new NWCUI.ui.ViewComboBoxMixin());