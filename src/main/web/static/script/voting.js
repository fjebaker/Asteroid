"use strict"

var BODY_CONTENT = (function(){

LOADER.loaded_scripts["script/voting.js"] = "BODY_CONTENT";

var bodyDiv = document.getElementById("bodyDiv");

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

function _upvoteSong(id,bypass) {
    return function() {
        const uid = TOOLS.COOKIES.getCookie("id");
        var requestData = new FormData();
        requestData.set("s_id",id);
        requestData.set("u_id",uid);
        //TODO: get vote no from settings
        requestData.set("vote",1);
        //Favourite if want to
        var autoFavourite = TOOLS.COOKIES.getDecodedCookie("vote_favourite_settings")[0];
        if (autoFavourite == 1) {
            _updateFavouriteCookie(id,false)();
        }

        function success(request) {
            if (request.status == 404) {
                console.log("404: POST response not found")
            } else if (request.status == 201||request.status == 200) {
                //Redirect if set
                var redirects = true;
                if (bypass) {
                    redirects = false;
                } else if (!CONFIG.hasOwnProperty("on-vote-redirect-path")) {
                    redirects = false;
                } else if (CONFIG.hasOwnProperty("redirect-on-vote") && CONFIG["redirect-on-vote"] == "0"){
                    redirects = false;
                }
                if (redirects) {
                    document.location.href = configJSON["on-vote-redirect-path"];
                }
            } else {
                console.log("Unexpected response code "+request.status);
            }
        }

        function failure(request) {
            console.log("Failed to make the post request: response code "+request.status);
        }

        TOOLS.postRequest(requestData,"/vote",success,failure);
    }
}

function _downvoteSong(id) {
    return function() {
        const uid = TOOLS.COOKIES.getCookie("id");
        var requestData = new FormData();
        requestData.set("s_id",id);
        requestData.set("u_id",uid);
        //TODO: get vote no from settings
        requestData.set("vote",-1);
        //Favourite if want to
        var autoUnfavourite = TOOLS.COOKIES.getDecodedCookie("vote_favourite_settings")[1];
        if (autoUnfavourite == 1) {
            _updateFavouriteCookie(id,true)();
        }

        function success(request) {
            if (request.status == 404) {
                console.log("404: POST response not found")
            } else if (request.status == 201||request.status == 200) {
                //Redirect if set
                var redirects = true;
                if (!CONFIG.hasOwnProperty("on-vote-redirect-path")) {
                    redirects = false;
                } else if (CONFIG.hasOwnProperty("redirect-on-vote") && CONFIG["redirect-on-vote"] == "0"){
                    redirects = false;
                }
                if (redirects) {
                    document.location.href = configJSON["on-vote-redirect-path"];
                }
            } else {
                console.log("Unexpected response code "+request.status);
            }
        }

        function failure(request) {
            console.log("Failed to make the post request: response code "+request.status);
        }

        TOOLS.postRequest(requestData,"/vote",success,failure);
    }
}

/**
 * Used to update the "Favourites" cookie by either adding or removing a song of specified id to the favourites
 *
 * @param {number} id - the song unique id, as specified by its original index in the getAllSongs JSON
 * @param {boolean} removeBool - specifies whether the song should be removed from favourites (removeBool == true) or added to favourites (removeBool == false)
 */
function _updateFavouriteCookie(id,removeBool) {
    return function() {
        var favArray = TOOLS.COOKIES.getDecodedCookie("favourites");
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
            favArray.push(id);
            TOOLS.COOKIES.setCookie("favourites",TOOLS.COOKIES.getEncodedCookieString("favourites",favArray),TOOLS.COOKIES.getCookieDuration());
            var updateableElem = document.getElementById("tableFavCell"+id);
            if (updateableElem !== null) {
                _makeButtonUnfavourite(updateableElem.firstChild,id);
            }
        } else if (removeBool && !notPresent) {
            favArray.splice(presentId,1);
            TOOLS.COOKIES.setCookie("favourites",TOOLS.COOKIES.getEncodedCookieString("favourites",favArray),TOOLS.COOKIES.getCookieDuration());
            var updateableElem = document.getElementById("tableFavCell"+id);
            if (updateableElem !== null) {
                _makeButtonFavourite(updateableElem.firstChild,id);
            }
        }
    };
}

function _makeButtonUnfavourite(button,song_id) {
    button.innerHTML = "Unfavourite";
    button.className = "unfavourite_button";
    button.id = 'unfavourite' //TODO get rid of this
    button.title = "Remove from favourites";
    button.onclick=_updateFavouriteCookie(song_id,true);
}

function _makeButtonFavourite(button,song_id) {
    button.innerHTML = "Favourite";
    button.className = "favourite_button";
    button.id = 'favourite' //TODO get rid of this
    button.title = "Add to favourites";
    button.onclick=_updateFavouriteCookie(song_id,false);
}

function _makeButtonUpvote(button,song_id) {
    button.innerHTML = "Upvote";
    button.className = "upvote_button";
    button.id = 'upvote'; //TODO get rid of this
    button.title = "Upvote song";
    button.onclick=_upvoteSong(song_id,false);
}

function _makeButtonDownvote(button,song_id) {
    button.innerHTML = "Downvote";
    button.className = "downvote_button";
    button.id = 'downvote'; //TODO get rid of this
    button.title = "Downvote song";
    button.onclick=_downvoteSong(song_id);
}

/**
 * Lookup table used to populate a table cell with the relevant contents
 *
 * @param string column - the name identifier (e.g "Artist") of the column that the cell is found in
 * @param Object cell - the cell element to be modified
 * @param Object song - the song object relevant to the row that the cell is found in
 * @param Object favArray - an array containing string representation of the id of each song that the user has favourited
 * @param Object showColumnArray - an array for whether the columns "Favourite" and "Rating" should be shown to the user
 * @param number index - the index of the row that the cell is found in
 */
function _cellInfo(column,cell,song,favArray,showColumnArray,index) {
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
            var upvoteButton = document.createElement("BUTTON");
            var downvoteButton = document.createElement("BUTTON");
            _makeButtonUpvote(upvoteButton,song.id);
            _makeButtonDownvote(downvoteButton,song.id);
            cell.appendChild(upvoteButton);
            cell.appendChild(downvoteButton);
            break;
        case "Favourite":
            cell.id="tableFavCell"+song.id;
            var innerButton = document.createElement("BUTTON");
            if (favArray.includes(song.id.toString())) {
                _makeButtonUnfavourite(innerButton,song.id);
            } else {
                _makeButtonFavourite(innerButton,song.id);
            }
            cell.appendChild(innerButton);
            break;
        case "Requesting user":
            cell.innerHTML = song.requesting_user;
            cell.id = "queueVotingIDCellNo"+index;
            break;
        case "Votes":
            cell.innerHTML = song.votes_for;
            break;
        //case "Rating":
            //cell.appendChild(createRatingButtons(song.id));
            //cell.innerHTML = "<button id='1star"+song.id+"' title='1 star' class='starempty'>1 star</button><button id='2star"+song.id+"' title='2 stars' class='starempty'>2 stars</button><button id='3star"+song.id+"'>";
        default:
            break;
    }
}

