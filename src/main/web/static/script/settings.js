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
 * Used as a lookup table for tab index to value of the "tab" query keys
 *
 * @param {number} index - the integer index of the tab
 *
 * @returns {string} queryName - the name of the "tab" query string key relating to the index. Returns the empty string "" if the index is out of bounds
 */
function getName(index) {
    switch(index) {
        case 0:
            return "Voting";
            break;
        case 1:
            return "Rating";
            break;
        case 2:
            return "Queue";
            break;
        case 3:
            return "Downloaded";
            break;
        case 4:
            return "Favourites";
            break;
        case 5:
            return "Playlists";
            break;
        default:
            return "";
            break;
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
        if (tabArr[index].split(':')[1] == "1") {return "checked";}
        else {return "";}
    }
}

/**
 * Callback used to change the "tabs" cookie when a checkbox is checked or unchecked
 *
 * @param {number} index - the integer index of the tab
 * @param {Object}
 */
function changeCallback(index,box) {
    var tabArr = getCookie('tabs').split(',');
    if (index < 6) {
        var adder = box.checked ? 1 : 0;
        tabArr[index] = tabArr[index].split(':')[0]+":"+adder;
        setCookie("tabs",tabArr.join(','),getCookieDuration());
        updateQuery({v:Math.random()});
    }
}

function populateTabSettingTable() {
    var tabSettingTable = document.getElementById("tabSettingTable");
    for (var i=0; i<6; i++) {
        var newRow = tabSettingTable.insertRow(-1);
        var nameCell = newRow.insertCell(0);
        var buttonCell = newRow.insertCell(1);
        nameCell.innerHTML = getName(i);
        buttonCell.innerHTML = "<input type=\'checkbox\' onclick=\'changeCallback(" + i + ",this);\'" + _getCheckedState(i) + "></input>";
    }
}

function _toggleVoteFav(index,box) {
    var voteFavArray = getCookie("vote_favourite_settings").split(',');
    voteFavArray[index] = box.checked ? 1 : 0;
    setCookie("vote_favourite_settings",voteFavArray.join(','),getCookieDuration());
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
    if (voteFavCookie == "") {voteFavCookie = "1,1"; setCookie("vote_favourite_settings",voteFavCookie,getCookieDuration());}
    var voteFavArray = voteFavCookie.split(',');
    voteFavArray[0] = (voteFavArray[0] == "1" ? "checked" : "");
    voteFavArray[1] = (voteFavArray[1] == "1" ? "checked" : "");
    bodyDiv.innerHTML += "<br>Automatically favourite upvoted songs: <input type='checkbox' onclick='_toggleVoteFav(0,this);' "+voteFavArray[0]+"><br>Automatically unfavourite downvoted songs: <input type='checkbox' onclick='_toggleVoteFav(1,this);' "+voteFavArray[1]+">";
    bodyDiv.innerHTML += "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>";
    putOptions();
    populateTabSettingTable();
}

tab_callback();
