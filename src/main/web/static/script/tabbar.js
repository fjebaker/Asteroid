//Creates a button at the end of element 'div' whose text is 'buttonText' and whose clicking calls the function 'callback'
function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    div.appendChild(button);
    button.addEventListener("click",callback);
}

//Inserts a script specified in the query string, if valid
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

//Gives relevant callback for a key
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

//Checks that valid cookies for tabs exist
function defaultTabCookies() {
    if (getCookie("tabs") == ""){
        setCookie("tabs","Voting:1,Rating:0,Queue:1,Downloaded:1,Favourites:1,Playlists:0",getCookieDuration());
    }
}

//puts relevant tabs in the element section.
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

//Puts buttons in the tabs section
function supplyTabButtons() {
    var tabsDiv = document.getElementById("tabsDiv");
    supplyButtons(tabsDiv,defaultTabCallback);
}

current_callback();
