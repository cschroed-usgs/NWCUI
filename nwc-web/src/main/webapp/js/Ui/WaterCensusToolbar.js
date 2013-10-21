OpenLayers.Control.WaterCensusToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {
    /**
     * Constructor: OpenLayers.Control.NavToolbar 
     * Add our two mousedefaults controls.
     *
     * Parameters:
     * @param {Object} object an optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        this.addControls([
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.ZoomBox(),
            new OpenLayers.Control.BioSitesSelectionTool(),
            new OpenLayers.Control.HucSelectionTool()
        ]);
        // To make the custom navtoolbar use the regular navtoolbar style
        this.displayClass = 'olControlWaterCensusToolbar';
    },
    /**
     * Method: draw 
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function () {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.defaultControl = this.controls[0];
        return div;
    }
});

OpenLayers.Control.HucSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.HucSelectionTool';
    exports.underlyingControlId = 'hucs';
    exports.mapLayerId = 'huc-feature-layer';
    exports.handler = {
        click: function () {
            console.dir(arguments);
            alert('hi!');
        },
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(exports.mapLayerId).setVisibility(true);
        },
        deactivate: function () {
            exports.map.getControl(exports.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));

OpenLayers.Control.BioSitesSelectionTool = OpenLayers.Class(OpenLayers.Control, (function () {
    var exports = {};
    exports.type = OpenLayers.Control.TYPE_TOOL;
    exports.CLASS_NAME = 'OpenLayers.Control.BioSitesSelectionTool';
    exports.underlyingControlId = 'bioDataSites';
    exports.mapLayerId = 'biodata-sites-feature-layer';
    exports.handler = {
        click: function () {
            console.dir(arguments);
            alert('hi!');
        },
        setMap: function (map) {
            exports.map = map;
        },
        activate: function () {
            exports.map.getLayer(exports.mapLayerId).setVisibility(true);
            exports.map.getControl(exports.underlyingControlId).activate();

        },
        deactivate: function () {
            exports.map.getControl(exports.underlyingControlId).deactivate();
        }
    };
    exports.initialize = function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.events.register('click', null, this.handler);
    };
    return exports;
}()));