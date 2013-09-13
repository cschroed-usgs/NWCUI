Ext.ns("NWCUI");
NWCUI.MapPanel = Ext.extend(GeoExt.MapPanel, {
    border: false,
    map: undefined,
    currentZoom: 0,
    nhdFlowlineLayername: 'glri:NHDFlowline',
    wmsGetFeatureInfoControl: undefined,
    WGS84_GOOGLE_MERCATOR: new OpenLayers.Projection("EPSG:900913"),
    sosEndpointUrl: undefined,//defined in displayDataWindow
    restrictedMapExtent: new OpenLayers.Bounds(-146.0698, 19.1647, -42.9301, 52.8949).transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")),
    streamOrderClipValue: 0,
    streamOrderTable: new Array(21),
    streamOrderSlider: undefined,
    streamOrderLock: true,
    streamOrderClipValues: undefined,
    fieldNames:{
        huc12Id : 'HUC_12',
        huc12Area: 'ACRES',
        huc12Name: 'HU_12_NAME'
    },
    constructor: function(config) {
        var self = this;
        LOG.debug('map.js::constructor()');
        var config = config || {};
        var mapLayers = [];
        var EPSG900913Options = {
            sphericalMercator: true,
            layers: "0",
            isBaseLayer: true,
            projection: this.WGS84_GOOGLE_MERCATOR,
            units: "m",
            buffer: 3,
            transitionEffect: 'resize'
        };
        // ////////////////////////////////////////////// BASE LAYERS
        var zyx = '/MapServer/tile/${z}/${y}/${x}';
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Light Gray Base",
                "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base" + zyx,
                Ext.apply(EPSG900913Options, {numZoomLevels: 14})
                ));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Topo Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map" + zyx,
                {isBaseLayer: true, units: "m"}));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Imagery",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery" + zyx,
                {isBaseLayer: true, units: "m"}));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Street Map",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map" + zyx,
                {isBaseLayer: true, units: "m"}));
        mapLayers.push(new OpenLayers.Layer.XYZ(
                "World Terrain Base",
                "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief" + zyx,
                Ext.apply(EPSG900913Options, {numZoomLevels: 14})
                ));

        // ////////////////////////////////////////////// FLOWLINES
        var flowlinesData = new OpenLayers.Layer.FlowlinesData(
                "Flowline WMS (Data)",
                CONFIG.endpoint.geoserver + 'gwc/service/wms'
                );
        flowlinesData.id = 'nhd-flowlines-data-layer';

        var flowlineRaster = new OpenLayers.Layer.FlowlinesRaster({
            name: "NHD Flowlines",
            dataLayer: flowlinesData,
            streamOrderClipValue: this.streamOrderClipValue
        });
        flowlineRaster.id = 'nhd-flowlines-raster-layer';

        // ////////////////////////////////////////////// GAGES
        var gageFeatureLayer = new OpenLayers.Layer.WMS("Gage Location",
                                   CONFIG.endpoint.geoserverProxy + 'NWC/wms',
                                   {
                                    LAYERS: 'NWC:gagesII',
                                    STYLES: '',
                                    format: 'image/png',
                                    tiled: true
                                    },
                                    {
                                        isBaseLayer : false,
                                        displayInLayerSwitcher: true
                                    }
    );

        gageFeatureLayer.id = 'gage-feature-layer';

		var hucLayer = new OpenLayers.Layer.WMS("National WBD Smnapshot",
			CONFIG.endpoint.geoserver + 'gwc/service/wms',
			{
				layers: 'NHDPlusHUCs:NationalWBDSnapshot',
				transparent: true,
				styles: ['polygon']
			}, {
				opacity: 0.3,
				isBaseLayer : false
			});
        mapLayers.push(hucLayer);
        mapLayers.push(gageFeatureLayer);
        mapLayers.push(flowlinesData);
        mapLayers.push(flowlineRaster);

        // MAP
        this.map = new OpenLayers.Map({
            restrictedExtent: this.restrictedMapExtent,
            projection: this.WGS84_GOOGLE_MERCATOR,
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.MousePosition({
                    prefix: 'POS: '
                }),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true
                }),
                new OpenLayers.Control.LayerSwitcher({
                    roundedCorner: true
                }),
                new OpenLayers.Control.Zoom()
            ],
            isValidZoomLevel: function(zoomLevel) {
                return zoomLevel && zoomLevel >= this.getZoomForExtent(this.restrictedExtent) && zoomLevel < this.getNumZoomLevels();
            }
        });
        config = Ext.apply({
            id: 'map-panel',
            region: 'center',
            map: this.map,
            prettyStateKeys: true,
            layers: new GeoExt.data.LayerStore({
                initDir: GeoExt.data.LayerStore.STORE_TO_MAP,
                map: this.map,
                layers: mapLayers
            }),
            border: false,
            listeners: {
                added: function(panel, owner, idx) {

                    // Turn layer switcher on by default
                    CONFIG.mapPanel.map.getControlsByClass('OpenLayers.Control.LayerSwitcher')[0].maximizeControl();

                    var clipCount = 7;
                    var zoomLevels = CONFIG.mapPanel.map.getNumZoomLevels();
                    panel.streamOrderClipValues = new Array(zoomLevels);
                    var tableLength = panel.streamOrderClipValues.length;

                    for (var cInd = 0; cInd < tableLength; cInd++) {
                        panel.streamOrderClipValues[cInd] = Math.ceil((tableLength - cInd) * (clipCount / tableLength));
                    }

                    panel.map.events.register(
                            'zoomend',
                            panel.map,
                            function() {
                                var zoom = panel.map.zoom;
                                LOG.info('Current map zoom: ' + zoom);
                                panel.updateFromClipValue(panel.getClipValueForZoom(zoom));

// To be used in a future release
//                                var getFeatureResponses = Object.extended();
//                                if (!localStorage.getItem('glri-NWCUI')) {
//                                    localStorage.setItem('glri-NWCUI', Ext.util.JSON.encode({
//                                        lookupTable: Array.create([[], [], [], [], [], []])
//                                    }));
//                                }
//                                var storageObject = Ext.util.JSON.decode(localStorage.getItem('glri-NWCUI'));
                                // Check to see if we have the lookup table for clip order values at the current clip value. If we do we don't need to
                                // make the call again. If we don't, make a call to get the values for the lookup table, create the lookup table
//                                if (!storageObject.lookupTable[panel.streamOrderClipValue - 1].length) {
//                                    var needed = []
//                                    for (var i = panel.streamOrderClipValue;i < storageObject.lookupTable.length + 1;i++) {
//                                        if (!storageObject.lookupTable[i - 1].length) {
//                                            needed.push(i);
//                                        }
//                                    }
//                                    var filter = "StreamOrde IN ('" + needed.join("','") + "')";
//                                    Ext.Ajax.request({
//                                        url: CONFIG.endpoint.geoserver + 'ows',
//                                        scope: getFeatureResponses,
//                                        method: 'GET',
//                                        params: {
//                                            service: 'WFS',
//                                            version: '1.1.0',
//                                            outputFormat: 'json',
//                                            request: 'GetFeature',
//                                            typeName: panel.nhdFlowlineLayername,
//                                            propertyName: 'StreamOrde,Hydroseq',
//                                            sortBy: 'Hydroseq',
//                                            'CQL_FILTER': filter
//                                        },
//                                        success: function(response, opts) {
//                                            this.streamOrder = Ext.util.JSON.decode(response.responseText);
//                                            Ext.Ajax.request({
//                                                url: CONFIG.endpoint.geoserver + 'ows',
//                                                scope: this,
//                                                method: 'GET',
//                                                params: {
//                                                    service: 'WFS',
//                                                    version: '1.1.0',
//                                                    outputFormat: 'json',
//                                                    request: 'GetFeature',
//                                                    typeName: panel.nhdFlowlineLayername,
//                                                    propertyName: 'StreamLeve,StreamOrde,Hydroseq',
//                                                    sortBy: 'Hydroseq',
//                                                    'CQL_FILTER': filter
//                                                },
//                                                success: function(response, opts) {
//                                                    this.streamLevel = Ext.util.JSON.decode(response.responseText);
//                                                    var storageObject = Ext.util.JSON.decode(localStorage.getItem('glri-NWCUI'));
//
//                                                    for (var i = 0; i < 6; i++) {
//                                                        if (!storageObject.lookupTable[i].length) {
//                                                            var soSublist = this.streamOrder.features.findAll(function(j) {
//                                                                return j.properties.StreamOrde === (i + 1);
//                                                            });
//
//                                                            for (var soInd = 0; soInd < soSublist.length; soInd++) {
//                                                                var seq = soSublist[soInd].properties.Hydroseq;
//                                                                var order = soSublist[soInd].properties.StreamOrde;
//                                                                var level = soSublist[soInd].properties.StreamLeve;
//
//                                                                storageObject.lookupTable[order - 1].push([seq, order, level])
//                                                            }
//                                                        }
//                                                    }
//
//
//                                                    localStorage.setItem('glri-NWCUI', Ext.util.JSON.encode(storageObject));
//                                                }
//                                            });
//                                        }
//                                    });
//                                }

                            },
                            true);

                    var mapZoomForExtent = panel.map.getZoomForExtent(panel.map.restrictedExtent);
                    panel.map.setCenter(panel.map.restrictedExtent.getCenterLonLat(), mapZoomForExtent);
                    panel.updateFromClipValue(panel.streamOrderClipValues[panel.map.zoom]);

                },
                afterrender: self.showAttributionSplash
            }
        }, config);
        NWCUI.MapPanel.superclass.constructor.call(this, config);

        LOG.info('map.js::constructor(): Construction complete.');

        this.wmsGetFeatureInfoControl = new OpenLayers.Control.WMSGetFeatureInfo({
            title: 'gage-identify-control',
            hover: false,
            autoActivate: true,
            layers: [
                hucLayer
            ],
            queryVisible: true,
            output: 'object',
            drillDown: true,
            infoFormat: 'application/vnd.ogc.gml',
            vendorParams: {
                radius: 5
            }
        });
        this.wmsGetFeatureInfoControl.events.register("getfeatureinfo", this, this.wmsGetFeatureInfoHandler);
        this.map.addControl(this.wmsGetFeatureInfoControl);
},
    showAttributionSplash: function(){
        var slogan = 'Data furnished by the USGS and WaterSMART.';
        var attribPopupTimeout = 3000;

        var makeAttribEntry = function(attribution){
            return '<a target="_blank" class="no_hover_change" href="' + attribution.link + '">' +
                    '<img src="' + attribution.logo +'"/>' +
                    '</a>';
        };

        var html = '<div class="attribution_splash">';
        Ext.iterate(CONFIG.attribution, function(orgId, attribution){
           html+=makeAttribEntry(attribution);
        });
        html += '</div>' +
        '<div class="attribution_text">'+ slogan +'</div>';

        var msgWidth = 400;

        Ext.Msg.show({
            title: 'Loading...',
            msg: html,
            width: msgWidth
        });
        var attribPopup = Ext.Msg.getDialog();
        var closeAttribPopup = function(){
            attribPopup.close();
        }
        setTimeout(closeAttribPopup, attribPopupTimeout);
    },
    /**
     *@param statsStores - array of StatStores
     *@param success - whether or not the request was successful
     */
    statsCallback : function(statsStores, success) {
            var self = this;
            var win = self.dataWindow;
            if(win.isVisible()){//else, if the user has already closed the window, skip everything
                if(!success || !statsStores){
                    new Ext.ux.Notify({
                        msgWidth: 200,
                        title: 'Error',
                        msg: "Error retrieving data from server. See browser logs for details."
                    }).show(document);
                    return;
                }

                //put stores into a title-to-store map for convenient access later
                var tempStores = {};
                statsStores.each(function(store){
                   tempStores[store.title] = store;
                });
                statsStores = tempStores;

                var data = win.graphPanel.data.values;

                var decileValues = [];//this will be appended onto the end of every row of the new data
                statsStores.deciles.each(function(record){
                   decileValues.push(record.get('q'));
                });

                /**
                 * Declare some constants to be used in the table update:
                 *
                 * - Variables with 'Index' in the name are indexing columns in the
                 * array of arrays that we will pass to Dygraphs
                 *
                 * - Variables with 'ColumnName' in the name refer to field names in the StatStores
                 *
                 */

                var dateIndex = 0,
                    annualMeanIndex = 2,
                    annualMedianIndex = 3,
                    monthlyMeanIndex = 4,
                    monthlyMedianIndex = 5,
                    lowestDecileIndex = 6,
                    highestDecileIndex = 15,
                    yearColumnName = 'Year', //these are the column names returned by the RWPS call
                    monthColumnName = 'Month',
                    meanFlowColumnName = 'meanq',
                    medianFlowColumnName = 'medianq';

                data = data.map(function(row){
                    var month = row[dateIndex].getMonth();
                    //native javascript months are 0-indexed
                    //but the RWPS process feeds the stats store a 1-based month index.
                    //so...
                    var extStoreMonth = month+1;
                    var isJanuary = 0 === month;
                    if(isJanuary){
                        //add the annual stats
                        var year = row[dateIndex].getFullYear();
                        row[annualMeanIndex] = statsStores.mean_annual_flow.query(yearColumnName, year).first().get(meanFlowColumnName);
                        row[annualMedianIndex] = statsStores.median_annual_flow.query(yearColumnName, year).first().get(medianFlowColumnName);
                    }
                    //use the ext-adjusted storeMonth in the statsStores queries
                    row[monthlyMeanIndex] = statsStores.mean_monthly_flow.query(monthColumnName, extStoreMonth).first().get(meanFlowColumnName);
                    row[monthlyMedianIndex] = statsStores.median_monthly_flow.query(monthColumnName, extStoreMonth).first().get(medianFlowColumnName);
                    //append the deciles to the end of the row
                    for(var i = lowestDecileIndex; i < highestDecileIndex; i++){
                        row[i] = decileValues[i-lowestDecileIndex];
                    }
                    return row;
                });

                var headers = win.graphPanel.data.headers;

                win.graphPanel.graph.updateOptions({
                   labels: headers,
                   file: data
                });

                //now enable the series toggle buttons
                var tbar = win.getTopToolbar()
                var checkedItems = tbar.getSeriesTogglers();
                checkedItems.each(function(checkedItem){
                    checkedItem.enable();
                    checkedItem.fireEvent('checkchange', checkedItem,
                                            checkedItem.initialConfig.checked,
                                            win.graphPanel.graph,
                                            tbar.menu
                                        );
                });
            }
        },
    buildSosUrl: function(offering, observedProperty, dataset, fileName){
        var sosParams = {
            request: 'GetObservation',
            service: 'SOS',
            version: '1.0.0',
            observedProperty: observedProperty,
            offering: offering
        };
        return CONFIG.endpoint.threddsProxy + dataset + '/' + fileName + '?' + Ext.urlEncode(sosParams);
    },
    sosSuccess: function(windowTitle, allAjaxResponseArgs){
        var self = this,
            errorsFound = false,
            labeledResponses = {};
    
        $.each(allAjaxResponseArgs, function(index, ajaxResponseArgs){
            var responseDoc = ajaxResponseArgs[0];
            if(null === responseDoc){
                errorsFound = true;
                return false;//exit iteration
            }
            else{
                //the jqXHR object is the 3rd arg of response
                //the object has been augmented with a label property
                //by self.makeLabeledAjaxCall
                var jqXHR = ajaxResponseArgs[2],
                label = jqXHR.label;
                labeledResponses[label] = self.parseSosResponse.apply(this, ajaxResponseArgs);
            }
        });
        if(errorsFound){
            self.sosError.apply(self, allAjaxResponseArgs);
        }
        else{
            //check to see if a data window already exists. If so, destroy it.
            var dataDisplayWindow = Ext.ComponentMgr.get('data-display-window');
            if (dataDisplayWindow) {
                LOG.debug('Removing previous data display window');
                dataDisplayWindow.destroy();
            }

            var win = new NWCUI.ui.DataWindow({
                id: 'data-display-window',
                title: windowTitle
            });
            win.show();
            win.center();
            win.toFront();
            var dataSeriesStore = new NWCUI.data.DataSeriesStore(labeledResponses);
            var graphDiv = win.graphPanel.getEl().dom;
            var legendDiv = win.labelPanel.getEl().dom;
            var graph = new NWCUI.ui.Graph(graphDiv, legendDiv, dataSeriesStore);
            win.doLayout();
        }
    },
    sosError: function(){
        //make arguments into a true array
        var allAjaxResponseArgsArray = Array.create(arguments);
        var allErrorAjaxResponseArgs = allAjaxResponseArgsArray.filter(function(response){
            var responseDoc = response[0],
                status = response[1];
            
            return (null === responseDoc) || ('success' !== status);
        });
        var errorReport = '<p>The following attempts to retrieve sensor observations failed:</p>';
        allErrorAjaxResponseArgs.each(function(errorAjaxResponseArgs){
            var jqXHR = errorAjaxResponseArgs[2];
            
            errorReport += '<p>Resource id: "' + jqXHR.label + '"url: ' + jqXHR.url + '</p>';
        });
        NWCUI.ui.errorNotify(errorReport);
    },
    makeLabeledAjaxCall: function(url, label){
        var call = $.ajax(url);
        call.label = label;
        call.url = url;
        return call;
    },
    /**
     * @param record - a reach's record.
     *
     */
    displayDataWindow: function(record){
        var self = this;
        var offering = record.data[self.fieldNames.huc12Id];
        var huc12Name = record.data[self.fieldNames.huc12Name] || "";
        var huc12Id = record.data[self.fieldNames.huc12Id] || "";
        var title = huc12Name.length ? huc12Name + " - " : "";
        title += huc12Id;
        var labeledAjaxCalls = [];
        
        Ext.iterate(NWCUI.data.SosSources, function(id, metadata){
           var url = self.buildSosUrl(offering, metadata.observedProperty, metadata.dataset, metadata.fileName);
           var labeledAjaxCall = self.makeLabeledAjaxCall(url, id);
           labeledAjaxCalls.push(labeledAjaxCall);
        });

        /**
         * gets the arguments for a standard jquery ajax callback
         * and injects the title into the real callback
         */
        var sosSuccessWrapper = function(){
            self.sosSuccess(title, arguments);
        };
        //run all ajax calls and execute the callback 
        $.when.apply(self, labeledAjaxCalls).then(
            sosSuccessWrapper,
            self.sosError
        );
    },
    wmsGetFeatureInfoHandler: function(responseObject) {
        var self = this;
        var popup = Ext.ComponentMgr.get('identify-popup-window');
        var dataDisplayWindow = Ext.ComponentMgr.get('data-display-window');
        if (popup) {
            popup.destroy();
        }
        if (dataDisplayWindow) {
            dataDisplayWindow.destroy();
        }

        var features = responseObject.features[0].features;

        //prepare field definitions for Ext Store contructors:
        var hucFields = [
                {name: self.fieldNames.huc12Id, type: 'string'},
                {name: self.fieldNames.huc12Name, type: 'string'},
                {name: self.fieldNames.huc12Area, type: 'long'}
            ];


        var huc12FeatureStore = new GeoExt.data.FeatureStore({
            features: features,
            fields: hucFields,
            initDir: 0
        });

            var featureSelectionModel = new GeoExt.grid.FeatureSelectionModel({
                layerFromStore: true,
                singleSelect: true
            });
            featureSelectionModel.on({
                'rowselect' : {
                    fn : function(obj, rowIndex, record) { self.displayDataWindow(record); },
                    delay: 100
                 }
             });

            if (huc12FeatureStore.totalLength) {
                var columnConfig ={};

                columnConfig[self.fieldNames.huc12Id] = {header: 'HUC12'};
                columnConfig[self.fieldNames.huc12Name] = {header: 'HUC12 Name'};
                columnConfig[self.fieldNames.huc12Area] = {header: 'Area (Acres)'};

                var featureGrid = new gxp.grid.FeatureGrid({
                    id: 'identify-popup-grid-flowline',
                    store: huc12FeatureStore,
                    region: 'center',
                    autoHeight: true,
                    deferRowRender: false,
                    forceLayout: true,
                    sm: featureSelectionModel,
                    viewConfig: {
                        autoFill: true,
                        forceFit: true
                    },
                    columnConfig: columnConfig
                });

                popup = new GeoExt.Popup({
                    id: 'identify-popup-window',
                    anchored: false,
                    layout: 'fit',
                    map: CONFIG.mapPanel.map,
                    unpinnable: true,
                    minWidth: 400,
                    minHeight: 200,
                    title: 'HUC12 Selection',
                    items: [featureGrid],
                    listeners: {
                        show: function() {
                            // Remove the anchor element (setting anchored to
                            // false does not do this for us. *Shaking fist @ GeoExt)
                            Ext.select('.gx-popup-anc').remove();
                            this.syncSize();
                            this.setHeight(featureGrid.getHeight());
                            this.setHeight(featureGrid.getWidth());
                        }
                    }

                });
                popup.show();
            }
    },
    getClipValueForZoom: function(zoom) {
        return this.streamOrderClipValues[zoom];
    },
    setClipValueForZoom: function(zoom, value) {
        if (this.streamOrderLock === true) {
            for (var zoomIndex = 0; zoomIndex < this.streamOrderTable.length; ++zoomIndex) {
                if (zoomIndex < zoom) {
                    if (this.streamOrderTable[zoomIndex].getValue() < value) {
                        this.streamOrderTable[zoomIndex].setValue(value);
                    }
                } else if (zoomIndex > zoom) {
                    if (this.streamOrderTable[zoomIndex].getValue() > value) {
                        this.streamOrderTable[zoomIndex].setValue(value);
                    }
                } else {
                    this.streamOrderTable[zoomIndex].setValue(value);
                }
            }
        } else {
            this.streamOrderTable[zoom].setValue(value);
        }
    },
    updateFromClipValue: function(val) {
        this.streamOrderClipValue = val;
        for (var layerIdx = 0; layerIdx < this.map.layers.length; layerIdx++) {
            var mapLayer = this.map.layers[layerIdx];
            if (typeof mapLayer.updateFromClipValue === 'function') {
                mapLayer.updateFromClipValue(val);
            }
        }
    }
});
