"use strict"

var REQUEST = (function(){

var request_functions = {};

return {

/**
 * Adds a new page to requests
 *
 * @alias REQUEST~addRequestPage
 * @param {string} name - the name of the request tab
 * @param {function} populationFunction - a function that populates the body div when the tab is opened
 */
addRequestPage:function(name,populationFunction){
    request_functions[name] = populationFunction;
    MISC_INFO.tabs_object["Request"].push(name);
},

populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (request_functions.hasOwnProperty(subtab)) {
        request_functions[subtab]()
    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
}
};
})();

LOADER.tab_scripts["Request"] = REQUEST //Capitalised
LOADER.loading_callback();