/**
 * Used to construct and populate the fabled "playlists" menu. Does not yet/will exist after version 0.1.0
 * @since 0.1.0
 */
function playlists() {
    document.getElementById("listDiv").innerHTML = "playlist data goes here";
}

function _pageNumber() {
    var pageNumber = TOOLS.QUERIES.readKeyQuery("pageNo");
    if (pageNumber === null) {pageNumber = 0;}
    else {
        pageNumber = parseInt(pageNumber)
        if (isNaN(pageNumber)) {pageNumber = 0;}
    };
    if (pageNumber < 0) {pageNumber = 0;}
    return pageNumber;
}

function _autoqueueCallback(array) {
    return function(){
        var newUrl = TOOLS.QUERIES.updateQuery({mainTab:"voting",subTab:"Autoqueue",autoQueueSongs:TOOLS.COOKIES.getEncodedCookieString("favourites",array)});
        if (newUrl !== false) {
            if (window.TAB_BAR === undefined || window.TAB_BAR.name != "Voting") {
                document.location.href = newUrl;
            } else {
                TOOLS.QUERIES.changeQueryString(newUrl);
                BODY_CONTENT.populateBody();
            }
        }
    }
}

/**
 * Locates the relevant information to construct the "queue" table, and then calls it into the passed callback
 *
 * @param {callback} callback - has args columnList,tableData,errorString
 */
