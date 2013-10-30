initializeLogging();
describe('DataSeriesStore', function(){
    var dateRangeStart = Date.create('March 1951');
    var dateRangeEnd = Date.create('July 1956').endOfMonth().beginningOfDay();
    var dateRange = Date.range(
        dateRangeStart,
        dateRangeEnd
    );
    var formatDate = function(date){
        return date.format('{yyyy}/{MM}/{dd}');
    };
    
    var dayMetData = [];
    dateRange.every('day', function(date){
        var dateStr = formatDate(date);
       dayMetData.push([dateStr, 1.0]);
    });
    
    var dayMetDataSeries = NWCUI.data.DataSeries();
    dayMetDataSeries.data = dayMetData;
    dayMetDataSeries.metadata.seriesLabels.push('mm ppt');

    var etaData = [
        [formatDate(dateRangeStart), 1.0]
    ];
    var etaDataSeries = NWCUI.data.DataSeries();
    etaDataSeries.data = etaData;
    etaDataSeries.metadata.seriesLabels.push('mm ppt');

    var dataSeries = {
        dayMet: dayMetDataSeries,
        eta: etaDataSeries
    };

    var dss = new NWCUI.data.DataSeriesStore();
    dss.updateHucSeries(dataSeries);
    //give functions inside describe block access to the test data via closure
    beforeEach(function (){
        dss = dss;
        dataSeries=dataSeries;
        dateRangeStart = dateRangeStart;
        dateRangeEnd = dateRangeEnd;
    });    
    describe('DataSeriesStore#updateMonthlySeries', function(){
        it('should handle the case that the period of record ends on the last day of a month', function(){
            var numMonths = dateRangeStart.monthsUntil(dateRangeEnd);
            expect(dss.monthly.data.length).toBe(numMonths);
        });
        it('should correctly acummulate eta and join it to monthly eta', function(){
            expect(dss.monthly.data[0][1]).toBe(31);
            expect(dss.monthly.data[0][2]).toBe(1);
        });
        it('should not include an incomplete final month in the aggregation', function(){
            var incompleteDaymetDataSeries = Object.clone(dataSeries, true);
            //remove the last entry of the month
            incompleteDaymetDataSeries.dayMet.data = incompleteDaymetDataSeries.dayMet.data.to(incompleteDaymetDataSeries.dayMet.data.length-1);
            var incompleteDss = new NWCUI.data.DataSeriesStore(incompleteDaymetDataSeries);
            expect(incompleteDss.monthly.data.length).toBe(0);
        });
    });
    describe('DataSeriesStore#updateWaterUseSeries', function(){
        //subsequent tests presume 3 rows on monthly increments, starting with
        //the first day of the second month of the eta time series and ending 
        //with the first day of the last month of the eta time series
       
       //actual data will be in 5 year increments, but 1-month increment suffice for our tests
       var mockWaterUseData = [
           [dateRangeStart.clone().addMonths(1), 1, 2, 3],
           [dateRangeStart.clone().addMonths(2), NaN, NaN, NaN],
           [dateRangeStart.clone().addMonths(3), 4, 5, 6] //should not be NaNs, this would break tests
       ];
       var labels = ['Date', 'Drinking', 'Industry', 'Irrigation'];
       var mockWaterUseSeries = new NWCUI.data.DataSeries();
       mockWaterUseSeries.data = mockWaterUseData;
       mockWaterUseSeries.metadata.seriesLabels = labels;
       dss.updateWaterUseSeries(mockWaterUseSeries);
       var getWaterUseValuesFromMergedRow = function(row){
         return row.from(3);
       };
       var getWaterUseValuesFromMockRow = function(row){
           return row.from(1);
       }
       it('should expand the target time series to the correct dimensions',function(){
            //ensure the correct dims were achieved
            expect(dss.daily.data[0].length).toBe(6);
       });
       it('should not join the water use values into the existing time series early', function(){
           //daily
           //find index of last day of first month
           var mergedIndex = dateRangeStart.daysInMonth() - 1;//subtract because 0-based
           var waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[mergedIndex]);
           var waterUseValuesFromMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[0]);
           expect(waterUseValuesFromMergedRow).not.toEqual(waterUseValuesFromMockRow);
           //monthly
           mergedIndex = 0;//1st month
           waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.monthly.data[mergedIndex]);
           expect(waterUseValuesFromMergedRow).not.toEqual(waterUseValuesFromMockRow);
       });
       it('should join the water use values into the existing time series starting at the appropriate time step', function(){
           //daily
           var mergedIndex = dateRangeStart.daysInMonth();//this actually indexes into next month because it's 0-based
           var waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[mergedIndex]);
           var waterUseValuesFromMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[0]);
           expect(waterUseValuesFromMergedRow).toEqual(waterUseValuesFromMockRow);
           //monthly
           mergedIndex = 1;//second month
           waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.monthly.data[mergedIndex]);
           expect(waterUseValuesFromMergedRow).toEqual(waterUseValuesFromMockRow);

       });
        it('should switch which water use values are joined onto the time series when the next water use timestep has been reached', function () {
            //daily
            var mergedIndex = dateRangeStart.daysInMonth();
            mergedIndex += dateRangeStart.clone().addMonths(1).daysInMonth();
            var waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[mergedIndex]);
            var waterUseValuesFromMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[1]);
            //entreating special NaN case RE: NaN != NaN in JS
            var waterUseValuesFromMergedRowAreNaNs = waterUseValuesFromMergedRow.map(isNaN);
            var waterUseValuesFromMockRowAreNaNs = waterUseValuesFromMockRow.map(isNaN);
            expect(waterUseValuesFromMergedRowAreNaNs).toEqual(waterUseValuesFromMockRowAreNaNs);
            
            //try the next Timestep too, it has non-NaNs
            mergedIndex += dateRangeStart.clone().addMonths(2).daysInMonth();
            waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[mergedIndex]);
            waterUseValuesFromMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[2]);
            expect(waterUseValuesFromMergedRow).toEqual(waterUseValuesFromMockRow);
            //monthly
            mergedIndex = 3;//4th month
            waterUseValuesFromMergedRow = getWaterUseValuesFromMergedRow(dss.monthly.data[mergedIndex]);
            expect(waterUseValuesFromMergedRow).toEqual(waterUseValuesFromMockRow);
        });
        it('should only keep joining the last water use value to the time series for the duration of the water use default time increment', function(){
            //daily
            var firstUnmergedIndex = dateRangeStart.daysInMonth();
            var firstMonthForLastWaterUseRow = dateRangeStart.clone();
            
            (2).times(function(){
                firstUnmergedIndex += firstMonthForLastWaterUseRow.addMonths(1).daysInMonth();
            });
            //mergedIndex now points at the last day of the first month where 
            //the last water use data row was joined for the first time
            
            //now we need to add the number of days equivalent to the county 
            //water use series defaultTimeIncrement to ensure that the join of
            //value stops on the proper timestep
            var endOfWaterUseJoin = firstMonthForLastWaterUseRow.clone();
            endOfWaterUseJoin.advance(NWCUI.data.SosSources.countyWaterUse.defaultTimeIncrement);
            
            firstUnmergedIndex += firstMonthForLastWaterUseRow.daysUntil(endOfWaterUseJoin);
            //check to make sure the last merge was correct

            var lastMergedIndex = firstUnmergedIndex - 1;
            var waterUseValuesFromLastMergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[lastMergedIndex]);
            var waterUseValuesFromLastMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[2]);
            expect(waterUseValuesFromLastMergedRow).toEqual(waterUseValuesFromLastMockRow);
            //ensure the first unmerged location is all NaNs
            
            //ensure nanValues array length is equal to waterUseValues length
            var nanValues = waterUseValuesFromLastMockRow.map(function () {
                return NaN;
            });

            var waterUseValuesFromFirstUnmergedRow = getWaterUseValuesFromMergedRow(dss.daily.data[firstUnmergedIndex]);
            //entreating special NaN case RE: NaN != NaN in JS
            var waterUseValuesFromFirstUnmergedRowAreNaNs = waterUseValuesFromFirstUnmergedRow.map(isNaN);
            var nanValuesAreNans = nanValues.map(isNaN);//redundant, but necessary because NaN != NaN
            expect(waterUseValuesFromFirstUnmergedRowAreNaNs).toEqual(nanValuesAreNans);
            
            //monthly
            firstMonthForLastWaterUseRow = dateRangeStart.clone();
            firstMonthForLastWaterUseRow.advance('3 months');
            var firstUnmergedMonth = firstMonthForLastWaterUseRow.clone();
            firstUnmergedMonth.advance(NWCUI.data.SosSources.countyWaterUse.defaultTimeIncrement);
            var firstUnmergedIndex = dateRangeStart.monthsUntil(firstUnmergedMonth);

            //ensure the last merge was correct
            lastMergedIndex = firstUnmergedIndex - 1;
            waterUseValuesFromLastMergedRow = getWaterUseValuesFromMergedRow(dss.monthly.data[lastMergedIndex]);
            waterUseValuesFromLastMockRow = getWaterUseValuesFromMockRow(mockWaterUseData[2]);
            expect(waterUseValuesFromLastMergedRow).toEqual(waterUseValuesFromLastMockRow);
            
            //ensure the first unmerged location is all NaNs
            
            //entreating special NaN case RE: NaN != NaN in JS
            waterUseValuesFromFirstUnmergedRow = getWaterUseValuesFromMergedRow(dss.monthly.data[firstUnmergedIndex]);
            var waterUseValuesFromFirstUnmergedRowAreNaNs = waterUseValuesFromFirstUnmergedRow.map(isNaN);
            expect(waterUseValuesFromFirstUnmergedRowAreNaNs).toEqual(nanValuesAreNans);
            
        });
    });
});