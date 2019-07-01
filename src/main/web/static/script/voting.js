var bodyDiv = document.getElementById("bodyDiv");
insert_before(bodyDiv,"../script/post.js");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>Redirecting to relevant tab...</div>";

//var allSongsJSONData = "no result";
//success func should check if string
//getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;queue();},function(){document.location.href = document.location.href;});

/**
 * Used to run a particular function based on a valid 'votetab' query in the query string
 */
function includeQueryStringVoteFunc() {
    var urlParams = new URLSearchParams(location.search);
    if(urlParams.has("votetab")) { //check if tab query exists
        var tabName = urlParams.get("votetab");
        var callback = listTabCallback(tabName);
        if (typeof callback == "string") {
            updateQuery({votetab:"Queue",v:Math.random()});
        } else {callback();}
    } else {updateQuery({votetab:"Queue",v:Math.random()});}
}

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
        } else if (removeBool && !notPresent) {
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
    var elements = event.target.elements;
    var isDownvote = (elements.namedItem("voteValueFormElement").value < 0);
    var voteFavCookie = getCookie("vote_favourite_settings");
    if (voteFavCookie == "") {
        var configJSON = getConfigJson();
        if (configJSON.hasOwnProperty("default_vote_favourite_settings")) {
            voteFavCookie = configJSON["default_vote_favourite_settings"];
        } else {
            voteFavCookie = "1,1";
        }
        setCookie("vote_favourite_settings",voteFavCookie,getCookieDuration());
    }
    var voteFavArray = voteFavCookie.split(',');
    if(((!isDownvote) && voteFavArray[0]==1)||(isDownvote && voteFavArray[1]==1)) {
        _updateFavouriteCookie(elements.namedItem("songNameFormElement").value,isDownvote);
    }
    function success(request) {
        if (request.status == 404) {
            console.log("404: POST response not found");
        }
        if (request.status == 201||request.status == 200) {
            updateQueryWithoutReload({v:Math.random(),votetab:"Queue"});
        }
    }
    function failure(request) {
        console.log("Error sending POST request");
    }
    postRequest(new FormData(event.target),"/vote",success,failure);
}

function _supplyFromDict(element,dict) {
    for (var key in dict) {if (dict.hasOwnProperty(key)) {element[key]=dict[key];}}
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
    _supplyFromDict(form,{method:'post',action:'/register'});
    const songName = document.createElement('input');
    _supplyFromDict(songName,{type:'hidden',name:'s_id',value:id,id:'songNameFormElement'});
    form.appendChild(songName);
    const uidValue = document.createElement('input');
    _supplyFromDict(uidValue,{type:'hidden',name:'u_id',value:getCookie("id")});
    form.appendChild(uidValue);
    const voteValue = document.createElement('input');
    _supplyFromDict(voteValue,{type:'hidden',name:'vote',value:'1',id:'voteValueFormElement'});
    form.appendChild(voteValue);
    const upvoteButton = document.createElement('button');
    _supplyFromDict(upvoteButton,{type:'submit',name:'vote',innerHTML:'Upvote',id:'upvote',title:'Upvote song'});
    form.appendChild(upvoteButton);
    const downvoteButton = document.createElement('button');
    _supplyFromDict(downvoteButton,{type:'submit',name:'vote',innerHTML:'Downvote',id:'downvote',title:'Downvote song',onclick:function(){voteValue.value=-1;}});
    form.appendChild(downvoteButton);
    form.addEventListener("submit",_submitVote);
    return form;
}


/**
 * CURRENTLY WIP, WILL BE IMPLEMENTED IN FUTURE COMMIT
 * Used to generate 
 *
 */
function createRatingButtons(id) {
    
}

