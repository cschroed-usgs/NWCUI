Ext.ns('NWCUI.data.convert');

NWCUI.data.convert.mgdToMmAcresPerDay = function(mgd){
    return mgd * 935.395;//conversion factor as determined by dblodgett
};
NWCUI.data.convert.mgdTableToMmPerDayTable = function(table, acres){
    var convertRow = function(row){
        return row.map(function(mgd){
            return NWCUI.data.convert.mgdToMmAcresPerDay(mgd) / acres;
        });
    };
    return table.map(convertRow);
};

NWCUI.data.convert.squareMilesToAcres = function(squareMiles){
    return squareMiles * 640.0;//conversion factor per http://en.wikipedia.org/wiki/Acre#Description
};