/*global Ext,LOG,CONFIG,NWCUI,$,GeoExt,OpenLayers,gxp,*/
Ext.ns("NWCUI.ui");
NWCUI.ui.SeriesToggleToolbar = Ext.extend(Ext.Toolbar, {
    menu: undefined,
    getSeriesTogglers: function () {
        return this.menu.getSeriesTogglers();
    },
    constructor: function (config) {
        var self = this;

        config = Ext.apply(
            {
                items: [
                    'Graph View:',
                    new NWCUI.ui.ViewComboBox({window: config.window})
                ]
            },
            config
        );

        NWCUI.ui.SeriesToggleToolbar.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.SeriesToggleToolbar::constructor(): Construction complete.');
    }
});