function queue(callback) {
    TAB_BAR.reinsertDisposableButtons("Voting");
    var columnList = ["Name","Artist","Duration","Requesting user","Votes","Vote","Favourite","Rating"]

    function success(data) {
        if (typeof data == "string") {
            callback(columnList,[],"Error - current play queue request returned invalid data!",false,false,queue);
        } else {
            var usernameLookupTable = {};
            data.sort(function(a,b){return b.vote-a.vote;}) //sorting by vote order
            var last_index = data.findIndex(function(song){return song.vote <= 0;});
            last_index = (last_index > 0) ? last_index + 1 : data.length;
            data = data.slice(0,last_index); //can't fully remember how this works, but ensures only positively voted songs are shown
            if (data.length > 40) {data = data.slice(0,40);}

            function secondSuccess(secondData) {
                if (typeof secondData == "string") {
                    callback(columnList,[],"Error - song data request for play queue returned invalid data!",false,false,queue)
                } else {
                    var sortedSongData = [];
                    for (var i=0; i<data.length; i++) {
                        var song_id = data[i].s_id;
                        sortedSongData.push(secondData[secondData.findIndex(function(song){return song.id == song_id})]);
                    }
                    //done sorting the data
                    for (var i=0; i<sortedSongData.length; i++) {
                        sortedSongData[i].requesting_user = 1;
                        sortedSongData[i].votes_for = data[i].vote;
                    }
                    callback(columnList,sortedSongData,"The play queue is empty! Upvote more songs in one of the other voting tabs!",false,false,queue);

//NB I have completely forgotten how this chunk of code works, but it seems to work
                    function replaceHTML(data,i,string) {
                        for (var j=0;j<data.length;j++) {
                            if(data[i].u_id === data[j].u_id) {
                                var element = document.getElementById("queueVotingIDCellNo"+j);
                                if (element !== null) {
                                    element.innerHTML = string;
                                }
                            }
                        }
                    }
                    for (var i=0;i<data.length;i++) {
                        if (!usernameLookupTable.hasOwnProperty(data[i].u_id.toString())) {
                            const k=i;
                            usernameLookupTable[data[i].u_id.toString()] = 1;
                            TOOLS.getJson("/db/users?id="+data[i].u_id,function(usrdata){
                                var setStr = "UNKNOWN";
                                if (typeof usrdata !== "string") {setStr = usrdata[0].name;}
                                replaceHTML(data,k,setStr);
                            },function(usrdata){
                                replaceHTML(data,k,"UNKNOWN");
                            })
                        }
                    }

//End of code chunk

                }
            }

            function secondFailure(secondData) {
                callback(columnList,[],"Error when trying to access the song data for the play queue!",false,false,queue)
            }

            var ids = [];
            if (data.length > 0) {
                for (var n=0; n<data.length; n++) {
                    ids.push(data[n].s_id);
                }
                TOOLS.getJson("/db/music?id="+ids.join("%20"),secondSuccess,secondFailure);
            } else {
                callback(columnList,[],"The play queue is empty! Upvote more songs in one of the other voting tabs!",false,false,queue);
            }
        }
    }

    function failure(data) {
        callback(columnList,[],"Error when trying to access the current play queue!",false,false,queue);
    }

    TOOLS.getJson("/vote",success,failure);

}

/**
 * Locates the relevant information to construct the "favourites" table, and then calls it into the passed callback
 *
 * @param {callback} callback - has args columnList,tableData,errorString
 */
function favourites(callback) {
    var columnList = ["Name","Artist","Duration","Vote","Favourite","Rating"];

    var pageNumber = _pageNumber();
    var favArray = TOOLS.COOKIES.getDecodedCookie("favourites");
    favArray = favArray.slice(pageNumber*40,(pageNumber+1)*40);
    function success(data) {
        if (typeof data == "string") {
            callback(columnList,[],"Error - current favourites songs request returned invalid data!",true,false,favourites);
        } else {
            data.sort(_sorter);
            callback(columnList,data,"The favourites list is empty! Favourite more songs in one of the other voting tabs!",true,false,favourites);
            //Find out if autoqueueing is allowed
            TAB_BAR.reinsertDisposableButtons("Voting");
            if (true) {
                var favArray = TOOLS.COOKIES.getDecodedCookie("favourites");
                TAB_BAR.generateSubtabButton("Voting","Autoqueue Favourites",_autoqueueCallback(favArray));
            }
        }
    }

    function failure(data) {
        callback(columnList,[],"Error when trying to access the songs in favourites!",true,false,favourites);
    }

    TOOLS.getJson("/db/music?id="+favArray.join("%20"),success,failure);
}

