"use strict"

var PLAYLISTS = (function(){

var playlist_table = "";
var shuffle_toggle = "";
var timeout_event = "";

function _autoQueueIntelligentWait(songList) {

    function findQueueLength(request) {
        if (request.status == "200") {
            var data = JSON.parse(request.response);
            var length = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].vote > 0) {
                    length += data[i].song.duration;
                }
            }
            length = length * 750;
            var newRow = playlist_table.insertRow(-1);
            var newCell = newRow.insertCell(-1);
            newCell.innerText = "Waiting " + TOOLS.songLengthFormat(Math.floor(length/1000)) + " to queue next song.";
            timeout_event = setTimeout(function(){_autoQueuePlay(songList);},length);
        } else {
            onFail()
        }
    }

    function onFail() {
        var newRow = playlist_table.insertRow(-1);
        var newCell = newRow.insertCell(-1);
        newCell.innerText = "Error: request to queue returned code " + request.status + ". Trying again in 15 seconds."
        timeout_event = setTimeout(function(){_autoQueueIntelligentWait(songList);},15000);
    }

    TOOLS.jsonGetRequest("/vote",findQueueLength,onFail);
}

function _autoQueuePlay(songList) {
    if (songList.length > 0) {

        function voteSuccess(song,songList){
            return function() {
                var newRow = playlist_table.insertRow(-1);
                var newCell = newRow.insertCell(-1);
                newCell.innerText = "Queued song " + song.name + " by " + song.artist + ".";
                _autoQueueIntelligentWait(songList)
            }
        }

        function voteFailure(song,songList){
            return function() {
                var newRow = playlist_table.insertRow(-1);
                var newCell = newRow.insertCell(-1);
                newCell.innerText = "Error: request to vote failed unexpectedly. Trying again in 15 seconds.";
                songList.unshift(song);
                timeout_event = setTimeout(function(){_autoQueueIntelligentWait(songList);},15000);
            }
        }

        var songToPlay;
        if (shuffle_toggle.checked) {
            songToPlay = songList.splice(Math.floor(Math.random()*songList.length),1)[0];
        } else {
            songToPlay = songList.shift();
        }
        console.log(songToPlay);
        var requestData = new FormData();
        requestData.set("s_id",songToPlay.s_id);
        requestData.set("u_id",1);
        var votePower = 1;
        if (CONFIG.hasOwnProperty("upvote-power")) {votePower = parseInt(CONFIG["upvote-power"]);}
        if (isNaN(votePower)) {votePower = 1;}
        requestData.set("vote",votePower);
        var request = new XMLHttpRequest();
        request.open("POST","/vote",true);
        request.onload = voteSuccess(songToPlay,songList);
        request.onerror = voteFailure(songToPlay,songList);
        request.ontimeout = voteFailure(songToPlay,songList);
        request.send(requestData);
    } else {
        var newRow = playlist_table.insertRow(-1);
        var newCell = newRow.insertCell(-1);
        newCell.innerText = "Playlist autoqueue complete. Press 'Stop' button to return.";
    }
}

function _autoQueueRedirect(hashkey) {
    return function() {
        TOOLS.QUERIES.virtualRedirect("Playlists","Autoqueue",{"playlist":hashkey});
    }
}

function _clonePlaylist(hashkey) {
    return function() {
        TOOLS.PLAYLISTS.clonePlaylist(hashkey,"private");
        BODY_CONTENT.clear();
        BODY_CONTENT.populate();
    }
}

function _viewPlaylist(hashkey) {
    return function() {
        TOOLS.QUERIES.virtualRedirect("Voting","Playlist",{"playlist":hashkey});
    };
}

