"use strict"

var VOTING = (function(){

var columnList = [];
var expansionColumns = [];
var doubleExpansionColumns = [];
var song_table;
var song_table_head;
var song_table_body;
var song_table_foot;
var playlist_adding_selector;

var user_id_waiting = {};
var user_id_names = {};

const searchableColumns = ["Artist","Name"];

function _autoQueueRedirect(hashkey) {
    return function() {
        TOOLS.QUERIES.virtualRedirect("Playlists","Autoqueue",{"playlist":hashkey});
    }
}

function _addSongToPlaylist(id) {
    return function() {
        if (playlist_adding_selector.value != "Choose playlist...") {
            TOOLS.PLAYLISTS.pushSongToPlaylist(id,playlist_adding_selector.value);
        }
    }
}

function _removeSongFromPlaylist(row,id) {
    return function() {
        TOOLS.PLAYLISTS.removeSongFromPlaylist(id,playlist_adding_selector.value);
        row.parentNode.removeChild(row);
    }
}

function _dropdownPlaylistAdd(cell,id) {

    function adding_onchange() {
        _addSongToPlaylist(id)();
        playlist_adding_selector.onchange = function() {};
        playlist_adding_selector.parentNode.removeChild(playlist_adding_selector);
    }

    return function() {
        cell.appendChild(playlist_adding_selector);
        playlist_adding_selector.value = "Choose playlist...";
        playlist_adding_selector.onchange = adding_onchange;
    }
}

function _searchTable(row) {
    return function() {
        var changed = false;
        var additionalPairs = {}
        for (var i = 0; i < columnList.length; i++) {
            var columnKey = columnList[i];
            if (searchableColumns.includes(columnKey)) {
                var input = row.cells[i].firstElementChild;
                if (input.value != "") {
                    changed = true;
                    additionalPairs[columnKey] = input.value;
                }
            }
        }
        if (changed) {
            TOOLS.QUERIES.virtualRedirect("Voting","Downloaded",additionalPairs);
        } else {
            TOOLS.QUERIES.virtualRedirect("Voting","Downloaded");
        }
    }
}

function _clearSongTable() {
    while (song_table.firstChild) {song_table.removeChild(song_table.firstChild);}
    song_table_head = song_table.createTHead();
    song_table_body = document.createElement("tbody");
    song_table.appendChild(song_table_body);
    song_table_foot = song_table.createTFoot();
    playlist_adding_selector = document.createElement("select");
    var initOption = document.createElement("option");
    initOption.innerText = "Choose playlist...";
    playlist_adding_selector.appendChild(initOption);
    for (var hashkey in PLAYLISTS.userPlaylistInfo) {
        if (PLAYLISTS.userPlaylistInfo.hasOwnProperty(hashkey) && PLAYLISTS.userPlaylistInfo[hashkey]["_id"] === hashkey) {
            var option = document.createElement("option");
            option.innerText = PLAYLISTS.userPlaylistInfo[hashkey]["name"];
            option.value = hashkey
            playlist_adding_selector.appendChild(option);
        }
    }
    var sortedPublicData = {};
    const ownUsername = TOOLS.AUTH.getUsername();
    for (var hashkey in PLAYLISTS.publicPlaylistInfo) {
        if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(hashkey)) {
            var ownerName = PLAYLISTS.publicPlaylistInfo[hashkey]["owner"];
            if (ownerName !== ownUsername) {
                if (!sortedPublicData.hasOwnProperty(ownerName)) {
                    sortedPublicData[ownerName] = [];
                }
                sortedPublicData[ownerName].push(hashkey);
            }
        }
    }
    for (var userName in sortedPublicData) {
        if (sortedPublicData.hasOwnProperty(userName)) {
            var userOption = document.createElement("option");
            userOption.innerText = "Public - "+userName;
            userOption.disabled = true;
            playlist_adding_selector.appendChild(userOption);
            for (var i = 0; i < sortedPublicData[userName].length; i++) {
                var hashkey = sortedPublicData[userName][i];
                var option = document.createElement("option");
                option.innerText = PLAYLISTS.publicPlaylistInfo[hashkey]["name"];
                option.value = hashkey
                playlist_adding_selector.appendChild(option);
            }
        }
    }
}

function _addTopRow() {
    var topRow = song_table_head.insertRow(-1);
    topRow.className = "song_table_title_row";
    for (var i = 0; i < columnList.length; i++) {
        var columnKey = columnList[i];
        if (!SETTINGS.showColumnArray.hasOwnProperty(columnKey) || SETTINGS.showColumnArray[columnKey] == 1) {
            var newCell = document.createElement('th');
            newCell.innerText = columnList[i];
            if (columnKey == "Add To Playlist") {
                newCell.appendChild(playlist_adding_selector);
            }
            topRow.appendChild(newCell);
        }
    }
}

function _toggleExtraInfo(row) {
    return function() {
        var nextRow = row.nextSibling;
        if (MISC_INFO.screen_size == "small") {
            const isVisible = (nextRow.style.display == '' || nextRow.style.display == null);
            nextRow.style.display = isVisible ? 'None' : '';
        }
        nextRow = nextRow.nextSibling;
        const isVisible = (nextRow.style.display == '' || nextRow.style.display == null);
        nextRow.style.display = isVisible ? 'None' : '';
    }
}

function _toggleFavouriteButton(button,favouritedStatus,songId) {
    return function(){
        //Push the new favourites array to the server TODO
        var itemIndex = PLAYLISTS.userPlaylistInfo["(favourites)"]["sid_data"].indexOf(songId);
        if (favouritedStatus && itemIndex === -1) {
            TOOLS.PLAYLISTS.pushSongToPlaylist(songId,"(favourites)");
        } else if (!favouritedStatus && itemIndex !== -1) {
            TOOLS.PLAYLISTS.removeSongFromPlaylist(songId,"(favourites)");
        }
        //Reformat button
        var newFavouritedStatus = PLAYLISTS.userPlaylistInfo["(favourites)"]["sid_data"].includes(songId);
        button.innerText = newFavouritedStatus ? "Unfavourite" : "Favourite";
        button.className = newFavouritedStatus ? "unfavourite_button" : "favourite_button";
        button.title = newFavouritedStatus ? "Remove from favourites" : "Add to favourites";
        button.onclick = _toggleFavouriteButton(button,!newFavouritedStatus,songId);
    };
}

function _voteSong(id,upBool,parentRow) {
    var powerStr = upBool ? "upvote-power" : "downvote-power";
    var powerSign = upBool ? 1 : -1;
    var autoFaveStr = upBool ? "Automatically Favourite Upvoted Songs" : "Automatically Unfavourite Downvoted Songs"
    return function() {
        //const uid = TOOLS.AUTH.getUid();
        //Temporary fix whilst user stuff not implemented - REMOVE once uid implemented
        const uid = 1;
        var requestData = new FormData();
        requestData.set("s_id",id);
        requestData.set("u_id",uid);
        var votePower = 1;
        if (CONFIG.hasOwnProperty(powerStr)) {votePower = parseInt(CONFIG[powerStr]);}
        if (isNaN(votePower)) {votePower = 1;}
        requestData.set("vote",powerSign*Math.abs(votePower));
        var autoFavourite = SETTINGS.autoFaveSettings[autoFaveStr];
        if (autoFavourite == 1) {
            //Work out which the favourite button is
            var button = "";
            if (columnList.includes("Favourite")) {
                button = parentRow.cells[columnList.indexOf("Favourite")].firstElementChild;
            } else if (expansionColumns.includes("Favourite")) {
                button = parentRow.nextSibling.cells[expansionColumns.indexOf("Favourite")].firstElementChild;
            } else if (doubleExpansionColumns.includes("Favourite")) {
                button = parentRow.nextSibling.nextSibling.cells[doubleExpansionColumns.indexOf("Favourite")].firstElementChild;
            }
            if (button !== "") {
                _toggleFavouriteButton(button,upBool,id)();
            }
        }
        var request = new XMLHttpRequest();

        function redirect() {
            //TOOLS.QUERIES.virtualRedirect(false);
        }

        request.open('POST',"/vote",true);
        request.onload = redirect;
        request.onerror = redirect;
        request.ontimeout = redirect;
        request.send(requestData);
    }
}

function _addSong(songData,index) {
    var newRow = song_table_body.insertRow(index);
    if (MISC_INFO.screen_size !== "big") {
        if (index !== -1) {
            index++;
        }
        var secondRow = song_table.insertRow(index);
        if (index !== -1) {
            index++;
        }
        var thirdRow = song_table.insertRow(index);
        secondRow.style.display = 'None';
        thirdRow.style.display = 'None';
        secondRow.classText = "hidden_row_"+MISC_INFO.screen_size;
        thirdRow.classText = "hidden_row_"+MISC_INFO.screen_size;
    }
    var fullColumnList = [];
    var currRowList = [];
    for (var i = 0; i < columnList.length; i++) {
        fullColumnList.push(columnList[i]);
        currRowList.push(newRow);
    }
    for (var i = 0; i < expansionColumns.length; i++) {
        fullColumnList.push(expansionColumns[i]);
        currRowList.push(secondRow);
    }
    for (var i = 0; i < doubleExpansionColumns.length; i++) {
        fullColumnList.push(doubleExpansionColumns[i]);
        currRowList.push(thirdRow);
    }
    for (var i = 0; i < fullColumnList.length; i++) {
        var columnKey = fullColumnList[i];
        var currRow = currRowList[i];
        if (!SETTINGS.showColumnArray.hasOwnProperty(columnKey) || SETTINGS.showColumnArray[columnKey] == 1) {
            var newCell = currRow.insertCell(-1);
            switch(columnKey) {
                case "Name":
                    if (MISC_INFO.screen_size == "big") {
                        newCell.innerText = songData.name;
                    } else {
                        var u = document.createElement("u");
                        u.innerText = songData.name;
                        newCell.appendChild(u);
                        newCell.onclick = _toggleExtraInfo(newRow);
                    }
                    break;
                case "Artist":
                    newCell.innerText = songData.artist;
                    break;
                case "Duration":
                    newCell.innerText = TOOLS.songLengthFormat(songData.duration);
                    break;
                case "Vote":
                    var upvoteButton = document.createElement("button");
                    upvoteButton.innerText = "Upvote";
                    upvoteButton.className = "upvote_button";
                    upvoteButton.title = "Upvote song";
                    upvoteButton.onclick = _voteSong(songData.s_id,true,newRow);
                    newCell.appendChild(upvoteButton);
                    var downvoteButton = document.createElement("button");
                    downvoteButton.innerText = "Downvote";
                    downvoteButton.className = "downvote_button";
                    downvoteButton.title = "Downvote song";
                    downvoteButton.onclick = _voteSong(songData.s_id,false,newRow);
                    newCell.appendChild(downvoteButton);
                    break;
                case "Favourite":
                    var favouriteButton = document.createElement("button");
                    var favouritedStatus = PLAYLISTS.userPlaylistInfo["(favourites)"]["sid_data"].includes(songData.s_id);
                    _toggleFavouriteButton(favouriteButton,favouritedStatus,songData.s_id)();
                    newCell.appendChild(favouriteButton);
                    break;
                case "Requesting User":
                    if (user_id_names.hasOwnProperty(songData.requesting_user)) {
                        newCell.innerText = user_id_names[songData.requesting_user];
                    } else if (user_id_waiting.hasOwnProperty(songData.requesting_user)) {
                        newCell.innerText = "UID "+songData.requesting_user;
                        user_id_waiting[songData.requesting_user].push(newCell);
                    } else {
                        newCell.innerText = "UID "+songData.requesting_user;
                        user_id_waiting[songData.requesting_user] = [newCell];
                    }
                    break;
                case "Votes":
                    var upvotePower = 1;
                    if (CONFIG.hasOwnProperty("upvote-power")) {upvotePower = parseInt(CONFIG["upvote-power"]);}
                    if (isNaN(upvotePower)) {upvotePower = 1;}
                    newCell.innerText = songData.votes_for/upvotePower;
                    break;
                case "Add To Playlist":
                    var addButton = document.createElement("button");
                    addButton.innerText = "Add to playlist";
                    addButton.title = "Add to playlist";
                    if (playlist_adding_selector.parentNode !== null) {
                        addButton.className = "play_add_button";
                        addButton.onclick = _addSongToPlaylist(songData.s_id);
                    } else {
                        addButton.className = "play_add_dropdown_button";
                        addButton.onclick = _dropdownPlaylistAdd(newCell,songData.s_id);
                    }
                    newCell.appendChild(addButton);
                    break;
                case "Remove From Playlist":
                    var removeButton = document.createElement("button");
                    removeButton.innerText = "Remove from playlist";
                    removeButton.title = "Remove from playlist";
                    removeButton.className = "play_remove_button";
                    removeButton.onclick = _removeSongFromPlaylist(currRow,songData.s_id);
                    newCell.appendChild(removeButton);
                default:
                    break;
            }
        }
    }
}

function _addSearchBar(query) {
    var topRow = song_table_head.insertRow(-1);
    topRow.className = "song_table_search_row";
    for (var i = 0; i < columnList.length; i++) {
        var columnKey = columnList[i];
        if (!SETTINGS.showColumnArray.hasOwnProperty(columnKey) || SETTINGS.showColumnArray[columnKey] == 1) {
            var newCell = topRow.insertCell(-1);
            if (searchableColumns.includes(columnKey)) {
                var input = document.createElement("input");
                input.onchange = _searchTable(topRow);
                if (query.hasOwnProperty(columnKey.toLowerCase())) {
                    input.value = query[columnKey.toLowerCase()];
                }
                newCell.appendChild(input);
            }
        }
    }
}

function _addBottomMessage(message) {
    var bottomRow = song_table_foot.insertRow(-1);
    var newCell = bottomRow.insertCell(0);
    newCell.colSpan = columnList.length;
    newCell.innerText = message;
}

function _recentlyRequested() {
    BODY_CONTENT.appendNode(song_table);
    if (MISC_INFO.screen_size == "big") {
        columnList = ["Name","Artist","Duration","Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
        doubleExpansionColumns = [];
    } else if (MISC_INFO.screen_size == "medium") {
        columnList = ["Name","Artist","Duration"];
        doubleExpansionColumns = ["Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
    } else {
        columnList = ["Name","Artist"];
        expansionColumns = ["Duration","Add To Playlist"];
        doubleExpansionColumns = ["Vote","Favourite"];
    }
    _addTopRow();

    function getRecent(request) {
        if (request.status == "200") {
            var data = JSON.parse(request.response);
            for (var i = 0; i < data.length; i++) {
                _addSong(data[i],-1);
            }
        } else {
            _addBottomMessage("Request for queue songs returned unexpected response code ("+request.status+")");
        }
    }

    function getRecentFailure() {
        _addBottomMessage("Request for recently requested songs failed unexpectedly");
    }

    TOOLS.jsonGetRequest("/db/songs",getRecent,getRecentFailure);
}

function _playlist(hashkey) {
    var ownerName = TOOLS.AUTH.getUid();
    //Do requests to get this page of songs

    function getPlaylistSongs(request) {
        if (request.status == "200") {
            var data = JSON.parse(request.response);
            var playlistInfo = data["info"];
            var songData = data["songs"];
            BODY_CONTENT.appendText(playlistInfo.name,'b');
            BODY_CONTENT.appendText(' by ');
            BODY_CONTENT.appendText(playlistInfo.owner,'i');
            BODY_CONTENT.appendBreak();
            var autoQueueButton = document.createElement("button");
            autoQueueButton.innerText = "Autoqueue";
            autoQueueButton.onclick = _autoQueueRedirect(playlistInfo["_id"]);
            BODY_CONTENT.appendNode(autoQueueButton);
            BODY_CONTENT.appendBreak();
            BODY_CONTENT.appendNode(song_table);
            playlist_adding_selector.value = playlistInfo["_id"];
            if (MISC_INFO.screen_size == "big") {
                columnList = ["Name","Artist","Duration","Vote","Favourite"];
                if (playlistInfo["privacy"] === "editable" || playlistInfo["owner"] === ownerName) {
                    columnList.push("Remove From Playlist")
                }
                expansionColumns = [];
                doubleExpansionColumns = [];
            } else if (MISC_INFO.screen_size == "medium") {
                columnList = ["Name","Artist","Duration"];
                doubleExpansionColumns = ["Vote","Favourite"];
                if (playlistInfo["privacy"] === "editable" || playlistInfo["owner"] === ownerName) {
                    doubleExpansionColumns.push("Remove From Playlist")
                }
                expansionColumns = [];
            } else {
                columnList = ["Name","Artist"];
                expansionColumns = ["Duration"];
                if (playlistInfo["privacy"] === "editable" || playlistInfo["owner"] === ownerName) {
                    expansionColumns.push("Remove From Playlist")
                }
                doubleExpansionColumns = ["Vote","Favourite"];
            }
            if (playlistInfo["owner"] === ownerName) {
                if (PLAYLISTS.userPlaylistInfo.hasOwnProperty(playlistInfo["_id"])) {
                    for (var key in playlistInfo) {
                        if (PLAYLISTS.userPlaylistInfo[playlistInfo["_id"]].hasOwnProperty(key)) {
                            PLAYLISTS.userPlaylistInfo[playlistInfo["_id"]][key] = playlistInfo[key];
                        }
                    }
                } else {
                    PLAYLISTS.userPlaylistInfo[playlistInfo["_id"]] = playlistInfo;
                }
            }
            if (playlistInfo["privacy"] !== "private"){
                if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(playlistInfo["_id"])) {
                    for (var key in playlistInfo) {
                        if (PLAYLISTS.publicPlaylistInfo[playlistInfo["_id"]].hasOwnProperty(key)) {
                            PLAYLISTS.publicPlaylistInfo[playlistInfo["_id"]][key] = playlistInfo[key];
                        }
                    }
                } else {
                    PLAYLISTS.publicPlaylistInfo[playlistInfo["_id"]] = playlistInfo;
                }
            }
            _addTopRow();
            for (var i = 0; i < songData.length; i++) {
                _addSong(songData[i],-1);
            }
        } else if (request.status == "401") {
            BODY_CONTENT.appendNode(song_table);
            _addBottomMessage("Request for playlist songs returned code 401: you do not have valid authorisation to view it.");
        } else {
            BODY_CONTENT.appendNode(song_table);
            _addBottomMessage("Request for playlist songs returned unexpected response code ("+request.status+")");
        }
    }

    function getPlaylistSongsFailure() {
        BODY_CONTENT.appendNode(song_table);
        _addBottomMessage("Request for playlist songs failed unexpectedly");
    }

    if (PLAYLISTS.publicPlaylistInfo.hasOwnProperty(hashkey)) {
        TOOLS.jsonGetRequest("/db/playlists/"+hashkey,getPlaylistSongs,getPlaylistSongsFailure);
    } else { //TODO make request secure
        TOOLS.jsonGetRequest("/db/playlists/"+hashkey,getPlaylistSongs,getPlaylistSongsFailure);
    }
}

function _downloaded(query) {
    BODY_CONTENT.appendNode(song_table);
    if (MISC_INFO.screen_size == "big") {
        columnList = ["Name","Artist","Duration","Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
        doubleExpansionColumns = [];
    } else if (MISC_INFO.screen_size == "medium") {
        columnList = ["Name","Artist","Duration"];
        doubleExpansionColumns = ["Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
    } else {
        columnList = ["Name","Artist"];
        expansionColumns = ["Duration","Add To Playlist"];
        doubleExpansionColumns = ["Vote","Favourite"];
    }
    _addTopRow();
    if (query === null) {
        _addSearchBar({});
    } else {
        _addSearchBar(query);
    }

    function downloadSuccess(request) {
        if (request.status == 200) {
            var data = JSON.parse(request.response);
            for (var i = 0; i < data.length; i++) {
                _addSong(data[i],-1);
            }
        } else {
            _addBottomMessage("Request for downloaded songs returned unexpected response code ("+request.status+")");
        }
    }

    function downloadFailure() {
        _addBottomMessage("Request for recently requested songs failed unexpectedly");
    }

    var queryStr = "";  // EMPTIED
    if (query !== null) {
        for (var key in query) {
            if (query.hasOwnProperty(key) && query[key] != "") {
                queryStr += "&" + key + "=" + query[key];
            }
        }
        queryStr = queryStr.substr(1);
    }

    TOOLS.jsonGetRequest("/db/songs?"+queryStr,downloadSuccess,downloadFailure);
}

function _queue() {
    BODY_CONTENT.appendNode(song_table);
    if (MISC_INFO.screen_size == "big") {
        columnList = ["Name","Artist","Duration","Requesting User","Votes","Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
        doubleExpansionColumns = [];
    } else if (MISC_INFO.screen_size == "medium") {
        columnList = ["Name","Artist","Duration","Votes"];
        doubleExpansionColumns = ["Requesting User","Vote","Favourite","Add To Playlist"];
        expansionColumns = [];
    } else {
        columnList = ["Name","Artist","Votes"];
        expansionColumns = ["Duration","Requesting User","Add To Playlist"];
        doubleExpansionColumns = ["Vote","Favourite"];
    }
    _addTopRow();

    function getQueue(request) {
        if (request.status == "200") {
            var data = JSON.parse(request.response);
            if (data.length > 0) {
                data.sort(function(a,b){return b.vote-a.vote;}) //sorting by vote order
                var last_index = data.findIndex(function(song){return song.vote <= 0;});
                last_index = (last_index > 0) ? last_index + 1 : data.length;
                last_index = (data[last_index-1].vote <= 0) ? last_index-1 : last_index;
                data = data.slice(0,last_index);
                if (data[0].vote == 0) {data = [];}
                for (var i = 0; i < data.length; i++) {
                    data[i].song.requesting_user = data[i].u_id;
                    data[i].song.votes_for = data[i].vote;
                    _addSong(data[i].song,-1);
                }
            } else {
                _addBottomMessage("No songs found in the queue! Go to other tabs and get upvoting!");
            }
        } else {
            _addBottomMessage("Request for queue data returned unexpected response code ("+request.status+")");
        }
    }

    function getQueueFailure() {
        _addBottomMessage("Request for queue data failed unexpectedly");
    }

    TOOLS.jsonGetRequest("/vote",getQueue,getQueueFailure);

}

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (song_table === undefined) {
        console.log("Creating song table!");
        song_table = document.createElement("table");
        song_table.style.width = "100%";
        song_table.className = "song_table";
    }
    _clearSongTable();
    if (subtab === "Queue") {
        _queue();
    } else if (subtab === "Recently Requested") {
        _recentlyRequested();
    } else if (subtab === "Favourites") {
        _playlist(PLAYLISTS.userPlaylistInfo["(favourites)"]["_id"]);
    } else if (subtab === "Downloaded") {
        _downloaded(TOOLS.QUERIES.getDownloadedSearchQuery());
    } else if (subtab === "Playlist") {
        _playlist(TOOLS.PLAYLISTS.getCurrentPlaylistName());
    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
}
};
})();

LOADER.tab_scripts["Voting"] = VOTING
LOADER.loading_callback();
