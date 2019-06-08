var bodyDiv = document.getElementById("bodyDiv");
insert_before(bodyDiv,"../script/post.js");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";
var allSongsJSONData = "no result";
//success func should check if string
getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;queue();},function(){document.location.href = document.location.href;});

/**
 * Used to update the "Favourites" cookie by either adding or removing a song of specified id to the favourites
 *
 * @param {number} id - the song unique id, as specified by its original index in the getAllSongs JSON
 * @param {boolean} removeBool - specifies whether the song should be removed from favourites (removeBool == true) or added to favourites (removeBool == false)
 */
function _updateFavouriteCookie(id,removeBool) {
    var currCookieData = getCookie("Favourites");
    if (currCookieData === "") {
        setCookie("Favourites",""+id,getCookieDuration());
    } else {
        var favArray = currCookieData.split(',');
        var notPresent = true;
        var presentId = 0;
        for (var i=0; i<favArray.length; i++) {
            if (favArray[i] == id) {
                notPresent = false;
                presentId = i;
                i = favArray.length;
            }
        }
        if (notPresent && !removeBool) {
            currCookieData += ","+id;
            setCookie("Favourites",currCookieData,getCookieDuration());
        }
        if (removeBool && !notPresent) {
            favArray.splice(presentId,1);
            setCookie("Favourites",favArray.join(','),getCookieDuration());
        }
    }
}

/**
 * Callback used to submit an upvote or downvote on form submission
 *
 * @param {Object} event - the event triggered by form submission
 */
function _submitVote(event){
    event.preventDefault();
    //add to favourites
    _updateFavouriteCookie(event.target.elements.namedItem("songNameFormElement").value,(event.target.elements.namedItem("voteValueFormElement").value) < 0);
    function success(request) {
        if (request.status == 404) {
            console.log("404: POST response not found");
        }
        if (request.status == 201||request.status == 200) {
            updateQuery({v:Math.random()});
        }
    }
    function failure(request) {
        console.log("Error sending POST request");
    }
    postRequest(new FormData(event.target),"/vote",success,failure);
}

/**
 * Used to generate a form element with upvote and downvote buttons for a song of particular ID
 *
 * @param {number} id - the song unique id, as specified by its original index in the getAllSongs JSON
 *
 * @returns {Object} formElement - the element for the created HTML form
 */
function createVoteForm(id) {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/register';
    const songName = document.createElement('input');
    songName.type='hidden';
    songName.name='s_id';
    songName.value=id;
    songName.id="songNameFormElement";
    form.appendChild(songName);
    const uidValue = document.createElement('input');
    uidValue.type='hidden';
    uidValue.name='u_id';
    uidValue.value=getCookie("id");
    form.appendChild(uidValue);
    const voteValue = document.createElement('input');
    voteValue.type='hidden';
    voteValue.name='vote';
    voteValue.value='1';
    voteValue.id="voteValueFormElement";
    form.appendChild(voteValue);
    const upvoteButton = document.createElement('button');
    upvoteButton.type='submit';
    upvoteButton.name='vote';
    upvoteButton.value=1;
    upvoteButton.innerHTML="Upvote";
    upvoteButton.id='upvote';
    upvoteButton.title="Upvote song"
    form.appendChild(upvoteButton);
    const downvoteButton = document.createElement('button');
    downvoteButton.type='submit';
    downvoteButton.name='vote';
    downvoteButton.value=-1;
    downvoteButton.innerHTML="Downvote";
    downvoteButton.id='downvote';
    downvoteButton.title="Downvote song"
    downvoteButton.onclick=function(){voteValue.value=-1;};
    form.appendChild(downvoteButton);
    form.addEventListener("submit",_submitVote);
    return form;
}

/**
 * Used for converting a number of seconds into a string formatted "[minutes]:[seconds]" for nice display
 *
 * @param {number} secs - the number of seconds to convert
 *
 * @returns {string} displayString - the formatted string in "[minutes]:[seconds]" corresponding to the supplied argument
 */
function songLengthFormat(secs) {
    var secrem = secs % 60;
    var mins = (secs - secrem)/60;
    if (Math.round(secrem) < 10) {
        return mins + ":0" + Math.round(secrem);
    }
    else {
        return mins + ":" + Math.round(secrem);
    }
}

/**
 * Callback used for refreshing the "downloaded songs" table, for instance, when a new search is made
 */
function _refreshDownloaded() {
    var downloadedVotingTable = document.getElementById("downloadedVotingTable");
    //clear all but first two rows
    const initLength = downloadedVotingTable.rows.length;
    for (var i=2; i<initLength;i++) {
        downloadedVotingTable.deleteRow(-1);
    }
    console.log(downloadedVotingTable.rows.length);
    //sort data
    function stringCompare(str1,str2) {
        var shorterLength = str1.length;
        if (str2.length < shorterLength) {shorterLength = str2.length;}
        for (var i=1; i<shorterLength; i++) {
            if (str1.slice(0,i) !== str2.slice(0,i)) {
                if (str1.slice(0,i) < str2.slice(0,i)) {return -1;}
                else {return 1;}
            }
        }
        if (str1.length == shorterLength) {return -1;}
        else {return 1;}
    }
    function sorter(a,b) {
        if (a.artist === b.artist) {
            //sort by name
            return stringCompare(a.name,b.name);
        } else {
            return stringCompare(a.artist,b.artist);
        }
    }
    allSongsJSONData.sort(sorter);
    //fill table with data
    for (var i=0; i<allSongsJSONData.length; i++) {
        var nameSearchData = document.getElementById("nameSearchInput").value;
        var artistSearchData = document.getElementById("artistSearchInput").value;
        var durationSearchData = document.getElementById("durationSearchInput").value;
        var currSong = allSongsJSONData[i];
        if (currSong.name.toLowerCase().includes(nameSearchData.toLowerCase()) && currSong.artist.toLowerCase().includes(artistSearchData.toLowerCase()) && songLengthFormat(currSong.duration).includes(durationSearchData)) {
            var newRow = downloadedVotingTable.insertRow(-1);
            var nameCell = newRow.insertCell(0);
            var artistCell = newRow.insertCell(1);
            var durationCell = newRow.insertCell(2);
            var voteCell = newRow.insertCell(3);
            nameCell.innerHTML = currSong.name;
            artistCell.innerHTML = currSong.artist;
            durationCell.innerHTML = songLengthFormat(currSong.duration);
            var votingForm = createVoteForm(currSong.songID);
            voteCell.appendChild(votingForm);
        }
    }
}