function downloaded(callback) {
    TAB_BAR.reinsertDisposableButtons("Voting");

    var columnList = ["Name","Artist","Duration","Vote","Favourite","Rating"];
    //see if a search exists
    var searchQuery = "page=1"
    var searchRow = document.getElementById("downloadedSearchBarRow");
    if (searchRow !== null) {
        var queryObj = {};
        var refreshQuery = false;
        var cells = searchRow.cells;
        for (var i=0; i<columnList.length; i++) {
            var cell = cells[i];
            var value = "";
            if (cell.firstChild !== null) {
                value = cell.firstChild.value;
                if (value.includes("=") || value.includes("&")) {
                    value = "";
                }
            }
            if (value != "") {
                refreshQuery = true;
                queryObj[columnList[i].toLowerCase()] = value;
            }
        }
        if (refreshQuery) {
            searchQuery = ""
            for (var key in queryObj) {
                if (queryObj.hasOwnProperty(key)) {
                    searchQuery += "&" + key + "=" + queryObj[key];
                }
            }
            searchQuery = searchQuery.substr(1);
        }
    }

    function success(data) {
        if (typeof data == "string") {
            callback(columnList,[],"Error - downloaded songs request returned invalid data!",false,true,downloaded)
        } else {
            data.sort(_sorter);
            callback(columnList,data,"The downloaded list is empty! Request some songs with the request tab.",false,true,downloaded);
        }
    }

    function failure(data) {
        callback(columnList,[],"Error when trying to access downloaded songs!",true,downloaded);
    }
    TOOLS.getJson("/db/music?"+searchQuery,success,failure);
}

function autoqueue(callback) {
    var columnList = ["Name","Artist"];
    callback(columnList,[],"Autoqueueing songs every so often! Queued so far:");
    var songTable = document.getElementById("songTable");
    if (songTable !== null) {
        var currRow = songTable.rows[1];
        var songsQuery = TOOLS.QUERIES.readKeyQuery("autoQueueSongs");
        if (songsQuery === null || songsQuery == 0) {
            currRow.innerHTML = "Unable to find a valid autoQueueSongs query!";
        } else {
            const songArr = songsQuery.split(",");
            var i=0;
            function autoAdd() {
                const indexToAdd = songArr[Math.floor(Math.random()*songArr.length)];
                _upvoteSong(indexToAdd,true)();

                function success(data) {
                    if (typeof data == "string") {
                        failure(data);
                    } else {
                        var newRow = songTable.insertRow(-1);
                        for (var j=0; j<columnList.length; j++) {
                            var newCell = newRow.insertCell(j);
                            _cellInfo(columnList[j],newCell,data[0],[],[],i);
                        }
                        i++;
                    }
                }

                function failure(data) {
                    var newRow = songTable.insertRow(-1);
                    var newCell = newRow.insertCell(0);
                    newCell.colSpan = columnList.length;
                    newCell.innerHTML = "Attempted request of song with ID "+indexToAdd+", failed to get more information";
                    i++;
                }

                TOOLS.getJson("/db/music?id="+indexToAdd,success,failure);
                setTimeout(autoAdd,120000);
            }
            setTimeout(autoAdd,30000);
        }
    }
}

/**
 * upwards - bool, element - button row, caller - queue etc
 * only used for scrollin stuff
 */
