"use strict"

var TOOLS = (function(){

function _getQueryItem(key){
    if (location.search === "") {
        return false;
    } else {
        var urlParams = new URLSearchParams(location.search);
        var result = urlParams.get(key);
        if (result === null) {
            return false;
        } else {
            return result;
        }
    }
}

function _getQueryString(queryDict) {
    var pathname = document.location.pathname;
    var queryString = "?";
    for (var key in queryDict) {
        if (queryDict.hasOwnProperty(key)) {
            queryString += key + "=" + queryDict[key] + "&"; //Add queries one by one
        }
    }
    if (queryString.length === 1) {
        console.log("_getQueryString called with an empty query dictionary")
        return false;
    } else {
        return pathname + queryString.substring(0,queryString.length-1); //Stripping trailing &
    }
}

function _getCookie(key) {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
        var keyPlus = key + "="; //for convenience
        var currCookie = cookieArray[i];
        while (currCookie.charAt(0) == ' ') {
            currCookie = currCookie.substring(1); //Whitespace removal
        }
        if (currCookie.indexOf(keyPlus) == 0) { //This is the right cookie
            return currCookie.substring(keyPlus.length,currCookie.length);
        }
    }
    return null;
}

//START OF THE RETURN STATEMENT
return {

/**
 * Used for converting a number of seconds into a string formatted "[minutes]:[seconds]" for nice display
 *
 * @alias TOOLS~songLengthFormat
 * @param {number} seconds - the number of seconds to convert
 * @returns {string} displayString - the formatted string
 */
songLengthFormat:function(seconds) {
    var modSixty = seconds % 60;
    var mins = (seconds - modSixty)/60;
    if (Math.round(modSixty) < 10) {
        return mins + ":0" + Math.round(modSixty);
    } else {
        return mins + ":" + Math.round(modSixty);
    }
},

/**
 * Used to make a GET request to the server and callback on success or failure
 *
 * @alias TOOLS~jsonGetRequest
 * @param {string} filename - the file to GET
 * @param {function} successCallback - a callback taking (Object responseObject, string statusCode) to call upon success
 * @param {function} failureCallback - a callback to call upon failure
 */
jsonGetRequest:function(filename,successCallback,failureCallback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.overrideMimeType("application/json");
    httpRequest.open("GET",filename,true);
    httpRequest.onload = function(){successCallback(JSON.parse(httpRequest.response),httpRequest.status.toString());};
    httpRequest.onerror = failureCallback;
    httpRequest.ontimeout = failureCallback;
    httpRequest.send();
},


/**
 * Used to add a button into a particular HTML element, expanding to fill if needed
 *
 * @alias TOOLS~appendButton
 * @param {Object} elem - the element to add a button into
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 * @param {boolean} expand - whether the button should be animated to expand out
 * @param {string} classstr - the class to assign to the button, or "" if none
 *
 * @returns {Object} button - the DOM object of the button
 */
appendButton:function(elem, buttonText, callback, expand, classstr) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    button.addEventListener("click",callback);
    if (classstr != "") {button.className = classstr;}
    elem.appendChild(button);
    return button;
},

/**
 * Used to add a button after a particular HTML element, expanding to fill if needed
 *
 * @alias TOOLS~insertButton
 * @param {Object} elem - the element to add a button after
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 * @param {boolean} expand - whether the button should be animated to expand out
 * @param {string} classstr - the class to assign to the button, or "" if none
 *
 * @returns {Object} button - the DOM object of the button
 */
insertButton:function(elem, buttonText, callback, expand, classstr) {
    //NOTE: Expanding is currently nonfunctional
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    button.addEventListener("click",callback);
    if (classstr != "") {button.className = classstr;}
    elem.parentNode.insertBefore(button,elem.nextSibling);
    return button;
},

/**
 * Used to get the current screen size identifier - small, medium or big
 *
 * @alias TOOLS~getScreenSize
 * @returns {string} screenSize
 */
getScreenSize:function() {
    var screenSize = window.innerWidth || document.documentElemen.clientWidth || document.body.clientWidth || 1100;
    var screenRatio = window.devicePixelRatio || 1;
    screenSize = screenSize / screenRatio;
    if (screenSize < 700) {
        screenSize = "small";
    } else if (screenSize < 1400) {
        screenSize = "medium";
    } else {
        screenSize = "big";
    }
    return screenSize;
},


/**
 * Called to update screen regions when the screen is resized
 *
 * @alias TOOLS~onResize
 */
onResize:function(){
    var screenSize = TOOLS.getScreenSize();
    if (screenSize !== MISC_INFO.screen_size) {
        MISC_INFO.screen_size = screenSize;
        HEADER_CONTENT.clear();
        HEADER_CONTENT.populate();
        TABS_CONTENT.clear();
        TABS_CONTENT.populate();
        BODY_CONTENT.clear();
        BODY_CONTENT.populate();
    }
},

/**
 * Called to update the SETTINGS object, replacing default attributes with ones from the account if applicable and convert to a key-value pairs format.
 * As this requires a GET request, this function is passed a callback which is then called once it has completed.
 *
 * @alias TOOLS-populateSettings
 * @param {function} callback - the function to call upon completion
 */
populateSettings:function(callback){
    function callbackGenerator(object) {
        return function() {
            SETTINGS.showColumnArray = object['default-show-column-settings'].split(',');
            SETTINGS.showColumnArray = {
                "Requesting User":SETTINGS.showColumnArray[0]||1,
                "Votes":SETTINGS.showColumnArray[1]||1,
                "Favourite":SETTINGS.showColumnArray[2]||1,
                "Rating":SETTINGS.showColumnArray[3]||0
            };
            SETTINGS.tabsOpenSettings = object['default-tab-activation'].split(',');
            SETTINGS.tabsOpenSettings = {
                "Recently Requested":SETTINGS.tabsOpenSettings[0]||1,
                "Favourites":SETTINGS.tabsOpenSettings[1]||1,
                "Playlists":SETTINGS.tabsOpenSettings[2]||1,
                "About":SETTINGS.tabsOpenSettings[3]||1
            };
            SETTINGS.autoFaveSettings = object['default-vote-favourite-settings'].split(',');
            SETTINGS.autoFaveSettings = {
                "Automatically Favourite Upvoted Songs":SETTINGS.autoFaveSettings[0]||0,
                "Automatically Unfavourite Downvoted Songs":SETTINGS.autoFaveSettings[1]||0
            };
            callback();
        };
    }

    TOOLS.AUTH.passAccountSettings(callbackGenerator,CONFIG);
},

/**
 * Called to populate the PLAYLISTS object from user data
 *
 * @alias TOOLS~populatePlaylists
 */
populatePlaylists:function(){
},

//START OF AUTH FUNCTIONS

AUTH:{
/**
 * Used to check that the cookie for user authentication is valid
 *
 * @alias TOOLS~AUTH~validateAuth
 */
validateAuth:function(){
},

/**
 * Used to load the account settings information with a GET request and run them through a generated callback on success or failure
 *
 * @alias TOOLS~AUTH~passAccountSettings
 * @param {function} callbackGenerator - a function that takes a single object, either the returned settings, defaultObj or undefined, and generates an argumentless callback that deals with it
 * @param {Object} defaultObj - the object to pass to callbackGenerator if the GET request fails
 */
passAccountSettings(callbackGenerator,defaultObj) {

    function success(object,status) {
        if (status == "200") {
            callbackGenerator(object)();
        } else {
            callbackGenerator(defaultObj)();
        }
    }

    TOOLS.jsonGetRequest("/db/users?authkey="+TOOLS.AUTH.getAuthKey(),success,callbackGenerator(defaultObj));
},

/**
 * Used to access the auth key stored in cookies
 *
 * @alias TOOLS~AUTH~getAuthKey
 * @returns {string} authKey - the user's auth key
 */
getAuthKey:function(){
    return _getCookie("id");
},

/**
 * Used to access the user id stored in cookies
 *
 * @alias TOOLS~AUTH~getUid
 * @returns {string} Uid - the user's id
 */
getUid:function(){
    return _getCookie("id");
}

},

//START OF PLAYLIST FUNCTIONS

PLAYLISTS:{

/**
 * Used to add a particular song to a particular playlist
 *
 * @alias TOOLS~PLAYLISTS~pushSongToPlaylist
 * @param {number} songId - the id number of the song to add
 * @param {string} playlistName - the name of the playlist to push to
 */
pushSongToPlaylist:function(songId,playlistName){
    PLAYLISTS.playlistData[playlistName].push(songId);
    //TODO server request
},

/**
 * Used to add multiple songs to a particular playlist
 *
 * @alias TOOLS~PLAYLISTS~pushSongsToPlaylist
 * @param {array} songIds - array of song id numbers for the songs to add
 * @param {string} playlistName - the name of the playlist to push to
 */
pushSongsToPlaylist:function(songIds,playlistName){
    for (var i = 0; i < songIds.length; i++) {
        PLAYLISTS.playlistData[playlistName].push(songIds[i]);
    }
    //TODO server request
},

/**
 * Used to remove a particular song from a particular playlist
 *
 * @alias TOOLS~PLAYLISTS~removeSongFromPlaylist
 * @param {number} songId - the id number of the song to remove
 * @param {string} playlistName - the name of the playlist remove from
 */
removeSongFromPlaylist:function(songId,playlistName){
    var index = PLAYLISTS.playlistData[playlistName].indexOf(songId);
    PLAYLISTS.playlistData[playlistName].splice(index,1);
    //TODO server request
},

/**
 * Used to remove multiple songs from a particular playlist
 *
 * @alias TOOLS~PLAYLISTS~removeSongsFromPlaylist
 * @param {array} songIds - array of song id numbers for the songs to remove
 * @param {string} playlistName - the name of the playlist toremove from
 */
removeSongsFromPlaylist:function(songIds,playlistName){
    for (var i = 0; i < songIds.length; i++) {
        var index = PLAYLISTS.playlistData[playlistName].indexOf(songIds[i]);
        PLAYLISTS.playlistData[playlistName].splice(index,1);
    }
    //TODO server request
},



/**
 * Used to give the name of the currently opened playlist, if valid
 *
 * @alias TOOLS~PLAYLISTS~getCurrentPlaylistName
 * @returns {string} name - the name of the currently opened playlist
 */
getCurrentPlaylistName:function(){
    return _getQueryItem("playlist");
},

/**
 * Used to duplicate a particular playlist
 *
 * @alias TOOLS~PLAYLISTS~duplicatePlaylist
 * @param {string} playlistName - the name of the playlist to remove from
 */
clonePlaylist:function(playlistName) {
    var newName = playlistName;
    var endExtractor = /\(\d*\)/g
    var endValue = newName.match(endExtractor);
    console.log(endValue);
    if (endValue === null) {
        newName = newName + " (2)";
    } else {
        var lastMatch = endValue[endValue.length - 1];
        lastMatch = lastMatch.substring(1,lastMatch.length - 1);
        endValue[endValue.length - 1] = "(" + (parseInt(lastMatch) + 1).toString() + ")";
        var i = -1;
        var strFunc = function(){
            i += 1;
            return endValue[i];
        };
        newName = newName.replace(endExtractor,strFunc);
    }
    TOOLS.PLAYLISTS.createPlaylist(newName,"placeholder");
    TOOLS.PLAYLISTS.pushSongsToPlaylist(PLAYLISTS.playlistData[playlistName],newName);
},

/**
 * Used to create a fresh playlist
 *
 * @alias TOOLS~PLAYLISTS~createPlaylist
 * @param {string} playlistName - the name of the playlist to create
 * @param {string} privacyStatus - what privacy status the playlist should have
 */
createPlaylist:function(playlistName,privacyStatus) {
    PLAYLISTS.playlistNames.push(playlistName);
    PLAYLISTS.playlistData[playlistName] = [];
}

},

//START OF QUERIES FUNCTIONS

QUERIES:{
/**
 * Used to give the name of the currently opened tab, if valid
 *
 * @alias TOOLS~QUERIES~getCurrentTabName
 * @returns {string} name - the name of the currently opened tab
 */
getCurrentTabName:function(){
    return _getQueryItem("tab");
},

/**
 * Used to give the name of the currently opened subtab, if valid
 *
 * @alias TOOLS~QUERIES~getCurrentSubtabName
 * @returns {string} name - the name of the currently opened subtab
 */
getCurrentSubtabName:function(){
    return _getQueryItem("subtab");
},

getPageQuery:function(){
    return _getQueryItem("page");
},

getDownloadedSearchQuery:function(){
    var name = _getQueryItem("Name");
    var artist = _getQueryItem("Artist");
    if (name === false && artist === false) {return null;}
    var returnDict = {};
    if (name !== false) {returnDict["name"] = name;}
    if (artist !== false) {returnDict["artist"] = artist;}
    return returnDict;
},

/**
 * Used to change between tabs / subtabs
 *
 * @alias TOOLS~QUERIES~virtualRedirect
 * @param {string|boolean} key - the name of the tab to redirect to, or the boolean "false" if no subtab wanted.
 * @param {string|boolean} subkey - the name of the subtab to redirect to, or the boolean "false" if no subtab wanted
 * @param {Object|undefined} additionalPairs - (optional): an object containing additional key-value pairs
 */
virtualRedirect:function(key,subkey,additionalPairs){
    function callback() {
        var dict = {}
        if (additionalPairs !== undefined) {
            dict = additionalPairs;
        }
        dict["tab"] = key;
        dict["subtab"] = subkey;
        var url = _getQueryString(dict);
        window.history.pushState({},null,url);
        BODY_CONTENT.clear();
        BODY_CONTENT.populate();
    }

    LOADER.loadTabScript(key,callback);
}

}

};
})();

LOADER.loading_callback();
