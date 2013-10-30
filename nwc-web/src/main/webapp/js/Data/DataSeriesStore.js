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
    var getRowDate = function (row) {
        var date,
            dateString,
            dateIndexInRow = 0;
        if (row && row[dateIndexInRow]) {
            dateString = row[dateIndexInRow];
            date = new Date(dateString);
            if (!date.isValid()) {
                throw new Error("invalid date specified");
            }
        }
        else {
            throw new Error("empty or undefined row");
        }
        return date;
    };
    var getRowValuesWithoutDate = function (row) {
        var startOfValuesIndex = 1;
        return row.from(startOfValuesIndex);
    };
    var nextWaterUseRowIndex = 0;   //this always points at the next row, not the current one
    var getNextWaterUseRow = function (waterUseSeries) {
        var nextWaterUseRow = waterUseSeries.data[nextWaterUseRowIndex];
        nextWaterUseRowIndex++;
        return nextWaterUseRow;
    };
    var addDefaultTimeIncrement = function (date) {
        return date.advance(NWCUI.data.SosSources.countyWaterUse.defaultTimeIncrement);
    };
    /**
     * @param {NWCUI.data.DataSeries} waterUseSeries
     * @param {NWCUI.data.DataSeries} existingTimeSeries
     */
    self.mergeWaterUseSeriesIntoExistingTimeSeries = function (waterUseSeries, existingTimeSeries) {
        //first merge data into daily data series
        //
        //IMPORTANT: re-init the water use row counter
        nextWaterUseRowIndex = 0;
        
        var nextWaterUseRow = getNextWaterUseRow(waterUseSeries);
        var nextWaterUseDate = getRowDate(nextWaterUseRow);
        var nextWaterUseValues = getRowValuesWithoutDate(nextWaterUseRow);
        
        //initially fill an array of length == firstRow.length-1 with NaN's 
        //this var will be updated throughout the loop
        var valuesToAppendToRow = nextWaterUseValues.map(function(){
            return NaN;
        });
        var lastWaterUseValuesHaveBeenJoinedToTimeSeries = false;
        existingTimeSeries.data = existingTimeSeries.data.map(function (row) {
            var rowDate = getRowDate(row);
            if(rowDate.is(nextWaterUseDate)){
                //update current values to append to rows
                valuesToAppendToRow = nextWaterUseValues.clone();
                
                //now update info that will be used on+for next date discovery
                nextWaterUseRow = getNextWaterUseRow(waterUseSeries);
                //if you have more water use rows
                if (nextWaterUseRow) {
                    nextWaterUseDate = getRowDate(nextWaterUseRow);
                    nextWaterUseValues = getRowValuesWithoutDate(nextWaterUseRow);
                }
                //if you have no more water use rows to join in
                else{
                    /*
                     * if you have joined the last water use row's values into 
                     * the time series for the duration of the defaultTimeIncrement
                     * then you need to join NaN values to the rest of the time series.
                     */
                    if (lastWaterUseValuesHaveBeenJoinedToTimeSeries) {
                        /*
                         * nextWaterUseValues was set to an array of NaNs when 
                         * we started joining the last water use values to the 
                         * time series
                         */
                        valuesToAppendToRow = nextWaterUseValues;
                        
                        //now ensure that the outermost comparison of the loop
                        //is never again satisfied
                        nextWaterUseDate = undefined;
                    }
                    else {
                        /*
                         * after we join the current water use row, there will be 
                         * no more water use rows to join. At the moment when we 
                         * assign true to this variable, it is not true that the
                         * last water use values have all been joined, but by 
                         * the next time the variable is read 
                         * (the if condition above), all of the last water use
                         * values will be joined.
                         */
                        lastWaterUseValuesHaveBeenJoinedToTimeSeries = true;

                        /*
                         * Since there are no more rows in the waterUse data,
                         * we must derive the date that satisfies this loop's date 
                         * comparison by adding the default time increment.
                         */
                        nextWaterUseDate = addDefaultTimeIncrement(rowDate.clone());
                        /*
                         * After we join the last water use row to the 
                         * time series for the default duration, we will need 
                         * to join an array of NaN water use values to all 
                         * subsequent time steps
                         */
                        nextWaterUseValues = valuesToAppendToRow.map(function () {
                            return NaN;
                        });
                    }
                }
            }
            return row.concat(valuesToAppendToRow);
        });

        //then merge labels into data series metadata
        existingTimeSeries.metadata.seriesLabels = existingTimeSeries.metadata.seriesLabels.concat(waterUseSeries.metadata.seriesLabels);
    };
    /**
     * @param {NWCUI.data.DataSeries} waterUseSeries
     */
    self.updateDailyWaterUseSeries = function (waterUseSeries){
        self.mergeWaterUseSeriesIntoExistingTimeSeries(waterUseSeries, self.daily);
    }
    /**
     * @param {NWCUI.data.DataSeries} waterUseSeries
     */
    self.updateMonthlyWaterUseSeries = function (waterUseSeries) {
        self.mergeWaterUseSeriesIntoExistingTimeSeries(waterUseSeries, self.monthly);
    };
   /**
     * @param {NWCUI.data.DataSeries} waterUseSeries A hash of series id to
     * DataSeries objects
     */
    self.updateWaterUseSeries = function (waterUseSeries) {
        //these functions assume that the water use time series will always be 
        //inferior in time length to the existing time series
        self.updateDailyWaterUseSeries(waterUseSeries);
        self.updateMonthlyWaterUseSeries(waterUseSeries);
    };
};