function updateTable(upwards,element,caller) {
    return function() {
        var pageNumber = element.currentPage;
        var newUrl = false;
        if (upwards) {
            var newUrl = TOOLS.QUERIES.updateQuery({pageNo:pageNumber-1});
        } else {
            var newUrl = TOOLS.QUERIES.updateQuery({pageNo:pageNumber+1});
        }
        if (newUrl !== false) {
            TOOLS.QUERIES.changeQueryString(newUrl);
        }
        pageNumber = _pageNumber();
        function new_construction_func(columnList,tableData,errorString,pages,search,new_caller) {
            var isPages = element.className != "searchbar_row_big";
            var colSpan = element.firstChild.colSpan;
            if (!isPages) { //called from the search bar
                if (element.nextSibling !== null) {
                    if (element.nextSibling.hasAttribute("colSpan")) {
                        colSpan = element.nextSibling.colSpan;
                    } else {
                        var parRows = element.parentNode.rows;
                        colSpan = parRows[parRows.length - 1].colSpan;
                    }
                }
            } else {
                element.removeChild(element.firstChild);
            }
            var insertionIndex = element.rowIndex;
            if (upwards) {
                insertionIndex++;
                //replace top button
                if (pages) {
                    var newCell = element.insertCell(-1);
                    newCell.colSpan = colSpan;
                    if (pageNumber == 0) {
                        newCell.className = "song_table_end_multicell_big"
                        newCell.innerHTML = "Reached the first song!"
                    } else {
                        newCell.className = "song_table_load_more_cell_big";
                        var cellButton = document.createElement("BUTTON");
                        cellButton.innerHTML = "Load more...";
                        element.currentPage = pageNumber;
                        cellButton.onclick = updateTable(true,element,new_caller);
                        newCell.appendChild(cellButton);
                    }
                }
            }

            //add new songs
            var favArray = TOOLS.COOKIES.getDecodedCookie("favourites");
            var showColumnArray = TOOLS.COOKIES.getDecodedCookie("show_column_settings");
            for (var i=0; i<tableData.length; i++) {
                var currSong = tableData[i];
                var newRow = songTable.insertRow(insertionIndex);
                insertionIndex++;
                for (var j=0; j<columnList.length; j++) {
                    var newCell = newRow.insertCell(j);
                    _cellInfo(columnList[j],newCell,currSong,favArray,showColumnArray,i);
                }
            }


            if (!upwards) {
                //replace bottom button
                if(pages) {
                    var newCell = element.insertCell(-1);
                    newCell.colSpan = colSpan;
                    if (tableData.length == 0) {
                        newCell.className = "song_table_end_multicell_big"
                        newCell.innerHTML = "Reached the final song!"
                        var newUrl = TOOLS.QUERIES.updateQuery({pageNo:pageNumber-1});
                        if (newUrl !== false) {
                            TOOLS.QUERIES.changeQueryString(newUrl);
                        }
                    } else {
                        newCell.className = "song_table_load_more_cell_big";
                        var cellButton = document.createElement("BUTTON");
                        cellButton.innerHTML = "Load more...";
                        element.currentPage = pageNumber;
                        cellButton.onclick = updateTable(false,element,new_caller);
                        newCell.appendChild(cellButton);
                    }
                }
            }
        }

        caller(new_construction_func);
    };
}

/**
 * Generalised function used to populate a song table from some data along with which columns should be shown.
 *
 * @param Object tableData - an array containing all the song objects for songs to be present in the table
 * @param Object columnList - an array of strings defining the columns to be found in the table (e.g "Favourite")
 * @param {string} errorString - the error string to show on a data failure
 * @param {boolean} pages - whether to include the where-with-all to include further pages in the table
 */
function constructTable(columnList,tableData,errorString,pages,search,caller) {
    var songTable = document.getElementById("songTable");
    if (songTable === null) {
        songTable = document.createElement("TABLE");
        songTable.style.width='100%';
        songTable.id='songTable';
        songTable.className = "song_table_big";
        bodyDiv.appendChild(songTable);
    } else {
        while (songTable.firstChild) {songTable.removeChild(songTable.firstChild);}
    }
    var showColumnArray = TOOLS.COOKIES.getDecodedCookie("show_column_settings");
    //Creating the top row
    var topRow = songTable.insertRow(0);
    topRow.className = "title_row_big";
    for (var i=0; i<columnList.length; i++) {
        showColumnArray[1] = "0" //Rating temporarily non-functional
        if (!(showColumnArray[0] == "0" && columnList[i] == "Favourite") && !(showColumnArray[1] == "0" && columnList[i] == "Rating")) {
            var newCell = document.createElement('th');
            newCell.innerHTML = columnList[i];
            topRow.appendChild(newCell);
        }
    }
    //Add searchbar
    if (search) {
        var newRow = songTable.insertRow(-1);
        newRow.className = "searchbar_row_big";
        newRow.id = "downloadedSearchBarRow";
        for (var i=0; i<columnList.length; i++) {
            var newCell = newRow.insertCell(i);
            if (search_bars.includes(columnList[i])) {
                var input = document.createElement("INPUT");
                input.onchange = refillTable(true,newRow,caller);
                newCell.appendChild(input);
            }
        }
    }
    //Fill the table with the other rows
    var pageNumber = _pageNumber();
    var newUrl = TOOLS.QUERIES.updateQuery({pageNo:pageNumber});
    if (newUrl !== false) {
        TOOLS.QUERIES.changeQueryString(newUrl);
    }
    if (pages) {
        if (pageNumber > 0) {
            var newRow = songTable.insertRow(-1);
            var newCell = newRow.insertCell(-1);
            newCell.colSpan = topRow.children.length;
            newCell.className = "song_table_load_more_cell_big";
            var cellButton = document.createElement("BUTTON");
            cellButton.innerHTML = "Load more...";
            newRow.currentPage = pageNumber;
            cellButton.onclick = updateTable(true,newRow,caller);
            newCell.appendChild(cellButton);
        }
    }
    var favArray = TOOLS.COOKIES.getDecodedCookie("favourites");
    if (tableData.length == 0) {
        var newRow = songTable.insertRow(-1);
        var newCell = newRow.insertCell(-1);
        newCell.colSpan = topRow.children.length;
        newCell.innerHTML = errorString;
        newCell.className = "song_table_error_multicell_big";
    } else {
        for (var i=0; i<tableData.length; i++) {
            var currSong = tableData[i];
            var newRow = songTable.insertRow(-1);
            for (var j=0; j<columnList.length; j++) {
                var newCell = newRow.insertCell(j);
                _cellInfo(columnList[j],newCell,currSong,favArray,showColumnArray,i);
            }
        }
    }
    if (pages) {
        var newRow = songTable.insertRow(-1);
        var newCell = newRow.insertCell(-1);
        newCell.colSpan = topRow.children.length;
        newCell.className = "song_table_load_more_cell_big";
        var cellButton = document.createElement("BUTTON");
        cellButton.innerHTML = "Load more...";
        newRow.currentPage = pageNumber;
        cellButton.onclick = updateTable(false,newRow,caller);
        newCell.appendChild(cellButton);
    }

}

