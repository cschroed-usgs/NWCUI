Ext.ns("NWCUI.ui");
NWCUI.ui.SeriesToggleToolbar= Ext.extend(Ext.Toolbar, {
    menu: undefined,
    getSeriesTogglers: function(){
        return this.menu.getSeriesTogglers();
    },
    constructor: function(config) {
        var self = this;
        self.menu = new NWCUI.ui.SeriesToggleMenu();
        config = Ext.apply({
            items: [
                {text: 'Toggle Graph Series',
                 menu: self.menu
                }
            ]
        }, config);

        NWCUI.ui.SeriesToggleToolbar.superclass.constructor.call(this, config);
        LOG.info('NWCUI.ui.SeriesToggleToolbar::constructor(): Construction complete.');
    }
});