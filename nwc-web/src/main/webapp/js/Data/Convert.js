Ext.ns('NWCUI.data.convert');

NWCUI.data.convert.mgdToMmAcresPerDay = function(mgd){
    /**
     * Dimensional analysis for conversion factor as determined by dblodgett
     * 
     * Million Gallons      1 000 000           1 m^3               1 acre          1000 mm
     * _______________  *   _________   *   _______________ *   _____________   *   ________    = 935.395 mm*acres/day
     *      day             1 million       264.172 gallons     4046.86 m^2           1 m                     
     */
    var mgdToMmAcresPerDayConversionFactor = 935.395;
    return mgd * mgdToMmAcresPerDayConversionFactor;
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