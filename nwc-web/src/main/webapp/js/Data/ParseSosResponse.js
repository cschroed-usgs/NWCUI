Ext.ns('NWCUI.data');
/**
 * @param {object} response
 * @returns {object} - an object with data and metadata fields
 */
NWCUI.data.parseSosResponse = function(response){
    var parser = new OpenLayers.Format.SOSGetObservation();
    var parsedSOS = parser.read(response);
    var parsedObject = {
        metadata: {
          seriesName : parsedSOS.observations[0].result.dataArray.dataRecord[1].name,
          seriesUnits : parsedSOS.observations[0].result.dataArray.dataRecord[1].uom
        },
        data: parsedSOS.observations[0].result.dataArray.values
    };

    //remove whitespace,
    //for date field, convert from ISO to regular date to avoid 
    //artificial timezone correction
    //for numerical value, parseFloat and convert 'missing' values to NaN
    var missingValues = [9.96921e+36, -999];
    parsedObject.data = parsedObject.data.map(function(datum){
        var dateStr = datum[0],
            numericalValue = parseFloat(datum[1]);

        if(missingValues.any(numericalValue)){
            numericalValue = NaN;
        }
        dateStr = dateStr.trim();
        var timeIndex = dateStr.indexOf('T');//ISO time marker
        dateStr = dateStr.slice(0, timeIndex);
        dateStr = dateStr.replace(/-/g, '/');

        return [dateStr, numericalValue];
    });
    return parsedObject;
};
NWCUI.data.parseSosResponse.emptyValueThreshold = 9.96921e+36;//any precip values above this amount will be considered NaN's
