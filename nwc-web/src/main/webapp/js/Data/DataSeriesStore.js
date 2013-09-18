Ext.ns('NWCUI.data');
NWCUI.data.DataSeries = function(){
        return {
            metadata: {
                seriesLabels : ['Date']
            },
            data: []
        };
 };

/**
 * Given mixed frequency data series metadata and data, converts it to 
 * monthly and daily series for Graph to consume.
 * @returns {undefined}
 */
NWCUI.data.DataSeriesStore = function(series){
    var self = this;
    self.daily = new NWCUI.data.DataSeries();
    self.monthly = new NWCUI.data.DataSeries();
    var validSeriesObject = function(series){
        //verify that all of the keys *SosSources* are present in *series*;
        var seriesKeys = Object.keys(series);
        return seriesKeys.union(Object.keys(NWCUI.data.SosSources)).length === seriesKeys.length;
    };
    var addSeriesLabel = function(seriesClass, metadata){
        self[seriesClass].metadata.seriesLabels.push(
                metadata.seriesName + ' (' + metadata.seriesUnits + ')'
        );
    };
    var updateDailySeries = function(series){
        var dailyTable = [],
            etaIndex = 0,
            etaForCurrentMonth = NaN,
            dayMetSeries = series.dayMet,
            etaSeries = series.eta;
    
        Ext.each(dayMetSeries.data, function(dayMetRow){
            var dayMetDateStr = dayMetRow[0],
                dayMetValue = dayMetRow[1],
                dayIndexInString = dayMetDateStr.lastIndexOf('/') + 1,
                dayMetDay = dayMetDateStr.substr(dayIndexInString, 2);
            if('01' === dayMetDay){
                var etaRow = etaSeries.data[etaIndex];
                if(etaRow){
                    var etaDateStr = etaRow[0];
                    var etaValue = etaRow[1];
                    if(etaDateStr === dayMetDateStr){
                        etaForCurrentMonth = etaValue;
                        etaIndex++;
                    }
                }//else we have fallen off the end of the eta array
            }
            var date = new Date(dayMetDateStr);
            var averageDailyEta = etaForCurrentMonth / date.daysInMonth();
            dailyTable.push([date, dayMetValue, averageDailyEta]);
        });
        self.daily.data = dailyTable;

        addSeriesLabel('daily', dayMetSeries.metadata);
        addSeriesLabel('daily', etaSeries.metadata);
    };
    var updateMonthlySeries = function(series){
        var monthlyTable = [],
            etaIndex = 0,
            etaForCurrentMonth = NaN,
            dayMetSeries = series.dayMet,
            monthlyAccumulation = 0,
            firstMonthOfPeriodOfRecord = true,
            monthDateStr = '',//stored at the beginning of every month, used later once the totals have been accumulated for the month
            etaSeries = series.eta;
    
        Ext.each(dayMetSeries.data, function(dayMetRow){
            var dayMetDateStr = dayMetRow[0],
                dayMetValue = dayMetRow[1],
                dayIndexInString = dayMetDateStr.lastIndexOf('/') + 1,
                dayMetDay = dayMetDateStr.substr(dayIndexInString, 2);
            if('01' === dayMetDay){
                if(firstMonthOfPeriodOfRecord){
                    firstMonthOfPeriodOfRecord = false;
                }
                else{
                    //join the date, accumulation and the eta for last month
                    var etaRow = etaSeries.data[etaIndex];
                    if(etaRow){
                        var etaDateStr = etaRow[0];
                        var etaValue = etaRow[1];
                        if(etaDateStr === monthDateStr){
                            etaForCurrentMonth = etaValue;
                            etaIndex++;
                        }
                    }//else we have fallen off the end of the eta array
                    var date = new Date(monthDateStr);
                    monthlyTable.push([date, monthlyAccumulation, etaForCurrentMonth]);
                    monthlyAccumulation = 0;
                }
                monthDateStr = dayMetDateStr;
            }
            
            monthlyAccumulation = (monthlyAccumulation + dayMetValue).round(9);//minimize floating-point errors from accumulating

        });
        self.monthly.data = monthlyTable;

        addSeriesLabel('monthly', dayMetSeries.metadata);
        addSeriesLabel('monthly', etaSeries.metadata);
    };
    var updateDataSeries = function(series){
        if(validSeriesObject(series)){
            updateDailySeries(series);
            updateMonthlySeries(series);
        }
        else{
            throw new Error("Invalid data series format.");
        }
    };
    
    
    updateDataSeries(series);
};