/**
 * Used to construct and populate a table of downloaded songs
 */
function downloaded() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='downloadedVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Vote</th></tr><tr><td><input type='text' id='nameSearchInput' onchange='_refreshDownloaded()'></td><td><input type='text' id='artistSearchInput' onchange='_refreshDownloaded()'></td><td><input type='text' id='durationSearchInput' onchange='_refreshDownloaded()' size='8'></td><td></td></tr></table>";
    _refreshDownloaded();
}

/**
 * Callback used to populate the table of queued songs with the server's song queue
 *
 * @param {Object} data - the JSON data returned from the GET request requesting song queue
 */
function _queue(data) {
    if (typeof data == "string") {
        console.log("Unable to load user data for uniqueness check: status "+data);
    } else {
        data.sort(function(a,b){return b[2]-a[2];})
        var queueVotingTable = document.getElementById("queueVotingTable");
        for (var i=0; i<data.length; i++) {
            if (data[i][2] > 0) {
                if (data[i][0] < allSongsJSONData.length) {
                    var newRow = queueVotingTable.insertRow(-1);
                    var nameCell = newRow.insertCell(0);
                    var artistCell = newRow.insertCell(1);
                    var durationCell = newRow.insertCell(2);
                    var votesCell = newRow.insertCell(3);
                    var voteCell = newRow.insertCell(4);
                    var currSong = allSongsJSONData[data[i][0]];
                    nameCell.innerHTML = currSong.name;
                    artistCell.innerHTML = currSong.artist;
                    durationCell.innerHTML = songLengthFormat(currSong.duration);
                    votesCell.innerHTML = data[i][2];
                    var votingForm = createVoteForm(data[i][0]);
                    voteCell.appendChild(votingForm);
                }
            }
            else {i = data.length;}
        }
    }
}

/**
 * Used to construct and populate a table of queued songs
 */
function queue() {
    for (var i=0; i<allSongsJSONData.length;i++) {
        allSongsJSONData[i]["songID"] = i; 
    }
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='queueVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Votes</th><th>Vote</th></tr></table>"
    getJson("/vote",_queue,function(data){document.getElementById("listDiv").innerHTML = "Unable to load queue data!";});
}

/**
 * Used to construct and populate a table of songs from the user's "favourites" cookie
 */
function favourites() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='favouritesVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Vote</th></tr></table>";
    var favouritesVotingTable = document.getElementById("favouritesVotingTable");
    var currCookieData = getCookie("Favourites");
    if (!(currCookieData === "")) {
        favArray = currCookieData.split(',');
        var i = 0;
        function failure() {
            i += 1;
            if (i < favArray.length - 1) {
                getJson("/db/music?id="+favArray[i],success,failure);
            }
        }
        function success(data) {
            if (!(typeof data == "string")) {
                var newRow = favouritesVotingTable.insertRow(-1);
                var nameCell = newRow.insertCell(0);
                var artistCell = newRow.insertCell(1);
                var durationCell = newRow.insertCell(2);
                var voteCell = newRow.insertCell(3);
                nameCell.innerHTML = data.name;
                artistCell.innerHTML = data.artist;
                durationCell.innerHTML = songLengthFormat(data.duration);
                var votingForm = createVoteForm(favArray[i]);
                voteCell.appendChild(votingForm);
            }
            failure();
        }
        getJson("/db/music?id="+favArray[0],success,failure)
    }
}

/**
 * Used to construct and populate the fabled "playlists" menu. Does not yet/will exist after version 0.1.0
 * @since 0.1.0
 */
function playlists() {
    document.getElementById("listDiv").innerHTML = "playlist data goes here";
}

/**
 * Used as a lookup table for onclick callbacks for the buttons needed in the 'voting' tab
 *
 * @param {string} name - the tab name: should be one of ["Queue","Downloaded","Favourites","Playlists"]
 *
 * @returns {string|buttonCallback} callback - the callback relating to the given string, or the empty string "" if the 'name' argument is not one of the expected values
 */
function listTabCallback(name) {
    switch(name) {
        case "Queue":
            return queue;
            break;
        case "Downloaded":
            return downloaded;
            break;
        case "Favourites":
            return favourites;
            break;
        case "Playlists":
            return playlists;
            break;
        default:
            return "";
            break;
    }
}

supplyButtons(document.getElementById("listTabsDiv"),listTabCallback);

current_callback();
