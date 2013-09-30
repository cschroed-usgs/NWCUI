Ext.ns('NWCUI.data');
/**
 * 
 * @param {XMLHttpResponse} Sos GetObservation ajax response
 * @returns {Array} a table of native data type results
 */
NWCUI.data.parseSosResponse = function(response){
        return NWCUI.data.parseSosResponseValues(
            NWCUI.data.getValuesFromSosResponse(response)
        );
};
/**
 * 
 * @param {XMLHttpResponse} Sos GetObservation ajax response
 * @returns {String} the values inside of the swe:values element
 */
NWCUI.data.getValuesFromSosResponse = function(response){
    var valuesTxt = $(response).find('swe\\:values').text();
    if (0 === valuesTxt.length){
        valuesTxt = $(response).find('values').text();
    }
    return valuesTxt;
};
/**
 * 
 * @param {String} valuesTxt the csv contained inside of the swe:values element of the GetObservation Response
 * @returns {Array} a table of native data type results
 */
NWCUI.data.parseSosResponseValues = function(valuesTxt){
    valuesTxt = valuesTxt.slice(0, valuesTxt.length-2);//kill terminal space and newline (' \n')
    var rows = valuesTxt.split(' ');
    var finalRows = [];
    var nonNanHasBeenFound = false;
    rows.each(function(row){
        var tokens = row.split(',');

        var dateStr = tokens[0].to(tokens[0].indexOf('T'));
        dateStr = dateStr.replace(/-/g,'/');
        dateStr = dateStr.trim();
        var value = parseFloat(tokens[1]);
        if(NWCUI.data.parseSosResponse.emptyValues.any(value)){
            value = NaN;
        }
        //Do not display leading NaNs in periods of record.
        //In other words:
        //Only add the parsed row to final rows if the current value is a number
        //or if the current value is NaN, but a previously-parsed value was a number

        if(!isNaN(value) || (isNaN(value) && nonNanHasBeenFound)){//could be optimized to use implicit logic, but this way is more intelligible
            finalRows.push([dateStr, value]);
            nonNanHasBeenFound = true;  //it is a number, 
        }
    });
    return finalRows;
};
NWCUI.data.parseSosResponse.emptyValues = [9.96921e+36, -999];//these values will be considered NaN's