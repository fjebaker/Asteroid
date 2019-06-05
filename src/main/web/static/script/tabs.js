//AAAA stuff
var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>"
var tabArr = getCookie("tabs").split(',');
const maxTabSettingIndex = 6;
//0: Voting 1: Rating 2: Queue 3: Downloaded 4: Favourites 5: Playlists

//Lookup table for index - returns tab identifier for given index 'index'
//TODO: error codes good
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
            return "ERROR!";
            break;
    }
}

//Returns whether tab is active for given index 'index'
function getState(index) {
    if (index < maxTabSettingIndex) {
        if (tabArr[index].split(':')[1] == "1") {return "checked";}
        else {return "";}
    }
}

//When a checkbox is checked/unchecked, changes the tab cookies.
//Checkbox index is 'index', checkbox element is 'box'
function changeCallback(index,box) {
    if (index < maxTabSettingIndex) {
        var adder = box.checked ? 1 : 0;
        tabArr[index] = tabArr[index].split(':')[0]+":"+adder;
        setCookie("tabs",tabArr.join(','),getCookieDuration());
        updateQuery({v:Math.random()});
    }
}

//aaa
var tabSettingTable = document.getElementById("tabSettingTable");

for (var i=0; i<maxTabSettingIndex; i++) {
    var newRow = tabSettingTable.insertRow(-1);
    var nameCell = newRow.insertCell(0);
    var buttonCell = newRow.insertCell(1);
    nameCell.innerHTML = getName(i);
    buttonCell.innerHTML = "<input type=\'checkbox\' onclick=\'changeCallback(" + i + ",this);\'" + getState(i) + "></input>";
}

current_callback();