function _deletePlaylist(hashkey) {
    return function() {
        playlist_table.rows[i+1].style.display = "None";
        TOOLS.PLAYLISTS.deletePlaylist(hashkey);
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


function _setNameFromInput(cell,hashkey) {
    return function() {
        var newName = cell.firstElementChild.value;
        cell.removeChild(cell.firstElementChild);
        if (newName !== "") {
            cell.innerText = newName;
            TOOLS.PLAYLISTS.renamePlaylist(hashkey,newName);
        } else {
            cell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["name"];
        }
        cell.onclick = _makeNameInput(cell,hashkey);
    };
}

function _setPrivacy(hashkey,input) {
    return function() {
        TOOLS.PLAYLISTS.changePlaylistPrivacy(hashkey,input.value);
    }
}

function _makeNameInput(cell,hashkey) {
    return function() {
        var currName = cell.innerText;
        cell.innerText = "";
        var input = document.createElement("input");
        input.value = currName;
        input.onchange = _setNameFromInput(cell,hashkey);
        cell.appendChild(input);
        cell.onclick = function() {};
    };
}

function _makePrivacyInput(select) {
    var privateOpt = document.createElement("option");
    privateOpt.innerText = "Private";
    privateOpt.value = "private";
    var viewableOpt = document.createElement("option");
    viewableOpt.innerText = "Publically Viewable";
    viewableOpt.value = "viewable";
    var editableOpt = document.createElement("option");
    editableOpt.innerText = "Publically Editable";
    editableOpt.value = "editable";
    select.appendChild(privateOpt);
    select.appendChild(viewableOpt);
    select.appendChild(editableOpt);
}

return {
populateBody:function(){
    shuffle_toggle = "";
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "My Playlists") {
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","Size","View","Autoqueue","Clone","Privacy","Remove"];
        for (var i = 0; i < labels.length; i++) {
            var newCell = document.createElement("th");
            newCell.innerText = labels[i];
            newRow.appendChild(newCell);
        }
        var favHash = PLAYLISTS.userPlaylistInfo["(favourites)"]["_id"];
        {
            var newRow = playlist_table.insertRow(-1);
            var nameCell = newRow.insertCell(-1);
            nameCell.innerText = "Favourites";
            var sizeCell = newRow.insertCell(-1);
            sizeCell.innerText = PLAYLISTS.userPlaylistInfo["(favourites)"]["size"];
            var viewCell = newRow.insertCell(-1);
            var viewButton = document.createElement("button");
            viewButton.innerText = "View";
            viewButton.onclick = function(){TOOLS.QUERIES.virtualRedirect("Voting","Favourites")};
            viewCell.appendChild(viewButton);
            var autoQueueCell = newRow.insertCell(-1);
            var autoQueueButton = document.createElement("button");
            autoQueueButton.innerText = "Autoqueue";
            autoQueueButton.onclick = _autoQueueRedirect("(favourites)");
            autoQueueCell.appendChild(autoQueueButton)
            var cloneCell = newRow.insertCell(-1);
            var cloneButton = document.createElement("button");
            cloneButton.innerText = "Clone";
            cloneButton.onclick = _clonePlaylist("(favourites)");
            cloneCell.appendChild(cloneButton);
        }
        for (var hashkey in PLAYLISTS.userPlaylistInfo) {
            if (hashkey !== favHash && PLAYLISTS.userPlaylistInfo.hasOwnProperty(hashkey)) {
                var newRow = playlist_table.insertRow(-1);
                var nameCell = newRow.insertCell(-1);
                nameCell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["name"];
                nameCell.onclick = _makeNameInput(nameCell,hashkey);
                var sizeCell = newRow.insertCell(-1);
                sizeCell.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["size"];
                var viewCell = newRow.insertCell(-1);
                var viewButton = document.createElement("button");
                viewButton.innerText = "View";
                viewButton.onclick = _viewPlaylist(hashkey);
                viewCell.appendChild(viewButton);
                var autoQueueCell = newRow.insertCell(-1);
                var autoQueueButton = document.createElement("button");
                autoQueueButton.innerText = "Autoqueue";
                autoQueueButton.onclick = _autoQueueRedirect(hashkey);
                autoQueueCell.appendChild(autoQueueButton)
                var cloneCell = newRow.insertCell(-1);
                var cloneButton = document.createElement("button");
                cloneButton.innerText = "Clone";
                cloneButton.onclick = _clonePlaylist(hashkey);
                cloneCell.appendChild(cloneButton);
                var privacyCell = newRow.insertCell(-1);
                var privacyInput = document.createElement("select");
                _makePrivacyInput(privacyInput);
                privacyInput.onchange = _setPrivacy(hashkey,privacyInput);
                privacyCell.appendChild(privacyInput);
                var removeCell = newRow.insertCell(-1);
                var removeButton = document.createElement("button");
                removeButton.innerText = "Delete";
                removeButton.onclick = _deletePlaylist(hashkey);
                removeCell.appendChild(removeButton);
            }
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
    } else if (subtab === "Public Playlists") {
        TOOLS.PLAYLISTS.refreshPublicPlaylistData();
        playlist_table = document.createElement("table");
        var newRow = playlist_table.insertRow(0);
        var labels = ["Name","Owner","Size","View","Autoqueue","Make Private Copy"];
        for (var i = 0; i < labels.length; i++) {
            var newCell = document.createElement("th");
            newCell.innerText = labels[i];
            newRow.appendChild(newCell);
        }
        for (var hashkey in PLAYLISTS.publicPlaylistInfo) {
            if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(hashkey)) {
                var newRow = playlist_table.insertRow(-1);
                var nameCell = newRow.insertCell(-1);
                nameCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["name"];
                var ownerCell = newRow.insertCell(-1);
                ownerCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["owner"];
                var sizeCell = newRow.insertCell(-1);
                sizeCell.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["size"]
                var viewCell = newRow.insertCell(-1);
                var viewButton = document.createElement("button");
                viewButton.innerText = "View";
                viewButton.onclick = _viewPlaylist(hashkey);
                viewCell.appendChild(viewButton);
                var autoQueueCell = newRow.insertCell(-1);
                var autoQueueButton = document.createElement("button");
                autoQueueButton.innerText = "Autoqueue";
                autoQueueButton.onclick = _autoQueueRedirect(hashkey);
                autoQueueCell.appendChild(autoQueueButton)
                var cloneCell = newRow.insertCell(-1);
                var cloneButton = document.createElement("button");
                cloneButton.innerText = "Clone";
                cloneButton.onclick = _clonePlaylist(hashkey);
                cloneCell.appendChild(cloneButton);
            }
        }
        BODY_CONTENT.appendNode(playlist_table);
    } else if (subtab === "Autoqueue") {
        TABS_CONTENT.clear();
        var hashkey = TOOLS.PLAYLISTS.getCurrentPlaylistName();

        function autoQueueList(request) {
            if (request.status == "200") {
                var data = JSON.parse(request.response);
                var playlistInfo = data["info"];
                var songData = data["songs"];
                BODY_CONTENT.appendText("Autoqueueing ");
                BODY_CONTENT.appendText(playlistInfo.name,'b');
                BODY_CONTENT.appendText(" by ");
                BODY_CONTENT.appendText(playlistInfo.owner,'i');
                BODY_CONTENT.appendText(". Shuffle: ");
                shuffle_toggle = document.createElement("input");
                shuffle_toggle.type = "checkbox";
                BODY_CONTENT.appendNode(shuffle_toggle);
                BODY_CONTENT.appendBreak();
                BODY_CONTENT.appendText("Stop autoqueueing: ")
                var stopButton = document.createElement("button");
                stopButton.innerText = "Stop";
                stopButton.onclick = function() {
                    TABS_CONTENT.populate();
                    TOOLS.QUERIES.virtualRedirect("Playlists","My Playlists");
                }
                BODY_CONTENT.appendNode(stopButton);
                BODY_CONTENT.appendBreak();
                playlist_table = document.createElement("table");
                BODY_CONTENT.appendNode(playlist_table);
                _autoQueueIntelligentWait(songData);
                stopButton.onclick = function() {
                    TABS_CONTENT.populate();
                    clearTimeout(timeout_event);
                    TOOLS.QUERIES.virtualRedirect("Playlists","My Playlists");
                }
            } else {
                TOOLS.QUERIES.virtualRedirect("Playlists","My Playlists");
            }
        }

        if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(hashkey)) {
            TOOLS.jsonGetRequest("/db/playlists/"+hashkey,autoQueueList,function(){TOOLS.QUERIES.virtualRedirect("Playlists","My Playlists");});
        } else { //TODO make request secure
            TOOLS.jsonGetRequest("/db/playlists/"+hashkey,autoQueueList,function(){TOOLS.QUERIES.virtualRedirect("Playlists","My Playlists");});
        }

    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
},

userPlaylistInfo:PLAYLISTS.userPlaylistInfo,
publicPlaylistInfo:PLAYLISTS.publicPlaylistInfo
};
})();

LOADER.tab_scripts["Playlists"] = PLAYLISTS //Capitalised
LOADER.loading_callback();
