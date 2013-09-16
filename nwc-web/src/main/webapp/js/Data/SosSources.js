Ext.ns('NWCUI.data');
NWCUI.data.SosSources = {
    dayMet: {
        observedProperty: 'MEAN_prcp',
        dataset: 'HUC12_data',
        fileName: 'HUC12_daymet.nc'
    },
    eta: {
        observedProperty: 'MEAN_et',
        dataset: 'HUC12_data',
        fileName: 'HUC12_eta_fixed.ncml'
    }
};
/**
 * @param {String} offering The offerring id as appears in SOS GetCapabilities
 * @param {String} observedProperty The property of the offering to return
 * @param {String} dataset The folder below the SOS provider namespace
 * @param {String} fileName The filename of the data of interest. The last 
 * component of the path prior to the arguments
 */
NWCUI.data.buildSosUrl = function(offering, observedProperty, dataset, fileName){
    var sosParams = {
        request: 'GetObservation',
        service: 'SOS',
        version: '1.0.0',
        observedProperty: observedProperty,
        offering: offering
    };
    return CONFIG.endpoint.threddsProxy + dataset + '/' + fileName + '?' + Ext.urlEncode(sosParams);
};
/**
 * @param {String} offerring The offerring id as appears in SOS GetCapabilities
 * @param {object - NWCUI.data.SosSources entry} source 
 */
NWCUI.data.buildSosUrlFromSource = function(offering, source){
    return NWCUI.data.buildSosUrl(offering, source.observedProperty, source.dataset, source.fileName);
};