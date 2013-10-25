Ext.ns('NWCUI.data.convert');

NWCUI.data.convert.mgdToMmAcresPerDay = function(mgd){
    return mgd * 935.395;//conversion factor as determined by dblodgett
};
NWCUI.data.convert.mgdTableToMmPerDayTable = function(table, acres){
    var convertRow = function(row){
        return row.map(function(mgdOrDate, index){
            if (0 === index) {//it's a date
                return mgdOrDate;
            }
            else {//its an mgd
                return NWCUI.data.convert.mgdToMmAcresPerDay(mgdOrDate) / acres;
            }
        });
    };
    return table.map(convertRow);
};

NWCUI.data.convert.squareMilesToAcres = function(squareMiles){
    return squareMiles * 640.0;//conversion factor per http://en.wikipedia.org/wiki/Acre#Description
};