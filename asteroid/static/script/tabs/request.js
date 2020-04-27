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
},

getRequestPages:function(){
    var current_loading_callback = LOADER.loading_callback;

    function loadRemainingNames(list){
        return function() {
            if (list.length > 0) {
                console.log(list[0]);
                LOADER.loadScript("request/"+list.shift(),loadRemainingNames(list));
            } else {
                current_loading_callback();
            }
        }
    }

    function getRequestNameLists(request){
        if (request.status == "200") {
            var data = JSON.parse(request.response);
            loadRemainingNames(data)();
        } else {
            current_loading_callback();
        }
    }

    TOOLS.jsonGetRequest("request",getRequestNameLists,current_loading_callback);
}
};
})();

LOADER.tab_scripts["Request"] = REQUEST //Capitalised
REQUEST.getRequestPages();
