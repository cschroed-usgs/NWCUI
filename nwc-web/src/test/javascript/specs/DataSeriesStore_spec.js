initializeLogging();
describe('DataSeriesStore', function(){
    var daymetData = [
        ['1951/01/01', 1.0],
        ['1951/01/02', 1.0],
        ['1951/01/03', 1.0],
        ['1951/01/04', 1.0],
        ['1951/01/05', 1.0],
        ['1951/01/06', 1.0],
        ['1951/01/07', 1.0],
        ['1951/01/08', 1.0],
        ['1951/01/09', 1.0],
        ['1951/01/10', 1.0],
        ['1951/01/11', 1.0],
        ['1951/01/12', 1.0],
        ['1951/01/13', 1.0],
        ['1951/01/14', 1.0],
        ['1951/01/15', 1.0],
        ['1951/01/16', 1.0],
        ['1951/01/17', 1.0],
        ['1951/01/18', 1.0],
        ['1951/01/19', 1.0],
        ['1951/01/20', 1.0],
        ['1951/01/21', 1.0],
        ['1951/01/22', 1.0],
        ['1951/01/23', 1.0],
        ['1951/01/24', 1.0],
        ['1951/01/25', 1.0],
        ['1951/01/26', 1.0],
        ['1951/01/27', 1.0],
        ['1951/01/28', 1.0],
        ['1951/01/29', 1.0],
        ['1951/01/30', 1.0],
        ['1951/01/31', 1.0]
    ];
    var dayMetDataSeries = NWCUI.data.DataSeries();
    dayMetDataSeries.data = daymetData;
    dayMetDataSeries.metadata.seriesLabels.push('mm ppt');

    var etaData = [
        ['1951/01/01', 1.0]
    ];
    var etaDataSeries = NWCUI.data.DataSeries();
    etaDataSeries.data = etaData;
    etaDataSeries.metadata.seriesLabels.push('mm ppt');

    var dataSeries = {
        dayMet: dayMetDataSeries,
        eta: etaDataSeries
    };

    var dss = new NWCUI.data.DataSeriesStore(dataSeries);
    //give functions inside describe block access to the test data via closure
    beforeEach(function (){
        dss = dss;
        dataSeries=dataSeries;
    });    
    describe('DataSeriesStore#updateMonthlySeries', function(){
        it('should handle the case that the period of record ends on the last day of a month', function(){
            expect(dss.monthly.data.length).toBe(1);
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
});