/**
 * Clears all the songs; not the title, search or load more stuff; then updates
 */
function refillTable(upwards,element,caller) {
    var songTable = element.parentNode;
    return function() {
        var i = 0;
        while (songTable.rows[i] !== undefined) {
            const thisRowClass = songTable.rows[i].className;
            if (thisRowClass == "title_row_big" || thisRowClass == "searchbar_row_big" || thisRowClass == "song_table_load_more_cell_big" || thisRowClass == "song_table_error_multicell_big" || i == element.rowIndex) {
                i++;
            } else {
                songTable.deleteRow(i);
            }
        }
        updateTable(upwards,element,caller)();
    }
}

var showCurrPlayingSongList = ["Queue"];

var tabs_object = {
    Queue:queue,
    Favourites:favourites,
    Downloaded:downloaded,
    Autoqueue:autoqueue
};

var search_bars = ["Artist","Name"]

return {
pageSize:"noSize",

showPlayingSong:function(){
    if (bodyDiv.innerHTML == "") {
        bodyDiv.innerHTML = "Current song: <em id='currentSongContainer' class='current_song_container_big'></em><br>";
    }
    var containerElem = document.getElementById("currentSongContainer");
    TOOLS.getJson("/vote?=currentSong",function(data){
        if (typeof data == "string") {containerElem.innerHTML="Error finding current song!";}
        else if (Array.isArray(data) && data.length == 0){ //return case for no song in history
            containerElem.innerHTML="No song playing! Try upvoting some songs in a different voting tab!";
        } else {
            TOOLS.getJson("/db/music?id="+data.s_id,function(songdata){
                if (typeof songdata == "string") {
                    containerElem.innerHTML="Error identifying song with id "+data.s_id;
                } else {
                    containerElem.innerHTML="\""+songdata[0].name+"\" by "+songdata[0].artist;
                    setTimeout(BODY_CONTENT.showPlayingSong,1000*songdata[0].duration); //Can I work out a better way of doing this?
                }
            },function(songdata){
                document.getElementById("currentSongReading").innerHTML="Error identifying song with id "+data[0].s_id;
            });
        }
    },function(data){
        document.getElementById("currentSongReading").innerHTML="Error finding current song!";
    });
},

populateBody:function(){
    bodyDiv.innerHTML = "";
    var subTabQuery = TOOLS.QUERIES.readKeyQuery("subTab");
    if (subTabQuery !== null) {
        if (showCurrPlayingSongList.includes(subTabQuery)) {BODY_CONTENT.showPlayingSong();}
        if (tabs_object.hasOwnProperty(subTabQuery)) {
            tabs_object[subTabQuery](constructTable);
        }
    }
}

};

})();

LOADER.current_callback();