/**
 * Used for converting a number of seconds into a string formatted "[minutes]:[seconds]" for nice display
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
 * Used to check if a string is alphabetically before a second string for the purpose of alphabetical string sorting
 *
 * @param string str1 - the first string of an ordered pair of strings
 * @param string str2 - the second string of an ordered pair of strings
 *
 * @returns number result - returns 0 if str1 is identical to str2, -1 if the str1 comes alphabetically before str2 and 1 if str1 comes alphabetically after str2
 */
function _stringCompare(str1,str2) {
    if (str1 === str2) {return 0;}
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
 * Used to sort a pair of songs alphabetically, by artist name first and then song name
 *
 * @param Object a - the first song object
 * @param Object b - the second song object
 *
 * @returns number result - returns 0 if the songs are identical, -1 if a should be sorted before b, and 1 if b should be sorted before a
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
 *
 * @param {Object|string} data - the JSON data returned by the GET request requesting songs, or a string representation of the status code if the GET request was unsuccessful
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
 *
 * @param {Object|string} data - the JSON data returned by the GET request requesting songs, or a string representation of the status code if the GET request was unsuccessful
 */
function _refreshNoSearch(data) {
    var downloadedVotingTable = document.getElementById("downloadedVotingTable");
    if (typeof data == "string") {
        var currentResultsNo = document.getElementById("currentResultsNo");
        currentResultsNo.innerHTML = "Unable to load songs list! Status code: "+data;
    } else {
        constructTable(data,downloadedVotingTable,["Name","Artist","Duration","Vote","Favourite","Rating"]);
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
    //check whether search strings are needed
    var nameSearchData = document.getElementById("nameSearchInput").value;
    var artistSearchData = document.getElementById("artistSearchInput").value;
    function failure(data) {document.getElementById("currentResultsNo").innerHTML = "Unable to load songs list!"}
    if (nameSearchData === "") {
        if (artistSearchData === "") {
            //Get data using /db/music?page={}
            getJson("/db/music?page=1",_refreshNoSearch,failure);
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
    updateQueryWithoutReload({votetab:"Downloaded",v:Math.random()});
    document.getElementById("listDiv").innerHTML = "<em id='currentResultsNo'></em><table style='width:100%' id='downloadedVotingTable'><tr><td><input type='text' id='nameSearchInput' onchange='_refreshDownloaded()'></td><td><input type='text' id='artistSearchInput' onchange='_refreshDownloaded()'></td><td></td><td></td><td></td></tr></table>";
    _refreshDownloaded();
}

/**
 * Callback used to populate the table of queued songs with the server's song queue
 *
 * @param {Object} data - the JSON data returned from the GET request requesting song queue, or a string representation of the status code if the GET request was unsuccessful
 */
function _queue(data) {
    if (typeof data == "string") {
        console.log("Unable to load user data for uniqueness check: status "+data);
    } else {
        var usernameLookup = {};
        data.sort(function(a,b){return b.vote-a.vote;})
        var last_index = data.findIndex(function(song){return song.vote <= 0;});
        last_index = (last_index > 0) ? last_index + 1 : data.length;
        data = data.slice(0,last_index);
        function queueBuild(songsIdData) {
            if (typeof songsIdData == "string") {console.log("Unable to do the multi-id call");}
            else {
                var queueVotingTable = document.getElementById("queueVotingTable");
                //sort songsIdData
                sortedSongData = [];
                for (var i=0; i<data.length; i++) {
                    var sid = data[i].s_id;
                    for (var j=0; j<songsIdData.length; j++) {
                        if (songsIdData[j].rowid == sid) {
                            sortedSongData.push(songsIdData.splice(j,1)[0]);
                            j = songsIdData.length;
                        }
                    }
                }
                //done sorting
                for (var i=0; i<sortedSongData.length; i++) {
                    sortedSongData[i].requesting_user = 1;
                    sortedSongData[i].votes_for = data[i].vote;
                } //end of for loop
                constructTable(sortedSongData,queueVotingTable,["Name","Artist","Duration","Requesting user","Votes","Vote","Favourite","Rating"]);
                function replaceHTML(data,i,string) {
                    for (var j=0;j<data.length;j++) {
                        if(data[i].u_id === data[j].u_id) {
                            element = document.getElementById("queueVotingIDCellNo"+j);
                            if (element !== null) {
                                element.innerHTML = string;
                            }
                        }
                    }
                }
                for (var i=0;i<data.length;i++) {
                    if (!usernameLookup.hasOwnProperty(data[i].u_id.toString())) {
                        const k=i;
                        usernameLookup[data[i].u_id.toString()] = 1;
                        getJson("/db/users?id="+data[i].u_id,function(usrdata){
                            var setStr = "UNKNOWN";
                            if (typeof usrdata !== "string") {setStr = usrdata[0].name;}
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
            ids.push(data[n].s_id);
        }
        getJson("/db/music?id="+ids.join("%20"),queueBuild,function(songsIdData){document.getElementById("currentSongReading").innerHTML = "Unable to load queue data!"});
    }//end of else
}

/**
 * Function used to continuously ensure that the user is shown the name of the song that is currently playing by updating the <em> element of id currentSongReading
 */
function _updateCurrentSongReading() {
    getJson("/vote?=currentSong",function(data){
        if (typeof data == "string") {document.getElementById("currentSongReading").innerHTML="Error finding current song!";}
        else {
            getJson("/db/music?id="+data[0].s_id,function(songdata){
                if (typeof songdata == "string") {
                    document.getElementById("currentSongReading").innerHTML="Song with id "+data[0].s_id;
                } else {
                    document.getElementById("currentSongReading").innerHTML="\""+songdata[0].name+"\" by "+songdata[0].artist;
                    setTimeout(_updateCurrentSongReading,1000*songdata[0].duration); //Can I work out a better way of doing this?
                }
            },function(songdata){
                document.getElementById("currentSongReading").innerHTML="Song with id "+data[0].s_id;
            });
        }
    },function(data){
        document.getElementById("currentSongReading").innerHTML="Error finding current song!";
    });
}

/**
 * Used to construct and populate a table of queued songs
 */
function queue() {
    updateQueryWithoutReload({votetab:"Queue",v:Math.random()});
    document.getElementById("listDiv").innerHTML = "Current song: <em id='currentSongReading'></em><br><table style='width:100%' id='queueVotingTable'></table>"
    _updateCurrentSongReading();
    getJson("/vote",_queue,function(data){document.getElementById("listDiv").innerHTML = "Unable to load queue data!";});
}

/**
 * Callback used for populating a table with favourites data after a GET request for all songs matching the favourites rowids
 *
 * @param {Object|string} data - the JSON data returned by the GET request requesting songs, or a string representation of the status code if the GET request was unsuccessful
 */
function _favourites(data) {
    if (typeof data == "string") {document.getElementById("listDiv").innerHTML = "Unable to load favourites data!";}
    else {
        constructTable(data,document.getElementById("favouritesVotingTable"),["Name","Artist","Duration","Vote","Favourite","Rating"]);
    }
}

/**
 * Used to construct and populate a table of songs from the user's "favourites" cookie
 */
function favourites() {
    updateQueryWithoutReload({votetab:"Favourites",v:Math.random()});
    document.getElementById("listDiv").innerHTML = "<button id='autoQueueButton'>Autoqueue Favourites</button><table style='width:100%' id='favouritesVotingTable'></table>";
    var favouritesVotingTable = document.getElementById("favouritesVotingTable");
    var currCookieData = getCookie("Favourites");
    if (!(currCookieData === "")) {
        favArray = currCookieData.split(',');
        document.getElementById("autoQueueButton").outerHTML="<button id='autoQueueButton' onclick='document.location.href=\"/autoqueue?songs="+favArray.join('%20')+'"\'>Autoqueue Favourites</button>'
        getJson("/db/music?id="+favArray.join("%20"),_favourites,function(data){document.getElementById("listDiv").innerHTML = "Unable to load favourites table!";})
    } else {
        aqbElem = document.getElementById("autoQueueButton");
        aqbElem.parentNode.removeChild(aqbElem);
    }
}

/**
 * Lookup table used to populate a table cell with the relevant contents
 *
 * @param string column - the name identifier (e.g "Artist") of the column that the cell is found in
 * @param Object cell - the cell element to be modified
 * @param Object song - the song object relevant to the row that the cell is found in
 * @param Object favArray - an array containing string representation of the rowid of each song that the user has favourited
 * @param Object showColumnArray - an array for whether the columns "Favourite" and "Rating" should be shown to the user
 * @param number index - the index of the row that the cell is found in
 */
function cellInfo(column,cell,song,favArray,showColumnArray,index) {
    if (showColumnArray[0] != "1" && column == "Favourite") {column = "";}
    if (showColumnArray[1] != "1" && column == "Rating") {column = "";}
    switch(column) {
        case "Name":
            cell.innerHTML = song.name;
            break;
        case "Artist":
            cell.innerHTML = song.artist;
            break;
        case "Duration":
            cell.innerHTML = songLengthFormat(song.duration);
            break;
        case "Vote":
            cell.appendChild(createVoteForm(song.rowid));
            break;
        case "Favourite":
            cell.id="tableFavCell"+song.rowid;
            if (favArray.includes(song.rowid.toString())) {
               cell.innerHTML="<button id='unfavourite' title='Remove from favourites' onclick='_updateFavouriteCookie("+song.rowid+",true)'>Unfavourite</button>"
            } else {
                cell.innerHTML="<button id='favourite' title='Add to favourites' onclick='_updateFavouriteCookie("+song.rowid+",false)'>Favourite</button>";
            }
            break;
        case "Requesting user":
            cell.innerHTML = song.requesting_user;
            cell.id = "queueVotingIDCellNo"+index;
            break;
        case "Votes":
            cell.innerHTML = song.votes_for;
            break;
        case "Rating":
            cell.innerHTML = "<button id='1star"+song.rowid+"' title='1 star' class='starempty'>1 star</button><button id='2star"+song.rowid+"' title='2 stars' class='starempty'>2 stars</button><button id='3star"+song.rowid+"'>";
        default:
            break;
    }
}

/**
 * Generalised function used to populate a song table from some data along with which columns should be shown.
 *
 * @param Object tableData - an array containing all the song objects for songs to be present in the table
 * @param Object tableElement - the <table> element to be populated
 * @param Object columnList - an array of strings defining the columns to be found in the table (e.g "Favourite")
 */
function constructTable(tableData,tableElement,columnList) {
    var showColumnCookie = getCookie("show_column_settings");
    if (showColumnCookie == "") {
        var configJSON = getConfigJson();
        if (configJSON.hasOwnProperty("default_show_column_settings")) {
            showColumnCookie = configJSON["default_show_column_settings"];
        } else {
            showColumnCookie = "1,0";
        }
        setCookie("show_column_settings",showColumnCookie,getCookieDuration());
    }
    var showColumnArray = showColumnCookie.split(',');
    var topRow = tableElement.insertRow(0);
    for (var i=0; i<columnList.length; i++) {
        if (!(showColumnArray[0] == "0" && columnList[i] == "Favourite") && !(showColumnArray[1] == "0" && columnList[i] == "Rating")) {
            var newCell = document.createElement('th');
            newCell.innerHTML = columnList[i];
            topRow.appendChild(newCell);
        }
    }
    favArray = getCookie("Favourites").split(',');
    for (var i=0; i<tableData.length; i++) {
        var currSong = tableData[i];
        var newRow = tableElement.insertRow(-1);
        for (var j=0; j<columnList.length; j++) {
            var newCell = newRow.insertCell(j);
            cellInfo(columnList[j],newCell,currSong,favArray,showColumnArray,i);
        }
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

tab_callback();
