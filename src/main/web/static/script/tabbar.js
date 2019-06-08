/**
 * Used to add buttons to the end of a particular HTML element
 *
 * @param {Object} div - the element to add a button to
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 */
function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    div.appendChild(button);
    button.addEventListener("click",callback);
}

/**
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
                scriptName = "voting.js";
                break;
            case "Tabs":
                scriptName = "tabs.js";
                break;
            case "Rating":
                scriptName = "rating.js"
                break;
            case "Account":
                scriptName = "account.js"
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
function tabs() {updateQuery({"tab":"Tabs","v":Math.random()});}
function account() {updateQuery({"tab":"Account","v":Math.random()});}

/**
 * Used as a lookup table for values of the "tab" query to javascript functions for button callback
 *
 * @param {string} name - the name of the tab as per the "tab" query: expecting one of ["Voting","Rating","Tabs","Account"]
 *
 * @returns {string|buttonCallback} callback - the relevant callback function for the 'name' string if it matches one of the expected values, or the string "" if it doesn't.
 */
function defaultTabCallback(name) {
    switch(name) {
        case "Voting":
            return voting;
            break;
        case "Rating":
            return rating;
            break;
        case "Tabs":
            return tabs;
            break;
        case "Account":
            return account;
            break;
        default:
            return "";
    }
}

/**
 * Used to ensure that a valid "tabs" cookie exists, and set the cookie to the default value if it doesn't exist
 */
function defaultTabCookies() {
    if (getCookie("tabs") == ""){
        setCookie("tabs","Voting:1,Rating:0,Queue:1,Downloaded:1,Favourites:1,Playlists:0",getCookieDuration());
    }
}

/**
 * Used to populate a HTML element with the 'tab' buttons needed depending on the values stored in the "tabs" cookie
 *
 * @param {Object} element - the element to insert buttons into
 * @param {tableCallback} tableCallback - the lookup table for buttons to use
 */
function supplyButtons(element,tabCallback) {
    defaultTabCookies();
    var tabStr = getCookie("tabs")+",Tabs:1,Account:1";
    var tabArray = tabStr.split(','); //Which tabs the user wishes to be shown
    for(var i=0; i<tabArray.length; i++) {
        var namNum = tabArray[i].split(':');
        if (namNum[1] == "1") {
            var callback = tabCallback(namNum[0]); //namNum[0] will be a callback key
            if (typeof callback !== "string") { //Checking that a valid callback exists
                generateTabButton(element, namNum[0], callback); //Creating a button with this callback
            }
        }
    }
}

/**
 * Convenience function used to populate the "tabsDiv" div element with the default tabs
 */
function supplyTabButtons() {
    var tabsDiv = document.getElementById("tabsDiv");
    supplyButtons(tabsDiv,defaultTabCallback);
}

current_callback();
