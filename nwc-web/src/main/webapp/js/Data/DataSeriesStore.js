Ext.ns('NWCUI.data');
/**
 * Given mixed frequency data series metadata and data, converts it to 
 * monthly and daily series for Graph to consume.
 * @returns {undefined}
 */
NWCUI.data.DataSeriesStore = function(series){
    var self = this;
    var defaultSeriesObject = function(){
        return {
            metadata: {
                seriesLabels : ['Date']
            },
            data: []
        };
    };
    self.daily = defaultSeriesObject();
    self.monthly = defaultSeriesObject();
    var validSeriesObject = function(series){
        //verify that all of the keys *SosSources* are present in *series*;
        var seriesKeys = Object.keys(series);
        return seriesKeys.union(Object.keys(NWCUI.data.SosSources)).length === seriesKeys.length;
    };
    var updateDailySeries = function(series){
        var dailyTable = [],
            etaIndex = 0,
            etaForCurrentMonth = NaN,
            dayMetSeries = series.dayMet,
            etaSeries = series.eta;
    
        Ext.each(dayMetSeries.data, function(dayMetRow){
            var dayMetDate = dayMetRow[0],
                dayMetValue = dayMetRow[1],
                dayIndexInString = dayMetDate.lastIndexOf('/') + 1,
                dayMetDay = dayMetDate.substr(dayIndexInString, 2);
            if('01' === dayMetDay){
                var etaRow = etaSeries.data[etaIndex];
                if(etaRow){
                    var etaDate = etaRow[0];
                    var etaValue = etaRow[1];
                    if(etaDate === dayMetDate){
                        etaForCurrentMonth = etaValue;
                        etaIndex++;
                    }
                }//else we have fallen off the end of the eta array
            }
            dailyTable.push([dayMetDate, dayMetValue, etaForCurrentMonth]);
        });
        self.daily.data = dailyTable;
        var addSeriesLabel = function(metadata){
            self.daily.metadata.seriesLabels.push(
                    metadata.seriesName + ' (' + metadata.seriesUnits + ')'
            );
        };
        addSeriesLabel(dayMetSeries.metadata);
        addSeriesLabel(etaSeries.metadata);
    };
    var updateMonthlySeries = function(series){
        
    };
    var updateDataSeries = function(series){
        if(validSeriesObject(series)){
            updateDailySeries(series);
        }
        else{
            throw new Error("Invalid data series format.");
        }
    };
    
    
    updateDailySeries(series);
};