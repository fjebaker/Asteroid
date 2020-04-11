"use strict"

var PLAYLISTS = (function(){

var playlist_table = "";

function _clonePlaylist(i) {
    return function() {
        TOOLS.PLAYLISTS.clonePlaylist(PLAYLISTS.playlistNames[i]);
        BODY_CONTENT.clear();
        BODY_CONTENT.populate();
    }
}

function _viewPlaylist(i) {
    return function() {
        TOOLS.QUERIES.virtualRedirect("Voting","Playlist",{"playlist":PLAYLISTS.playlistNames[i]});
    };
}

function _deletePlaylist(i) {
    return function() {
        playlist_table.rows[i+1].style.display = "None";
        TOOLS.PLAYLISTS.deletePlaylist(PLAYLISTS.playlistNames[i]);
    }
}

function _createPlaylist(nameInput,privacyInput) {
    return function() {
        if (nameInput.value != "") {
            TOOLS.PLAYLISTS.createPlaylist(nameInput.value,privacyInput.value);
            TOOLS.QUERIES.virtualRedirect("Voting","Downloads");
        }
    }
}


function _setNameFromInput(cell,oldName) {
    return function() {
        var newName = cell.firstElementChild.value;
        cell.removeChild(cell.firstElementChild);
        cell.innerText = newName;
        TOOLS.PLAYLISTS.renamePlaylist(oldName,newName);
    };
}

function _makeNameInput(cell) {
    return function() {
        var currName = cell.innerText;
        cell.innerText = "";
        var input = document.createElement("input");
        input.value = currName;
        input.onchange = _setNameFromInput(cell,currName);
        cell.appendChild(input);
    };
}

function _makePrivacyInput(select) {
    var privateOpt = document.createElement("option");
    privateOpt.innerText = "Private";
    privateOpt.value = "private";
    var publicOpt = document.createElement("option");
    publicOpt.innerText = "Public";
    publicOpt.value = "public";
    select.appendChild(privateOpt);
    select.appendChild(publicOpt);
}

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "View Playlists") {
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","View","Clone","Privacy","Remove"];
        for (var i = 0; i < labels.length; i++) {
            var newCell = document.createElement("th");
            newCell.innerText = labels[i];
            newRow.appendChild(newCell);
        }
        for (var i = 0; i < PLAYLISTS.playlistNames.length; i++) {
            var newRow = playlist_table.insertRow(-1);
            var nameCell = newRow.insertCell(0);
            nameCell.innerText = PLAYLISTS.playlistNames[i];
            nameCell.onclick = _makeNameInput(nameCell);
            var viewCell = newRow.insertCell(1);
            var viewButton = document.createElement("button");
            viewButton.innerText = "View";
            viewButton.onclick = _viewPlaylist(i);
            viewCell.appendChild(viewButton);
            var cloneCell = newRow.insertCell(2);
            var cloneButton = document.createElement("button");
            cloneButton.innerText = "Clone";
            cloneButton.onclick = _clonePlaylist(i);
            cloneCell.appendChild(cloneButton);
            var privacyCell = newRow.insertCell(3);
            var privacyInput = document.createElement("select");
            _makePrivacyInput(privacyInput);
            privacyCell.appendChild(privacyInput);
            var removeCell = newRow.insertCell(4);
            var removeButton = document.createElement("button");
            removeButton.innerText = "Delete";
            removeButton.onclick = _deletePlaylist(i);
            removeCell.appendChild(removeButton);
        }
        BODY_CONTENT.appendNode(playlist_table);
    } else if (subtab === "Add Playlist") {
        BODY_CONTENT.appendText("Playlist name:","b");
        BODY_CONTENT.appendBreak();
        var nameInput = document.createElement("input");
        BODY_CONTENT.appendNode(nameInput);
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Playlist privacy:","b");
        BODY_CONTENT.appendBreak();
        var privacyInput = document.createElement("select");
        _makePrivacyInput(privacyInput);
        BODY_CONTENT.appendNode(privacyInput);
        BODY_CONTENT.appendBreak();
        var createButton = document.createElement("button");
        createButton.innerText = "Create!";
        createButton.onclick = _createPlaylist(nameInput,privacyInput);
        BODY_CONTENT.appendNode(createButton);
    }
},

playlistNames:PLAYLISTS.playlistNames,

playlistData:PLAYLISTS.playlistData
};
})();

LOADER.tab_scripts["Playlists"] = PLAYLISTS //Capitalised
LOADER.loading_callback();
