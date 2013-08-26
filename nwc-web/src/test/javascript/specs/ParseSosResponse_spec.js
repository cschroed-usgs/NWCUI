initializeLogging();
describe('ParseSosResponse.js', function(){
    
    //testing constants:
    var numLeadingNans = 3;//update this if you change the test data
    var defaultNumFieldsLoadedLater = 13;
    
    //wrapper for tested function
    var parse = function(data){
        return NWCUI.data.parseSosResponse(data, defaultNumFieldsLoadedLater);
    };
    
    var countNaNsInResults = function(results){
        var numNans = 0;
        results.each(function(row){
            if(isNaN(row[1])){
                numNans++;
            }
        });
        return numNans;
    }
    
    var verifyResultsContainNoNaNs = function(results){
        expect(countNaNsInResults(results)).toBe(0);
    }   
    
    it('should implement the parseSosResponse function', function(){
       expect(NWCUI.data.parseSosResponse).toBeDefined();
    });
    
    it('should not insert NaNs into the result when the incoming data has no NaNs', function(){
        var noNaNsResults = parse(noNaNsData);
        verifyResultsContainNoNaNs(noNaNsResults);
    });
    
    it('should omit leading rows that have NaNs in the results', function(){
        var numResponseRecords = nansInFrontData.split('\n').length - 1; //-1 because service has terminal newline
        var nansInFrontResults = parse(nansInFrontData);
        verifyResultsContainNoNaNs(nansInFrontResults);
        //double-check:
        expect(nansInFrontResults.length).toBe(numResponseRecords - numLeadingNans);
    });
    it('should omit leading rows that have empty values in the results', function(){
        var numResponseRecords = emptysInFrontData.split('\n').length - 1; //-1 because service has terminal newline
        var emptysInFrontResults = parse(emptysInFrontData);
        verifyResultsContainNoNaNs(emptysInFrontResults);
        //double-check:
        expect(emptysInFrontResults.length).toBe(numResponseRecords - numLeadingNans);
    });
    it('should omit leading rows that have NaN values from the results and it should not remove NaNs from the middle of the data', function(){
        var numNaNsInMiddle = 2;
        var numResponseRecords = nansInFrontAndMiddleData.split('\n').length - 1; //-1 because service has terminal newline
        var nansInFrontAndMiddleResults = parse(nansInFrontAndMiddleData);
        expect(countNaNsInResults(nansInFrontAndMiddleResults)).toBe(numNaNsInMiddle);
        //double-check:
        expect(nansInFrontAndMiddleResults.length).toBe(numResponseRecords - numLeadingNans);
    });
    it('should omit leading rows that have empty values from the results and it should not remove empty values from the middle of the data', function(){
        var numNaNsInMiddle = 2;
        var numResponseRecords = emptysInFrontAndMiddleData.split('\n').length - 1; //-1 because service has terminal newline
        var emptysInFrontAndMiddleResults = parse(emptysInFrontAndMiddleData);
        expect(countNaNsInResults(emptysInFrontAndMiddleResults)).toBe(numNaNsInMiddle);
        //double-check:
        expect(emptysInFrontAndMiddleResults.length).toBe(numResponseRecords - numLeadingNans);
    });
    it('should not remove NaNs from the middle of the data, even when there are no leading NaNs', function(){
        var numNaNsInMiddle = 2;
        var numResponseRecords = nansInMiddleData.split('\n').length - 1; //-1 because service has terminal newline
        var nansInMiddleResults = parse(nansInMiddleData);
        expect(countNaNsInResults(nansInMiddleResults)).toBe(numNaNsInMiddle);
        //double-check:
        expect(nansInMiddleResults.length).toBe(numResponseRecords);
    });
    it('should not remove empty values from the middle of the data, even when there are no leading NaNs', function(){
        var numNaNsInMiddle = 2;
        var numResponseRecords = emptysInMiddleData.split('\n').length - 1; //-1 because service has terminal newline
        var emptysInMiddleResults = parse(emptysInMiddleData);
        expect(countNaNsInResults(emptysInMiddleResults)).toBe(numNaNsInMiddle);
        //double-check:
        expect(emptysInMiddleResults.length).toBe(numResponseRecords);
    });
//no functionality after this point, only test data:   
var noNaNsData, nansInFrontData, nansInMiddleData, nansInFrontAndMiddleData,
        emptysInFrontData, emptysInMiddleData, emptysInFrontAndMiddleData;

//if you change the number of NaNs in the following string, update the test accordingly
nansInFrontData = "1951-01-01T00:00:00Z,NaN \n" +
"1951-02-01T00:00:00Z,NaN \n" +
"1951-03-01T00:00:00Z,NaN \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +
"1952-02-01T00:00:00Z,1.66 \n" +
"1952-03-01T00:00:00Z,4.19 \n" +
"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";

emptysInFrontData = "1951-01-01T00:00:00Z,9.96921E366 \n" +
"1951-02-01T00:00:00Z,9.96921E366 \n" +
"1951-03-01T00:00:00Z,9.96921E366 \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +
"1952-02-01T00:00:00Z,1.66 \n" +
"1952-03-01T00:00:00Z,4.19 \n" +
"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";

nansInFrontAndMiddleData = "1951-01-01T00:00:00Z,NaN \n" +
"1951-02-01T00:00:00Z,NaN \n" +
"1951-03-01T00:00:00Z,NaN \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +

//The NaNs in the middle
"1952-02-01T00:00:00Z,NaN \n" +
"1952-03-01T00:00:00Z,NaN \n" +
//update tests if you change the # of NaNs in the middle

"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";

emptysInFrontAndMiddleData = "1951-01-01T00:00:00Z,9.96921E36 \n" +
"1951-02-01T00:00:00Z,9.96921E366 \n" +
"1951-03-01T00:00:00Z,9.96921E366 \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +

//The NaNs in the middle
"1952-02-01T00:00:00Z,9.96921E366 \n" +
"1952-03-01T00:00:00Z,9.96921E366 \n" +
//update tests if you change the # of NaNs in the middle

"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";


nansInMiddleData = "1951-01-01T00:00:00Z,0.13 \n" +
"1951-02-01T00:00:00Z,5.67 \n" +
"1951-03-01T00:00:00Z,8.7 \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +

//The NaNs in the middle
"1952-02-01T00:00:00Z,NaN \n" +
"1952-03-01T00:00:00Z,NaN \n" +
//update tests if you change the # of NaNs in the middle

"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";

emptysInMiddleData = "1951-01-01T00:00:00Z,0.13 \n" +
"1951-02-01T00:00:00Z,5.67 \n" +
"1951-03-01T00:00:00Z,8.7 \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +

//The NaNs in the middle
"1952-02-01T00:00:00Z,9.96921E36 \n" +
"1952-03-01T00:00:00Z,9.96921E36 \n" +
//update tests if you change the # of NaNs in the middle

"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";


noNaNsData = "1951-01-01T00:00:00Z,1.97 \n" +
"1951-02-01T00:00:00Z,2.29 \n" +
"1951-03-01T00:00:00Z,4.24 \n" +
"1951-04-01T00:00:00Z,4.2 \n" +
"1951-05-01T00:00:00Z,1.49 \n" +
"1951-06-01T00:00:00Z,1.26 \n" +
"1951-07-01T00:00:00Z,0.524 \n" +
"1951-08-01T00:00:00Z,0.657 \n" +
"1951-09-01T00:00:00Z,0.64 \n" +
"1951-10-01T00:00:00Z,1.22 \n" +
"1951-11-01T00:00:00Z,1.42 \n" +
"1951-12-01T00:00:00Z,2.02 \n" +
"1952-01-01T00:00:00Z,1.66 \n" +
"1952-02-01T00:00:00Z,1.66 \n" +
"1952-03-01T00:00:00Z,4.19 \n" +
"1952-04-01T00:00:00Z,3.59 \n" +
"1952-05-01T00:00:00Z,2.21 \n" +
"1952-06-01T00:00:00Z,0.468 \n" +
"1952-07-01T00:00:00Z,0.998 \n" +
"1952-08-01T00:00:00Z,0.573 \n" +
"1952-09-01T00:00:00Z,0.458 \n" +
"1952-10-01T00:00:00Z,0.312 \n" +
"1952-11-01T00:00:00Z,1.59 \n" +
"1952-12-01T00:00:00Z,1.45 \n";

});