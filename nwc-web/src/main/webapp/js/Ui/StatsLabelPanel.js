/**
 * Just an empty panel with a fancy afterrender event. Dygraph puts its label in here.
 * @warning this will break unless instantiated from the afterrender event of the relevant Dygraph panel
 */
Ext.ns("NWCUI.ui");

NWCUI.ui.StatsLabelPanel = Ext.extend(Ext.Panel, {
    initialData: undefined,
    graph: undefined,
    constructor: function(config) {
        var self = this;
        config = Ext.apply({

        }, config);

        NWCUI.ui.StatsLabelPanel.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.StatsLabelPanel::constructor(): Construction complete.');
    }
});