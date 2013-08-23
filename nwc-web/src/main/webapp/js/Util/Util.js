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
