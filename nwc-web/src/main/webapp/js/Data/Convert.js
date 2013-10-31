/*global Ext,LOG,CONFIG,NWCUI,$ */
Ext.ns('NWCUI.data.convert');

NWCUI.data.convert.mgdToMmAcresPerDay = function (mgd) {
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
/**
 * This function converts each entry of a table from million gallons per day per county to 
 * millimeter*acres per day and then scales by the number of acres in the county
 * to yield a table whose entries are all millimeters per day.
 * 
 * original table entry : (million gallons / day county)
 * final table entry : (mm / day)
 * 
 * @param {Array<Array>} table A table whose entries are in million gallons per day
 * @param {Number} acres The area of the county.
 * @returns {Array<Array>} the converted table
 */
NWCUI.data.convert.mgdTableToMmPerDayTable = function (table, acres) {
    var convertRow = function (row) {
        return row.map(function (mgdOrDate, index) {
            var potentiallyConvertedResult;
            //if it's a date
            if (0 === index) {
                potentiallyConvertedResult = mgdOrDate;
            } else {
                //if it's an mgd
                potentiallyConvertedResult = NWCUI.data.convert.mgdToMmAcresPerDay(mgdOrDate) / acres;
            }
            return potentiallyConvertedResult;
        });
    };
    return table.map(convertRow);
};

NWCUI.data.convert.squareMilesToAcres = function (squareMiles) {
    //conversion factor per http://en.wikipedia.org/wiki/Acre#Description
    var squareMilesToAcresConversionFactor = 640.0;
    return squareMiles * squareMilesToAcresConversionFactor;
};