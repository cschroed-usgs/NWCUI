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
        var values = [];
        var containsNaN = false;
        var value;
        tokens.each(function(){
            value = parseFloat(tokens[1]);
            //if NaN of NaN-ish:
            if(isNaN(value) || NWCUI.data.parseSosResponse.emptyValues.any(value)){
                containsNaN = true;
                //if the any value in a row is NaN, all values will be considered NaN
                values = tokens.from(1).map(function(){
                   return NaN;
                });
                return false; //stop iteration through tokens
           }
           else{
               values.push(value);
           }
            
        }, 1);//start at 1 because date is token[0]
        
        //Do not display leading NaN values in periods of record.
        //In other words:
        //Only add the parsed row to final rows if the current row contains no 
        //NaN(s) or if the current row does contain NaN(s), but a 
        //previously-parsed row in the period of record contained no NaN(s)
        if(!containsNaN || (containsNaN && nonNanHasBeenFound)){//could be optimized to use implicit logic, but this way is more intelligible
            finalRows.push([dateStr].concat(values));
            nonNanHasBeenFound = true;  //it is a number, 
        }
    });
    return finalRows;
};
NWCUI.data.parseSosResponse.emptyValues = [9.96921e+36, -999];//these values will be considered NaN's