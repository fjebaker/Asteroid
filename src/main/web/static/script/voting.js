var bodyDiv = document.getElementById("bodyDiv");
insert_before(bodyDiv,"../script/post.js");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>Redirecting to relevant tab...</div>";
queue();

//var allSongsJSONData = "no result";
//success func should check if string
//getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;queue();},function(){document.location.href = document.location.href;});

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
        var updateableElem = document.getElementById("tableFavCell"+id);
        if (updateableElem !== null) {
            updateableElem.innerHTML="<button id='unfavourite' title='Remove from favourites' onclick='_updateFavouriteCookie("+id+",true)'>Unfavourite</button>"
        }
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
            var updateableElem = document.getElementById("tableFavCell"+id);
            if (updateableElem !== null) {
                updateableElem.innerHTML="<button id='unfavourite' title='Remove from favourites' onclick='_updateFavouriteCookie("+id+",true)'>Unfavourite</button>"
            }
        }
        if (removeBool && !notPresent) {
            favArray.splice(presentId,1);
            setCookie("Favourites",favArray.join(','),getCookieDuration());
            var updateableElem = document.getElementById("tableFavCell"+id);
            if (updateableElem !== null) {
                updateableElem.innerHTML="<button id='favourite' title='Add to favourites' onclick='_updateFavouriteCookie("+id+",false)'>Favourite</button>"
            }
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
 * Used to check if string1 is alphabetically before string2 to sort songs alphabetically
 */
function _stringCompare(str1,str2) {
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

/**
 * Used to sort songs
 */
function _sorter(a,b) {
    if (a.artist === b.artist) {
        //sort by name
        return _stringCompare(a.name,b.name);
    } else {
        return _stringCompare(a.artist,b.artist);
    }
}

/**
 * Callback used for refreshing the "downloaded songs" table after a search
 */
function _refreshSearch(data) {
    var currentResultsNo = document.getElementById("currentResultsNo");
    if (typeof data == "string") {
        currentResultsNo.innerHTML = "Unable to load songs list! Status code: "+data;
    } else {
        currentResultsNo.innerHTML = "Loaded "+data.length+" songs.";
        data.sort(_sorter);
        _refreshNoSearch(data);
    }
}

/**
 * Callback used for refreshing the "downloaded songs" table after no search
 */
function _refreshNoSearch(data) {
    var downloadedVotingTable = document.getElementById("downloadedVotingTable");
    if (typeof data == "string") {
        var currentResultsNo = document.getElementById("currentResultsNo");
        currentResultsNo.innerHTML = "Unable to load songs list! Status code: "+data;
    } else {
        var favArray = getCookie("Favourites").split(",");
        for (var i=0; i<data.length; i++) {
            var currSong = data[i];
            var newRow = downloadedVotingTable.insertRow(-1);
            var nameCell = newRow.insertCell(0);
            var artistCell = newRow.insertCell(1);
            var durationCell = newRow.insertCell(2);
            var voteCell = newRow.insertCell(3);
            var favCell = newRow.insertCell(4);
            nameCell.innerHTML = currSong.name;
            artistCell.innerHTML = currSong.artist;
            if(currSong.artist == "Joe Bonamassa") {artistCell.innerHTML = "Jonathan Peepeepoopoo";}
            durationCell.innerHTML = songLengthFormat(currSong.duration);
            var votingForm = createVoteForm(currSong.rowid)
            voteCell.appendChild(votingForm);
            favCell.id="tableFavCell"+currSong.rowid.toString();
            if (favArray.includes(currSong.rowid.toString())) {
                favCell.innerHTML="<button id='unfavourite' title='Remove from favourites' onclick='_updateFavouriteCookie("+currSong.rowid+",true)'>Unfavourite</button>"
            } else {
                favCell.innerHTML="<button id='favourite' title='Add to favourites' onclick='_updateFavouriteCookie("+currSong.rowid+",false)'>Favourite</button>";
            }
        }
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
    //console.log(downloadedVotingTable.rows.length);
    //check whether search strings are needed
    var nameSearchData = document.getElementById("nameSearchInput").value;
    var artistSearchData = document.getElementById("artistSearchInput").value;
    function failure(data) {document.getElementById("currentResultsNo").innerHTML = "Unable to load songs list!"}
    if (nameSearchData === "") {
        if (artistSearchData === "") {
            //Get data using /db/music?page={}
            getJson("/db/music?page=1",_refreshNoSearch,failure);
            //getJson("/db/music?page="+document.getElementById("pageLoadNumber").value,_refreshNoSearch,failure);
            //document.getElementById("pageLoadNumber").value += 1;
        } else {
            //Get data using /db/music?artist={}
            getJson("/db/music?artist="+artistSearchData,_refreshSearch,failure);
        }
    } else {
        if (artistSearchData === "") {
            //Get data using /db/music?name={}
            getJson("/db/music?name="+nameSearchData,_refreshSearch,failure);
        } else {
            //Get data using /db/music?artist={}&name={}
            getJson("/db/music?artist="+artistSearchData+"&name="+nameSearchData,_refreshSearch,failure);
        }
    }
}

/**
 * Used to construct and populate a table of downloaded songs
 */
function downloaded() {
    document.getElementById("listDiv").innerHTML = "<em id='currentResultsNo'></em><table style='width:100%' id='downloadedVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Vote</th><th>Favourite</th></tr><tr><td><input type='text' id='nameSearchInput' onchange='_refreshDownloaded()'></td><td><input type='text' id='artistSearchInput' onchange='_refreshDownloaded()'></td><td></td><td></td><td></td></tr></table>";
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
        var usernameLookup = {};
        data.sort(function(a,b){return b[2]-a[2];})
        function queueBuild(songsIdData) {
            if (typeof songsIdData == "string") {console.log("Unable to do the multi-id call");}
            else {
                var queueVotingTable = document.getElementById("queueVotingTable");
                var noValid = data.length;
                var favArray = getCookie("Favourites").split(",");
                for (var i=0; i<data.length; i++) {
                    if (data[i][2] > 0) {
                        var newRow = queueVotingTable.insertRow(-1);
                        var nameCell = newRow.insertCell(0);
                        var artistCell = newRow.insertCell(1);
                        var durationCell = newRow.insertCell(2);
                        var userCell = newRow.insertCell(3);
                        var votesCell = newRow.insertCell(4);
                        var voteCell = newRow.insertCell(5);
                        var favCell = newRow.insertCell(6);
                        var currSong = songsIdData[i];
                        nameCell.innerHTML = currSong.name;
                        artistCell.innerHTML = currSong.artist;
                        durationCell.innerHTML = songLengthFormat(currSong.duration);
                        userCell.innerHTML = data[i][1].toString();
                        userCell.id = "queueVotingIDCellNo"+i;
                        votesCell.innerHTML = data[i][2];
                        var votingForm = createVoteForm(currSong.rowid);
                        voteCell.appendChild(votingForm);
                        favCell.id="tableFavCell"+currSong.rowid.toString();
                        if (favArray.includes(currSong.rowid.toString())) {
                            favCell.innerHTML="<button id='unfavourite' title='Remove from favourites' onclick='_updateFavouriteCookie("+currSong.rowid+",true)'>Unfavourite</button>"
                        } else {
                            favCell.innerHTML="<button id='favourite' title='Add to favourites' onclick='_updateFavouriteCookie("+currSong.rowid+",false)'>Favourite</button>";
                        }
                    }
                    else {noValid = i;i = data.length;}
                } //end of for loop
                function replaceHTML(data,i,string) {
                    for (var j=0;j<noValid;j++) {
                        if(data[i][1] === data[j][1]) {
                            element = document.getElementById("queueVotingIDCellNo"+j);
                            if (element !== null) {
                                element.innerHTML = string;
                            }
                        }
                    }
                }
                for (var i=0;i<noValid;i++) {
                    if (!usernameLookup.hasOwnProperty(data[i][1].toString())) {
                        const k=i;
                        usernameLookup[data[i][1].toString()] = 1;
                        getJson("/db/users?id="+data[i][1],function(usrdata){
                            var setStr = "UNKNOWN";
                            if (typeof usrdata !== "string") {setStr = usrdata.name;}
                            replaceHTML(data,k,setStr);
                        },function(usrdata){
                            replaceHTML(data,k,"UNKNOWN");
                        })
                    }
                }
            }
        } //end of function
        var ids = [];
        for (var n=0; n<data.length; n++) {
            ids.push(data[n][0]);
        }
        getJson("/db/music?id="+ids.join("%20"),queueBuild,function(songsIdData){document.getElementById("currentSongReading").innerHTML = "Unable to load queue data!"});
    }//end of else
}

/**
 * Used to construct and populate a table of queued songs
 */
function queue() {
    document.getElementById("listDiv").innerHTML = "Current song: <em id='currentSongReading'></em><br><table style='width:100%' id='queueVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Requesting user</th><th>Votes</th><th>Vote</th><th>Favourite</th></tr></table>"
    getJson("/vote?=currentSong",function(data){
        if (typeof data == "string") {document.getElementById("currentSongReading").innerHTML="Error finding current song!";}
        else {
            console.log(data);
            getJson("/db/music?id="+data[0],function(songdata){
                if (typeof songdata == "string") {
                    document.getElementById("currentSongReading").innerHTML="Song with id "+data[0];
                } else {
                    console.log(songdata);
                    document.getElementById("currentSongReading").innerHTML="\""+songdata.name+"\" by "+songdata.artist;
                }
            },function(songdata){
                document.getElementById("currentSongReading").innerHTML="Song with id "+data[0];
            });
        }
    },function(data){
        document.getElementById("currentSongReading").innerHTML="Error finding current song!";
    });
    getJson("/vote",_queue,function(data){document.getElementById("listDiv").innerHTML = "Unable to load queue data!";});
}

/**
 * Used to construct and populate a table of songs from the user's "favourites" cookie
 */
function favourites() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='favouritesVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Vote</th><th>Unfavourite</th></tr></table>";
    var favouritesVotingTable = document.getElementById("favouritesVotingTable");
    var currCookieData = getCookie("Favourites");
    if (!(currCookieData === "")) {
        favArray = currCookieData.split(',');
        var i = 0;
        function failure() {
            i += 1;
            if (i < favArray.length) {
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
                var favCell = newRow.insertCell(4);
                nameCell.innerHTML = data.name;
                artistCell.innerHTML = data.artist;
                durationCell.innerHTML = songLengthFormat(data.duration);
                var votingForm = createVoteForm(data.rowid);
                voteCell.appendChild(votingForm);
                favCell.id="tableFavCell"+data.rowid;
                favCell.innerHTML="<button id='unfavourite' onclick='_updateFavouriteCookie("+data.rowid+",true)'>Unfavourite</button>"
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
