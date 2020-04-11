"use strict"

var PLAYLISTS = (function(){

var playlist_table = "";

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

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "View Playlists") {
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","View","Remove","Privacy"];
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
            var removeCell = newRow.insertCell(2);
            var removeButton = document.createElement("button");
            removeButton.innerText = "Delete";
            removeButton.onclick = _deletePlaylist(i);
            removeCell.appendChild(removeButton);
        }
        BODY_CONTENT.appendNode(playlist_table);
    } else if (subtab === "Add Playlist") {
    }
},

playlistNames:PLAYLISTS.playlistNames,

playlistData:PLAYLISTS.playlistData
};
})();

LOADER.tab_scripts["Playlists"] = PLAYLISTS //Capitalised
LOADER.loading_callback();
