/*
 * 
 * @src: http://dev.openlayers.org/releases/OpenLayers-2.13.1/theme/default/style.css
 */
//Creation of a custom panel with a ZoomBox control with the alwaysZoom option sets to true				
OpenLayers.Control.CustomNavToolbar = OpenLayers.Class(OpenLayers.Control.Panel, {

    /**
     * Constructor: OpenLayers.Control.NavToolbar 
     * Add our two mousedefaults controls.
     *
     * Parameters:
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */


    initialize: function(options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([
          new OpenLayers.Control.Navigation(),
          new OpenLayers.Control.ZoomBox(),
          new OpenLayers.Control.Button({
             displayClass: "MyButton",
             trigger: function(){
                 console.dir(arguments);
                 alert("hi!");
             }
          })
        ]);
        // To make the custom navtoolbar use the regular navtoolbar style
        this.displayClass = 'olControlNavToolbar';
    },



    /**
     * Method: draw 
     * calls the default draw, and then activates mouse defaults.
     */
    draw: function() {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
this.defaultControl = this.controls[0];
        return div;
    }
});