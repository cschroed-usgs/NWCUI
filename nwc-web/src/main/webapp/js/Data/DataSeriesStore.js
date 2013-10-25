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
NWCUI.data.DataSeriesStore = function () {
    var self = this;
    self.daily = new NWCUI.data.DataSeries();
    self.monthly = new NWCUI.data.DataSeries();
    var addSeriesLabel = function(seriesClass, metadata){
        self[seriesClass].metadata.seriesLabels.push(
                metadata.seriesName + ' (' + metadata.seriesUnits + ')'
        );
    };
    var updateDailyHucSeries = function (series) {
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
    var updateMonthlyHucSeries = function (series) {
        var monthlyTable = [],
            etaIndex = 0,
            etaForCurrentMonth = NaN,
            dayMetSeries = series.dayMet,
            monthlyAccumulation = 0,
            firstMonthOfPeriodOfRecord = true,
            monthDateStr = '',//stored at the beginning of every month, used later once the totals have been accumulated for the month
            endOfMonth,//stores the end of the current month of iteration
            etaSeries = series.eta;
            
            
        Ext.each(dayMetSeries.data, function(dayMetRow){
            var dayMetDateStr = dayMetRow[0],
                dayMetValue = dayMetRow[1],
                dayIndexInString = dayMetDateStr.lastIndexOf('/') + 1,
                dayMetDay = Number(dayMetDateStr.substr(dayIndexInString, 2));
            if(undefined === endOfMonth){
                endOfMonth = Date.create(dayMetDateStr).daysInMonth();
                monthDateStr = dayMetDateStr;
            }
            monthlyAccumulation = (monthlyAccumulation + dayMetValue).round(9);//minimize floating-point errors from accumulating
            if(dayMetDay === endOfMonth){
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
                //reset for the next months
                monthlyAccumulation = 0;
                endOfMonth = undefined;
            }
        });
        self.monthly.data = monthlyTable;

        addSeriesLabel('monthly', dayMetSeries.metadata);
        addSeriesLabel('monthly', etaSeries.metadata);
    };
    /**
     * @param {Map<String, NWCUI.data.DataSeries>} seriesHash A hash of series id to
     * DataSeries objects
     */
    self.updateHucSeries = function (seriesHash) {
        updateDailyHucSeries(seriesHash);
        updateMonthlyHucSeries(seriesHash);
    };
   /**
     * @param {Map<String, NWCUI.data.DataSeries>} series A hash of series id to
     * DataSeries objects
     */
    self.updateWaterUseSeries = function (seriesHash) {
        updateDailyWaterUseSeries(seriesHash);
        updateMonthlyWaterUseSeries(seriesHash);
    };
};