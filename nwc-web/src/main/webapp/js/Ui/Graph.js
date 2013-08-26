Ext.ns('NWCUI.ui');
/**
 * @param graphElt - a DOM Node in which to render the Dygraph
 * @param legendElt - a DOM Node in which to render the legend
 * @param values - the array of arrays containing the data to graph
 */
NWCUI.ui.Graph = function(graphElt, legendElt, values){
    var self = this;
    //make a map of programmatic identifier to user-facing text
    self.seriesNames = {};
    self.seriesNames.meanPrecip = 'Mean Precipitation';
    //@todo add more when rwps process is incorporated

    $([graphElt, legendElt]).addClass('generous_left_margin');
    
    var decileSuffix = "th % (cm)";
    var decileLabels = ['90','80','70','60','50','40','30','20','10'].map(
        function(prefix){
            return prefix + decileSuffix;
        });
    //@todo remove this decile labels reset when we have an rwps process that returns deciles
    decileLabels = [];
    var mainLabelSuffix = " (cm)";
    var mainLabels = 
    [
    self.seriesNames.meanPrecip//initial field
    //@todo subsequently-loaded stats fields will go here

    ].map(function(prefix){
        return prefix + mainLabelSuffix;
    });
    //must include x axis label as well:
    var labels = ['Date'].concat(mainLabels).concat(decileLabels);
        
    var canonicalDecileSeriesOptions = {
        strokeWidth: 1,
        stepPlot: false
    };
    var allDecileSeriesOptions ={};
    decileLabels.each(function(label){
        allDecileSeriesOptions[label] = canonicalDecileSeriesOptions;
    });
    var otherSeriesOptions = {};
    otherSeriesOptions[self.seriesNames.meanPrecip]=
        {
            strokeWidth: 3,
            stepPlot: false
        };
    
    var allSeriesOptions ={};
    Object.merge(allSeriesOptions, allDecileSeriesOptions);
    Object.merge(allSeriesOptions, otherSeriesOptions);
    
    //functions to customize the display of dates on the Dygraph
    //these will be attached as public properties of the Graph
    var dateToStringWithoutDay = function(ms){
        return new Date(ms).format('{Mon}. {yyyy}');
    };
    
    var dateToStringMonthOnly = function(ms){
        return new Date(ms).format('{Mon}.');
    };
    
    var opts = {
        labels: labels,
        colors: ['purple'],
        //@todo add stat series colors and restore decile colors:
        connectSeparatedPoints: true,
        showRangeSelector: true,
        highlightCircleSize: 0,
        ylabel: 'Precipitation (cm)',
        xlabel: 'Date',
        labelsDiv: legendElt,
        labelsSeparateLines: true,
        legend: 'always'
    };
        
    Object.merge(opts, allSeriesOptions);
    var graph = new Dygraph(graphElt, values, opts);
    //attach some additional properties
    graph.customFormatters = {};
    graph.customFormatters.dateToStringWithoutDay = dateToStringWithoutDay;
    graph.customFormatters.dateToOnlyMonthString = dateToStringMonthOnly;
    
    return graph;
};