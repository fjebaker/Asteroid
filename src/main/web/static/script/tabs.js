var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<table style='width:100%' id='tabSettingTable'><tr><th>Tab</th><th>Active</th></tr></table>"
var tabArr = getCookie("tabs").split(',');
const maxTabSettingIndex = 6;
//0: Voting 1: Rating 2: Queue 3: Downloaded 4: Favourites 5: Playlists

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

function getState(index) {
    if (index < maxTabSettingIndex) {
        if (tabArr[index].split(':')[1] == "1") {return "checked";}
        else {return "";}
    }
}

function changeCallback(index,box) {
    if (index < maxTabSettingIndex) {
        var adder = box.checked ? 1 : 0;
        tabArr[index] = tabArr[index].split(':')[0]+":"+adder;
        setCookie("tabs",tabArr.join(','),getCookieDuration());
        window.location.href = window.location.href;
    }
}

var tabSettingTable = document.getElementById("tabSettingTable");

for (var i=0; i<maxTabSettingIndex; i++) {
    var newRow = tabSettingTable.insertRow(-1);
    var nameCell = newRow.insertCell(0);
    var buttonCell = newRow.insertCell(1);
    nameCell.innerHTML = getName(i);
    buttonCell.innerHTML = "<input type=\'checkbox\' onclick=\'changeCallback(" + i + ",this);\'" + getState(i) + "></input>";
}

current_callback();
