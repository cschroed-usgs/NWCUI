Ext.ns('NWCUI.data');
NWCUI.data.parseSosResponse = function(responseTxt, numFieldsLoadedLater){
    responseTxt = responseTxt.slice(0, responseTxt.length-2);//kill terminal ' \n'
    var rows = responseTxt.split(' ');
    var rightPadding = [];
    for(var i = 0; i < numFieldsLoadedLater; i++){
        rightPadding.push(null);
    }
    var finalRows = [];
    var nonNanHasBeenFound = false;
    rows.each(function(row){
        var tokens = row.split(',');

        var dateStr = tokens[0].to(tokens[0].indexOf('T'));
        dateStr = dateStr.replace(/-/g,'/');
        var date = new Date(dateStr);
        var value = parseFloat(tokens[1]);
        if(NWCUI.data.parseSosResponse.emptyValueThreshold <= value){
            value = NaN;
        }
        //Do not display leading NaNs in periods of record.
        //In other words:
        //Only add the parsed row to final rows if the current value is a number
        //or if the current value is NaN, but a previously-parsed value was a number

        if(!isNaN(value) || (isNaN(value) && nonNanHasBeenFound)){//could be optimized to use implicit logic, but this way is more intelligible
            finalRows.push([date, value].concat(rightPadding));
            nonNanHasBeenFound = true;  //it is a number, 
        }
    });
    return finalRows;
};
NWCUI.data.parseSosResponse.emptyValueThreshold = 9.96921e+36;//any precip values above this amount will be considered NaN's
