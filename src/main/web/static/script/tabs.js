var bodyDiv = document.getElementById("bodyDiv"); //This is standard for all HTML files
bodyDiv.innerHTML = "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>" //Is writing over this acceptable?
var tabArr = getCookie("tabs").split(',');
const maxTabSettingIndex = 6;
//0: Voting 1: Rating 2: Queue 3: Downloaded 4: Favourites 5: Playlists

/**
 * Used as a lookup table for tab index to value of the "tab" query keys
 *
 * @param {number} index - the integer index of the tab
 *
 * @returns {string} queryName - the name of the "tab" query string key relating to the index. Returns the empty string "" if the index is out of bounds
 */
function getName(index) {
    switch (index) {
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
    if (index < maxTabSettingIndex) {
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
    if (index < maxTabSettingIndex) {
        var adder = box.checked ? 1 : 0;
        tabArr[index] = tabArr[index].split(':')[0]+":"+adder;
        setCookie("tabs",tabArr.join(','),getCookieDuration());
        updateQuery({v:Math.random()});
    }
}

//this is okay (include meme.png here)
var tabSettingTable = document.getElementById("tabSettingTable");

for (var i=0; i<maxTabSettingIndex; i++) {
    var newRow = tabSettingTable.insertRow(-1);
    var nameCell = newRow.insertCell(0);
    var buttonCell = newRow.insertCell(1);
    nameCell.innerHTML = getName(i);
    buttonCell.innerHTML = "<input type=\'checkbox\' onclick=\'changeCallback(" + i + ",this);\'" + _getCheckedState(i) + "></input>";
}

current_callback();
