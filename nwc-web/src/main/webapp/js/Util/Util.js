Ext.ns('NWCUI.util');

NWCUI.util.makeLegalJavaScriptIdentifier = function(str){
        var illegal = /[^0-9a-zA-Z_$]/;
            var safe = str.replace(illegal, '_');
                return safe;
};

 //given an array, return an array of the original elements
 //wrapped in an object and nested under a key of your choosing
 //
 //resulting object format:
 //[{<your key>:<original data>}, {<your key>:<original data>}, ... ]
NWCUI.util.wrapEachWithKey = function(array, key){
     return array.map(function(theVal){
         var obj = {};
         obj[key]=theVal;
         return obj;
    });
};
/**
 * Labels on ajax call objects permit a general callback function to execute
 * specific behavior pertinent to the specific label of the request.
 * 
 * @param {String} label The value to put in the 'label' property of the jqXHR 
 * object available to the callbacks.
 * @param {String} url
 * @param {Object} ajaxOptions any standard jQuery ajax options
 * @returns {Object} jQuery ajax object with an additional 'label' property.
 */
NWCUI.util.makeLabeledAjaxCall = function(label, url, ajaxOptions){
        var call = $.ajax(url, ajaxOptions);
        call.label = label;
        call.url = url;
        return call;
};

/**
 * @param {String} xmlStr - a plain xml string
 * @returns {String} a string whose special characters ('<','&', etc.) have been
 * character encoded so that it is safe to insert them in places like the *value*
 * attribute of an *input* element.
 */
NWCUI.util.characterEncodeXml = function(xmlStr) {
    return $('<div/>').text(xmlStr).html();
  };