function tab_callback(){}

/**
 * Used to add buttons to the end of a particular HTML element
 *
 * @param {Object} div - the element to add a button to
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 *
 * @returns {Object} button - the DOM object of the button
 */
function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    div.appendChild(button);
    button.addEventListener("click",callback);
    return button;
}

/*
 * The callback for a button click
 * @callback buttonCallback
 */

/**
 * Used to load a particular script based on a valid 'tab' query in the query string
 */
function includeQueryStringScript() {
    var urlParams = new URLSearchParams(location.search);
    if(urlParams.has("tab")) { //check if tab query exists
        var tabName = urlParams.get("tab");
        var scriptName = "" //The location of the script to load in
        switch(tabName) {
            case "Voting":
                tab_callback=function() {
                    includeQueryStringVoteFunc();
                };
                scriptName = "voting.js";
                break;
            case "Rating":
                scriptName = "rating.js"
                break;
            case "Settings":
                tab_callback=function(){
                    populateDivAccount("bodyDiv");
                    tab_callback=function(){};
                    console.log("Loaded in settings menu");
                };
                scriptName = "settings.js"
                break;
            default:
                var message = "No known tab with the name: "+tabName;
                document.getElementById("bodyDiv").innerHTML = message;
                return;
        }
        document.getElementById("scriptFiller").src = "../script/" + scriptName + "?v" + Math.random(); //If a valid tab query is given, loads in the relevant script
    }
}

function voting() {updateQuery({"tab":"Voting","v":Math.random()});}
function rating() {updateQuery({"tab":"Rating","v":Math.random()});}
function settings() {updateQuery({"tab":"Settings","v":Math.random()});}
//function tabs() {updateQuery({"tab":"Tabs","v":Math.random()});}
//function account() {updateQuery({"tab":"Account","v":Math.random()});}

function request() {document.location.href=""}

const _defaultTabCallback = {
    "Voting":voting,
    "Rating":rating,
    "Settings":settings,
    "Request":request
};

/**
 * Used to ensure that a valid "tabs" cookie exists, and set the cookie to the default value if it doesn't exist
 */
function defaultTabCookies() {
    var configJSON = getConfigJson();
    if (getCookie("tabs") == ""){
        if (configJSON.hasOwnProperty("default-tab-activation")) {
            setCookie("tabs",configJSON["default-tab-activation"],getCookieDuration());
        } else {
            setCookie("tabs","1,0,1,1,1,0",getCookieDuration());
        }
    }
}

/**
 * Used to populate a HTML element with the 'tab' buttons needed depending on the values stored in the "tabs" cookie
 *
 * @param {Object} element - the element to insert buttons into
 * @param {tableCallback} tableCallback - the lookup table for buttons to use
 */
function supplyButtons(element,tabCallback) {
    var configJSON = getConfigJson();
    var allow_requests = ""
    var allow_favourites = ""
    var allow_playlists = ""
    if (configJSON.hasOwnProperty("allow-requests")) {allow_requests = (configJSON["allow-requests"] == "1" ? "Request" : "");}
    if (configJSON.hasOwnProperty("allow-favourites")) {allow_favourites = (configJSON["allow-favourites"] == "1" ? "Favourites" : "");}
    if (configJSON.hasOwnProperty("allow-playlists")) {allow_playlists = (configJSON["allow-playlists"] == "1" ? "Playlists" : "");}
    const _tabbarLookupNames = {
        0:"Voting",
        1:"Rating",
        2:"Queue",
        3:"Downloaded",
        4: allow_favourites,
        5: allow_playlists,
        6:"Settings",
        7: allow_requests
    };
    defaultTabCookies();
    var tabStr = getCookie("tabs")+",1,1";
    var tabArray = tabStr.split(','); //Which tabs the user wishes to be shown
    for(var i=0; i<tabArray.length; i++) {
        var number = tabArray[i];
        if (number == "1") {
            var callback = tabCallback(_tabbarLookupNames[i] || "");
            if (typeof callback !== "string") { //Checking that a valid callback exists
                generateTabButton(element, _tabbarLookupNames[i] || "", callback); //Creating a button with this callback
            }
        }
    }
}


/**
 * Convenience function used to populate the specified div element with the default tabs
 *
 * @param {string} elementname - the id specifying the element to insert tabs into
 */
function supplyTabButtons(elementname) {
    var tabsDiv = document.getElementById(elementname);
    supplyButtons(tabsDiv,function(name){return _defaultTabCallback[name] || "";});
}

current_callback();
