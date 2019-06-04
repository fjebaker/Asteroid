function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText;
    div.appendChild(button);
    button.addEventListener("click",callback);
}

//Inserts a script specified in the query string, if valid
function includeQueryStringScript() {
    var urlParams = new URLSearchParams(location.search);
    if(urlParams.has("tab")) { //check if tab query exists
        var tabName = urlParams.get("tab");
        var scriptName = ""
        switch(tabName) {
            case "Voting":
                scriptName = "voting.js";
                break;
            case "Rating":
            case "Tabs":
            case "Account":
            case "Queue":
            case "Downloaded":
            case "Favourites":
            case "Playlists":
                scriptName = "testbody.js";
                break;
            default:
                var message = "No known tab with the name: "+tabName;
                document.getElementById("bodyDiv").innerHTML = message;
                return;
        }
        document.getElementById("scriptFiller").src = "../script/" + scriptName;
    }
}

//Redirects to the same page with the 'tab' search query set to 'string'
function tabQuery(string) {
    var pathName = document.location.pathname;
    var urlParams = new URLSearchParams(location.search);
    urlParams.set("tab",string);
    window.location.href = pathName + "?" + urlParams.toString();
}

function voting() {tabQuery("Voting");}
function rating() {tabQuery("Rating");}
function tabs() {tabQuery("Tabs");}
function account() {tabQuery("Account");}

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
        setCookie("tabs","Voting:1,Rating:0,Queue:1,Downloaded:1,Favourites:1,Playlists:0",360000);
    } else {
        setCookie("tabs","Voting:1,Rating:1,Queue:1,Downloaded:1,Favourites:1,Playlists:0",360000);
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
            var callback = tabCallback(namNum[0]);
            if (typeof callback !== "string") { //Checking that a valid callback exists
                generateTabButton(element, namNum[0], callback);
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
