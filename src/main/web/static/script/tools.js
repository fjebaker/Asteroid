"use strict"

var TOOLS = (function() {

var loaded_size_scripts = [];

const _durationNames = {
    "minute":60000,
    "hour":3600000,
    "day":86400000,
    "week":604800000,
    "month":2656800000,
    "year":31557600000
};

function _validateCookie(cookie,failure_callback) {
    var name = cookie[0];
    var data = cookie[1];
    if (name == 'tabs') {
        var regex = /^([01],){4}[01]$/;
        return !regex.test(data);
    } else if (name == 'id') {
        var regex = /^\d+$/
        return !regex.test(data);
    } else if (name == 'vote_favourite_settings' || name == "show_column_settings") {
        var regex = /^[01],[01]$/
        return !regex.test(data);
    } else if (name == 'cookieDuration') {
        return !_durationNames.hasOwnProperty(data)
    } else if (name == 'Favourites') {
        var regex = /(^$)|(^(\d+)(,\d+)*$)/
        return !regex.test(data);
    } else {return false};
}

function _arrayCookieDecoder(defaultArray,configName) {
    return function(cookie){
        var array = defaultArray;
        var arrayLen = array.length;
        if (cookie != "") {
            var newArr = cookie.split(",");
            if (newArr.length == arrayLen) {array = newArr;}
        } else if (CONFIG.hasOwnProperty(configName)) {
            var newArr = CONFIG[configName].split(",");
            if (newArr.length == arrayLen) {array = newArr;}
        }
        return array;
    }
}

function _faveDecoder(data) {
	if (data == "") {
		return [];
	} else {
		return data.split(',');
	}
}

const _cookieDecoders = {
    tabs:_arrayCookieDecoder(["1","1","1","1","0"],"default-tab-activation"),
    "vote_favourite_settings":_arrayCookieDecoder(["1","1"],"default-vote-favourite-settings"),
    "show_column_settings":_arrayCookieDecoder(["1","0"],"default-show-column-settings"),
    "favourites":_faveDecoder
};

const _cookieEncoders = {
    "favourites":function(data){return data.join(",");}
};

//START OF RETURNED OBJECT


return {
/**
 * Used to convert string-formatted values for the "cookieDuration" cookie to number of milliseconds
 *
 * @param {string} timeString - the indicative string ('minute','hour','day','week','month' or 'year') to convert
 *
 * @alias TOOLS~convertNameToDuration
 * @returns {number} timeMilliseconds - the number of milliseconds represented by the given string. Defaults to 0 if the string is not one of the above recognised strings
 */
convertNameToDuration:function(timeString) {
    return _durationNames[timeString] || 0
},

/**
 * Used to handle GET requests for JSON data distributed by the flask server
 *
 * @alias TOOLS~getJson
 * @param {string} filename - the location to which the GET request should be sent
 * @param {successCallback} successCallback - the callback to call upon successful loading of the JSON resource
 * @param {failureCallback} failureCallback -  the callback to call upon timeout or error event of the GET request
 */
getJson:function(filename,successCallback,failureCallback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET",filename,true);
    function success() {
        if (rawFile.status == "200") {
            successCallback(JSON.parse(rawFile.response));
        } else {
            successCallback(rawFile.status.toString());
        }
    }
    function failure() {
        failureCallback();
    }
    rawFile.onload = success;
    rawFile.onerror = failure;
    rawFile.ontimeout = failure;
    rawFile.send();
},

/**
 * The callback called upon the successful loading of a JSON resource accessed via GET request
 * @callback successCallback
 * @param {Object|string} data - If the GET request loads with status code 200 (OK), the JSON resource loaded. If the GET request loads with any other HTTP status code, returns the status code as a string (e.g "404")
 */

/**
 * The callback called upon a timeout or error in accessing a JSON resource via GET request
 * @callback failureCallback
 */

/**
 * Used to handle POST requests to the flask server
 *
 * @alias TOOLS~postRequest
 * @param {FormData} data - the form data to be posted to the server
 * @param string address - the HTTP location to which the POST request should be sent
 * @param {postCallback} successCallback - the callback to call upon success of the POST request
 * @param {postCallback} failureCallback -  the callback to call upon timeout or error event of the POST request
 */
postRequest:function(data,address,successCallback,failureCallback) {
    var request = new XMLHttpRequest();
    request.open('POST',address,true);
    request.onload = function(){successCallback(request);};
    request.onerror = function(){failureCallback(request);};
    request.ontimeout = function(){failureCallback(request);};
    request.send(data);
},

/**
 * The callback called upon either the success or failure of a POST request
 * @callback postCallback
 * @param {XMLHttpRequest} request - the HTTP POST request in question
 */

/**
 * Used to populate the page with a script based on the current size of the screen.
 *
 * @alias TOOLS~fillByScreenSize
 * @param {Object} element - document element before which the script(s) should be inserted
 * @param {string} script - path to the js script, with trailing .js removed
 * @param {function} final_callback - function to call upon complete execution of insertion
 */
fillByScreenSize:function(script,final_callback){
	var screenSize = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 1100;
	var screenRatio = window.devicePixelRatio || 1;
	screenSize = screenSize / screenRatio;
	if (screenSize < 700) {
    	screenSize = "small";
	} else if (screenSize < 1400) {
    	screenSize = "medium";
	} else {
    	screenSize = "big";
	}
    function intermediate_callback() {
        if (!LOADER.loaded_scripts.hasOwnProperty(script)) {
            console.log("ERROR while attempting to load script "+script)
        } else {
		    var script_data = LOADER.loaded_scripts[script];
	        if (window[script_data].pageSize != screenSize) {
                window[script_data].pageSize = screenSize;
    	        final_callback();
            }
        }
    }
	if (LOADER.loaded_scripts.hasOwnProperty(script)) {
        intermediate_callback();
    }
    else {
   	    LOADER.insert_before(script,intermediate_callback);
	}
},

ensureValidId:function(){
    var currId = TOOLS.COOKIES.getCookie("id");
    var redirStr = "/auth"
    if (CONFIG["non-cacheing"] == 1) {redirStr += "?v=" + Math.random();}
    if (currId == "") {
        document.location.href = redirStr;
    }
    function authFailure(data) {
        document.location.href = redirStr;
    }
    TOOLS.getJson('/db/users?id='+currId,function(data){if (typeof data == "string" || !data[0].hasOwnProperty("name")){authFailure(data);}},authFailure);
},


//START OF COOKIE FUNCTIONS


COOKIES:{
/**
 * Used to get the string data stored in a specifically named cookie
 *
 * @alias TOOLS~COOKIES~getCookie
 * @param {string} name - the name used as a key to identify the cookie requested
 *
 * @returns {string} cookieData - the data string stored under the cookie of name 'name'
 */
getCookie:function(name) {
    var decodedCookie = decodeURIComponent(document.cookie); //get all cookie info
    var cookieArray = decodedCookie.split(';'); //an array containing each cookie as an element
    for(var i=0; i<cookieArray.length; i++) {
        var namePlus = name + "="; //for convenience
        var currentCookie = cookieArray[i];
        //Remove whitespace at front
        while(currentCookie.charAt(0) == ' ') {
            currentCookie = currentCookie.substring(1);
        }
        if (currentCookie.indexOf(namePlus) == 0) { //If the first item in the cookie is the cookie name
            return currentCookie.substring(namePlus.length,currentCookie.length); //Returning all except the name
        }
    }
    return "" //If no cookie found
},

/**
 * Used to get the decoded form of the data stored in a specifically named cookie, if it exists
 *
 * @alias TOOLS~COOKIES~getDecodedCookie
 * @param {string} name - the name used as a key to identify the cookie requested
 *
 * @returns cookieData - the decoded cookie data, whatever type or form that may be, or the cookie as a raw string if no decoding function exists.
 */
getDecodedCookie:function(name) {
    var cookieDat = TOOLS.COOKIES.getCookie(name)
    if (_cookieDecoders.hasOwnProperty(name)) {
        return _cookieDecoders[name](cookieDat);
    } else {return cookieDat;}
},

/**
 * Used to get the encoded form of some cookie data, if possible
 *
 * @alias TOOLS~COOKIES~getEncodedCookieString
 * @param {string} name - the name used as a key to identify the cookie requested
 * @param cookieData - the cookie data to encode as a string
 *
 * @returns {string | null} encodedString - the encoded cookie string, or null if no encoder exists
 */
getEncodedCookieString:function(name,cookieData){
	if (_cookieEncoders.hasOwnProperty(name)) {
		return _cookieEncoders[name](cookieData);
	} else {return null;}
},

/**
 * Used to set a cookie with particular data
 *
 * @alias TOOLS~COOKIES~setCookie
 * @param {string} name - the name used as a key to identify the cookie to be set
 * @param {string|number} data - the data value to associate with the cookie
 * @param {number} time - the number of milliseconds for which the cookie should be retained before expiring
 */
setCookie:function(name, data, time) {
    var date = new Date(); //Current date
    date.setTime(date.getTime() + time); //Adding time to date
    var expiry = "expires=" + date.toUTCString(); //Setting expiry info
    document.cookie = name + "=" + data + ";" + expiry + ";path=/"; //setting cookie
},

/**
 * Used to set the expiry time to a single value for all cookies present in the document
 *
 * @alias TOOLS~COOKIES~refreshCookies
 * @param {number} time - the number of milliseconds for which all cookies should be retained before expiring
 */
refreshCookies:function(time) {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i=0; i<cookieArray.length; i++) {
        var name = cookieArray[i].split('=')[0];
        var data = cookieArray[i].split('=')[1];
        //remove whitespace at front
        while(name.charAt(0) == ' ') {
            name = name.substring(1);
        }
        TOOLS.COOKIES.setCookie(name,data,time);
    }
},

/**
 * Used to reset the expiry time on the "cookieDuration" cookie, or set the cookie to the default value ('hour') if it does not exist
 *
 * @alias TOOLS~COOKIES~setCookieDuration
 */
setCookieDuration:function() {
    if (TOOLS.COOKIES.getCookie("cookieDuration") == "") {
        if (CONFIG.hasOwnProperty("default-cookie-expiry")) {
            var default_cookie_expiry = CONFIG["default-cookie-expiry"];
            var duration = TOOLS.convertNameToDuration(default_cookie_expiry);
            if (duration != 0) {
                TOOLS.COOKIES.setCookie("cookieDuration",default_cookie_expiry,TOOLS.convertNameToDuration(default_cookie_expiry));
            } else {
                TOOLS.COOKIES.setCookie("cookieDuration","hour",3600000);
            }
        } else {
            TOOLS.COOKIES.setCookie("cookieDuration","hour",3600000);
        }
    }
    else {
        var duration = TOOLS.COOKIES.getCookie("cookieDuration");
        TOOLS.COOKIES.setCookie("cookieDuration",duration,TOOLS.convertNameToDuration(duration));
    }
},

/**
 * Convenience function used to get the numerical value represented in the "cookieDuration" cookie
 *
 * @alias TOOLS~COOKIES~setCookieDuration
 * @returns {number} timeMilliseconds - the number of milliseconds represented by the string stored in the in the "cookieDuration" cookie
 */
getCookieDuration:function() {
    TOOLS.COOKIES.setCookieDuration();
    return TOOLS.convertNameToDuration(TOOLS.COOKIES.getCookie("cookieDuration"));
},

validateCookies:function(failure_callback) {
    var decodedCookie = decodeURIComponent(document.cookie); //get all cookie info
    var cookieArray = decodedCookie.split(';'); //an array containing each cookie as an element
    for(var i=0; i<cookieArray.length; i++) {
        var currentCookie = cookieArray[i];
        //Remove whitespace at front
        while(currentCookie.charAt(0) == ' ') {
            currentCookie = currentCookie.substring(1);
        }
		currentCookie = currentCookie.split("=");
		if (_validateCookie(currentCookie)) {
            failure_callback();
            return false;
        }
    }
    return true
},


},


//START OF QUERY FUNCTIONS


QUERIES:{
/**
 * Used to reload the current page, removing the current query string if applicable and adding a new query string from the queryDict argument
 *
 * @alias TOOLS~QUERIES~freshQuery
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
freshQuery:function(queryDict) {
    var pathname = document.location.pathname;
    var queryString = "?"
    for (var key in queryDict) {
        if(queryDict.hasOwnProperty(key)) {
            queryString += key + "=" + queryDict[key] + "&"; //Add queries one by one
        }
    }
    if (queryString.length === 1) {
        console.log("updateQuery called with a blank query list!")
        return false;
    } else {
        return pathname + queryString.substring(0,queryString.length-1); //Stripping trailing &
    }
},

/**
 * Used to reload the current page, updating the query string from the queryDict argument
 * Queries already present will have their values overwritten if specified in the queryDict argument; requested queries not previously present will be appended to the query string
 *
 * @alias TOOLS~QUERIES~updateQuery
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
updateQuery:function(queryDict) {
    if (location.search === "") {
        return TOOLS.QUERIES.freshQuery(queryDict);
    }
    else {
        var pathname = document.location.pathname;
        var urlParams = new URLSearchParams(location.search);
        for (var key in queryDict) {
            if (queryDict.hasOwnProperty(key)) {
                urlParams.set(key,queryDict[key]);
            }
        }
        return pathname + "?" + urlParams.toString();
    }
},

/**
 * Convenience function to change query string without refreshing
 *
 * @alias TOOLS~QUERIES~changeQueryString
 * @param {string} redirectURL
 */
changeQueryString:function(redirectURL) {
    window.history.pushState({},null,redirectURL);
},

/**
 * Used to ensure that a query string exists for the current page - if one does not, redirects to the current page but with a query string built from the key-value pairs of the 'queryDict' argument
 *
 * @alias TOOLS~QUERIES~ensureQuery
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
ensureQuery:function(queryDict) {
    if (location.search === "") {
        return TOOLS.QUERIES.freshQuery(queryList);
    } else {return false;}
},

/**
 * Used to ensure that a query exists for a specific key on the current page - if it does not, redirects to the current page but with the key in the query string with value set to the specified default value
 *
 * @alias TOOLS~QUERIES~ensureKeyQuery
 * @param {string} key - the key to check for in the query string and add if missing
 * @param {string} defaultValue - the value to set the key to if it is not present
 */
ensureKeyQuery:function(key,defaultValue) {
    var queryDict = {};
    queryDict[key] = defaultValue;
    if (location.search === "") {
        return TOOLS.QUERIES.freshQuery(queryDict);
    } else {
        var pathname = document.location.pathname;
        var urlParams = new URLSearchParams(location.search);
        if (urlParams.get(key) === null) {
            urlParams.set(key,defaultValue);
            return pathname + "?" + urlParams.toString();
        }
		return false;
    }
},

/**
 * Convenience function used to read the value of a query by given key - if the query doesn't exist, returns null
 *
 * @alias TOOLS~QUERIES~readKeyQuery
 * @param {string} key - the key to read in the query string
 * @returns {string | null} value - the string value of the query, or null if the query doesn't exist.
 */
readKeyQuery:function(key) {
    if (location.search === "") {
        return null;
    } else {
        var urlParams = new URLSearchParams(location.search);
        return urlParams.get(key);
    }
}

}

};
})();

LOADER.current_callback();
