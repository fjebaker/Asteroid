/**
 * Callback used for modifying the "cookieDuration" cookie via a 'select' element on the 'change' event and reloading the page with new expiry times on all cookies.
 *
 * @param {Object} select - the select element whose 'change' event has been triggered.
 */
function selectCookieDuration(select) {
    setCookie("cookieDuration",select.value,convertNameToDuration(select.value));
    refreshCookies(convertNameToDuration(select.value)); //Ensuring all cookies are updated with the current cookie duration
    window.location.href = window.location.href;
}

/**
 *  Used for populating a select element with the options relevant to setting the "cookieDuration" cookie
 */
function putOptions() {
    var cookieDurationSelector = document.getElementById("cookieDurationSelector");
    var keys = ['minute','hour','day','week','month','year'];
    var texts = ['1 Minute','1 Hour','1 Day','1 Week','1 Month','1 Year'];
    var defaultKey = getCookie("cookieDuration");
    for (var i = 0; i<keys.length && i<texts.length; i++) {
        var option = document.createElement("option");
        option.value = keys[i];
        option.text = texts[i];
        if (keys[i] == defaultKey) {option.selected = true;}
        cookieDurationSelector.add(option);
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
    var tabArr = getCookie('tabs').split(',');
    if (index < 6) {
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
    var tabArr = getCookie('tabs').split(',');
    if (index < 6) {
        var adder = box.checked ? 1 : 0;
        tabArr[index] = adder;
        setCookie("tabs",tabArr.join(','),getCookieDuration());
        updateQuery({v:Math.random()});
    }
}

/**
 * Used to populate the tab setting table with tab checkboxes
 */
function populateTabSettingTable() {
    const _settingsLookupNames = {
        0:"Voting",
        1:"Rating",
        2:"Queue",
        3:"Downloaded",
        4:"Favourites",
        5:"Playlists"
    };
    var tabSettingTable = document.getElementById("tabSettingTable");
    for (var i=0; i<6; i++) {
        var newRow = tabSettingTable.insertRow(-1);
        var nameCell = newRow.insertCell(0);
        var buttonCell = newRow.insertCell(1);
        nameCell.innerHTML = _settingsLookupNames[i] || "";
        buttonCell.innerHTML = "<input type=\'checkbox\' onclick=\'_changeCallback(" + i + ",this);\'" + _getCheckedState(i) + "></input>";
    }
}

/**
 * Used to toggle the vote favourite settings for a particular checkbox
 *
 * @param {number} index - '0' if the setting for auto-favouriting upvoted songs, '1' if the setting for auto-unfavouriting downvoted songs
 * @param {Object} box - the checkbox object that triggered the toggle event
 */
function _toggleVoteFav(index,box) {
    var voteFavArray = getCookie("vote_favourite_settings").split(',');
    voteFavArray[index] = box.checked ? 1 : 0;
    setCookie("vote_favourite_settings",voteFavArray.join(','),getCookieDuration());
}

/**
 * Used to toggle the show column settings for a particular checkbox
 *
 * @param {number} index - '0' if the setting for Favourite, '1' if the setting for Rating
 * @param {Object} box - the checkbox object that triggered the toggle event
 */
function _toggleColumn(index,box) {
    var colArray = getCookie("show_column_settings").split(',');
    colArray[index] = box.checked ? 1 : 0;
    setCookie("show_column_settings",colArray.join(','),getCookieDuration());
}

/**
 * Used for populating a div element with the accounts HTML
 *
 * @param {string} divname - the id for the div element
 */
function populateDivAccount(divname) {
    var bodyDiv = document.getElementById(divname);
    bodyDiv.innerHTML = "Expiration time for basic client-side stored cookies: <select onchange='selectCookieDuration(this)' id='cookieDurationSelector'></select>"
    var voteFavCookie = getCookie("vote_favourite_settings");
    var configJSON = getConfigJson();
    if (voteFavCookie == "") {
        if (configJSON.hasOwnProperty("default_vote_favourite_settings")) {
            voteFavCookie = configJSON("default_vote_favourite_settings");
        } else {
            voteFavCookie = "1,1";
        }
        setCookie("vote_favourite_settings",voteFavCookie,getCookieDuration());
    }
    var voteFavArray = voteFavCookie.split(',');
    voteFavArray[0] = (voteFavArray[0] == "1" ? "checked" : "");
    voteFavArray[1] = (voteFavArray[1] == "1" ? "checked" : "");
    var showColumnCookie = getCookie("show_column_settings");
    if (showColumnCookie == "") {
        if (configJSON.hasOwnProperty("default_show_column_settings")) {
            showColumnCookie = configJSON("default_show_column_settings");
        } else {
            showColumnCookie = "1,o";
        }
        setCookie("show_column_settings",showColumnCookie,getCookieDuration());
    }
    var showColumnArray = showColumnCookie.split(',');
    showColumnArray[0] = (showColumnArray[0] == "1" ? "checked" : "");
    showColumnArray[1] = (showColumnArray[1] == "1" ? "checked" : "");
    bodyDiv.innerHTML += "<br>Automatically favourite upvoted songs: <input type='checkbox' onclick='_toggleVoteFav(0,this);' "+voteFavArray[0]+"><br>Automatically unfavourite downvoted songs: <input type='checkbox' onclick='_toggleVoteFav(1,this);' "+voteFavArray[1]+">";
    bodyDiv.innerHTML += "<br>Show 'favourite' column: <input type='checkbox' onclick='_toggleColumn(0,this);' "+showColumnArray[0]+"><br>Show 'rating' column: <input type='checkbox' onclick='_toggleColumn(1,this);' "+showColumnArray[1]+">";
    bodyDiv.innerHTML += "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>";
    putOptions();
    populateTabSettingTable();
}

tab_callback();
