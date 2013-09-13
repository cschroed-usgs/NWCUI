Ext.ns('NWCUI.ui');
/**
 * @param {DOMNode} graphElt - a DOM Node in which to render the Dygraph
 * @param {DOMNode} legendElt - a DOM Node in which to render the legend
 * @param {DataSeriesStore} series - the series to graph
 */
NWCUI.ui.Graph = function(graphElt, legendElt, series){
    var self = this,
        defaultSeries = 'daily',
        values = series[defaultSeries].data,
        labels = series[defaultSeries].metadata.seriesLabels;

    $([graphElt, legendElt]).addClass('generous_left_margin');
    
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
        connectSeparatedPoints: true,
        showRangeSelector: true,
        highlightCircleSize: 0,
        ylabel: 'Precipitation (mm)',
        xlabel: 'Date',
        labelsDiv: legendElt,
        labelsSeparateLines: true,
        legend: 'always'
    };
        
    var graph = new Dygraph(graphElt, values, opts);
    //attach some additional properties
    graph.customFormatters = {};
    graph.customFormatters.dateToStringWithoutDay = dateToStringWithoutDay;
    graph.customFormatters.dateToOnlyMonthString = dateToStringMonthOnly;
    
    return graph;
};