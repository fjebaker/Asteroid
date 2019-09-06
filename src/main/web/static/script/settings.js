"use strict"

var BODY_CONTENT = (function(){

var bodyDiv = document.getElementById("bodyDiv");

LOADER.loaded_scripts["script/settings.js"] = "BODY_CONTENT";

/**
 * Used to toggle the vote favourite settings for a particular checkbox
 *
 * @param {number} index - '0' if the setting for auto-favouriting upvoted songs, '1' if the setting for auto-unfavouriting downvoted songs
 * @param {Object} box - the checkbox object that triggered the toggle event
 */
function _toggleVoteFav(index,box) {
    return function(){
		var voteFavArray = TOOLS.COOKIES.getDecodedCookie("vote_favourite_settings");
        voteFavArray[index] = box.checked ? 1 : 0;
        TOOLS.COOKIES.setCookie("vote_favourite_settings",voteFavArray.join(','),TOOLS.COOKIES.getCookieDuration());
    }
}

/**
 * Used to determine whether the checkbox for a tab of particular index should be checked by default
 *
 * @param {number} index - the integer index of the tab
 *
 * @returns {string} checkedString - the string "checked" if the index should be checked, or the empty string "" if it should not, such that the returned value can be directly fed into the HTML script for a checkbox element
 */
function _getCheckedState(index) {
    var tabArr = TOOLS.COOKIES.getDecodedCookie("tabs");
    if (index < 5) {
        if (tabArr[index] == "1") {return "checked";}
        else {return "";}
    }
}

/**
 * Callback used to change the "tabs" cookie when a checkbox is checked or unchecked
 *
 * @param {number} index - the integer index of the tab
 * @param {Object} box - the checkbox object that triggered the toggle event
 */
function _changeCallback(index,box) {
    return function () {
	    var tabArr = TOOLS.COOKIES.getDecodedCookie("tabs");
        if (index < 5) {
            var adder = box.checked ? 1 : 0;
            tabArr[index] = adder;
            TOOLS.COOKIES.setCookie("tabs",tabArr.join(','),TOOLS.COOKIES.getCookieDuration());
            TAB_BAR.populateTabbar();
        }
    }
}

/**
 * Used to populate the tab setting table with tab checkboxes
 */
function populateTabSettingTable() {
    const _settingsLookupNames = {
        0:"Voting",
        1:"Queue",
        2:"Downloaded",
        3:"Favourites",
        4:"Playlists"
    };
    var tabSettingTable = document.getElementById("tabSettingTable");
    for (var i=0; i<5; i++) {
        var newRow = tabSettingTable.insertRow(-1);
        var nameCell = newRow.insertCell(0);
        var buttonCell = newRow.insertCell(1);
        nameCell.innerHTML = _settingsLookupNames[i] || "";
        buttonCell.innerHTML = "<input type=\'checkbox\' " + _getCheckedState(i) + "></input>";
        buttonCell.children[0].onclick = _changeCallback(i,buttonCell.children[0]);
    }
}

/**
 * Callback used for modifying the "cookieDuration" cookie via a 'select' element on the 'change' event and reloading the page with new expiry times on all cookies.
 *
 * @param {Object} select - the select element whose 'change' event has been triggered.
 */
function selectCookieDuration() {
    var value = document.getElementById("cookieDurationSelector").value;
    TOOLS.COOKIES.setCookie("cookieDuration",value,TOOLS.convertNameToDuration(value));
    TOOLS.COOKIES.refreshCookies(TOOLS.convertNameToDuration(value)); //Ensuring all cookies are updated with the current cookie duration
}

return {
/**
 * Function used to populate the body div with the relevant settings menu
 *
 * @alias BODY_CONTENT~populateBody
 */
populateBody:function(){
    bodyDiv.innerHTML = "Expiration time for basic client-side stored cookies: <select id='cookieDurationSelector'></select>"
    var keys = ['minute','hour','day','week','month','year'];
    var texts = ['1 Minute','1 Hour','1 Day','1 Week','1 Month','1 Year'];
    var defaultKey = TOOLS.COOKIES.getCookie("cookieDuration");
    var voteFavCookie = TOOLS.COOKIES.getCookie("vote_favourite_settings");
    if (voteFavCookie == "") {
        if (CONFIG.hasOwnProperty("default-vote-favourite-settings")) {
            voteFavCookie = CONFIG["default-vote-favourite-settings"];
        } else {
            voteFavCookie = "1,1";
        }
        TOOLS.COOKIES.setCookie("vote_favourite_settings",voteFavCookie,TOOLS.COOKIES.getCookieDuration());
    }
	var voteFavArray = TOOLS.COOKIES.getDecodedCookie("vote_favourite_settings");
    voteFavArray[0] = (voteFavArray[0] == "1" ? "checked" : "");
    voteFavArray[1] = (voteFavArray[1] == "1" ? "checked" : "");
    var showColumnCookie = TOOLS.COOKIES.getCookie("show_column_settings");
    if (showColumnCookie == "") {
        if (CONFIG.hasOwnProperty("default-show-column-settings")) {
            showColumnCookie = CONFIG["default-show-column-settings"];
        } else {
            showColumnCookie = "1,0";
        }
        TOOLS.COOKIES.setCookie("show_column_settings",showColumnCookie,TOOLS.COOKIES.getCookieDuration());
    }
    var showColumnArray = showColumnCookie.split(',');
    showColumnArray[0] = (showColumnArray[0] == "1" ? "checked" : "");
    showColumnArray[1] = (showColumnArray[1] == "1" ? "checked" : "");
    bodyDiv.innerHTML += "<br>Automatically favourite upvoted songs: <input id='tmpElem1' type='checkbox' "+voteFavArray[0]+"><br>Automatically unfavourite downvoted songs: <input id='tmpElem2' type='checkbox' onclick='_toggleVoteFav(1,this);' "+voteFavArray[1]+">";
//TODO    bodyDiv.innerHTML += "<br>Show 'favourite' column: <input type='checkbox' onclick='_toggleColumn(0,this);' "+showColumnArray[0]+">";
    bodyDiv.innerHTML += "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>";
    populateTabSettingTable();
    var subTabQuery = TOOLS.QUERIES.readKeyQuery("subTab");
    if (subTabQuery !== null) {
        var ypos = 0;
        if (subTabQuery == "Cookies") {
            ypos = bodyDiv.children[0].offsetTop;
        } else if (subTabQuery == "Tabs") {
            ypos = document.getElementById("tabSettingTable").offsetTop;
        }
        window.scrollTo(0,ypos);
    }
    var tempElem = document.getElementById("tmpElem1");
    tempElem.onclick = _toggleVoteFav(0,tempElem);
    tempElem.removeAttribute("id");
    tempElem = document.getElementById("tmpElem2");
    tempElem.onclick = _toggleVoteFav(1,tempElem);
    tempElem.removeAttribute("id");
    var cookieDurationSelector = document.getElementById("cookieDurationSelector");
    cookieDurationSelector.onchange = selectCookieDuration;
    for (var i = 0; i<keys.length && i<texts.length; i++) {
        var option = document.createElement("option");
        option.value = keys[i];
        option.text = texts[i];
        if (keys[i] == defaultKey) {option.selected = true;}
        cookieDurationSelector.add(option);
    }
}
};

})();

LOADER.current_callback();
