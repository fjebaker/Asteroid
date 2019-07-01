/**
 * Used to get the string data stored in a specifically named cookie
 *
 * @param {string} name - the name used as a key to identify the cookie requested
 *
 * @returns {string} cookieData - the data string stored under the cookie of name 'name'
 */
function getCookie(name) {
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
}

/**
 * Used to set a cookie with particular data
 *
 * @param {string} name - the name used as a key to identify the cookie to be set
 * @param {string|number} data - the data value to associate with the cookie
 * @param {number} time - the number of milliseconds for which the cookie should be retained before expiring
 */
function setCookie(name, data, time) {
    var date = new Date(); //Current date
    date.setTime(date.getTime() + time); //Adding time to date
    var expiry = "expires=" + date.toUTCString(); //Setting expiry info
    document.cookie = name + "=" + data + ";" + expiry + ";path=/"; //setting cookie
}

/**
 * Used to set the expiry time to a single value for all cookies present in the document
 *
 * @param {number} time - the number of milliseconds for which all cookies should be retained before expiring
 */
function refreshCookies(time) {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    for (var i=0; i<cookieArray.length; i++) {
        var name = cookieArray[i].split('=')[0];
        var data = cookieArray[i].split('=')[1];
        //remove whitespace at front
        while(name.charAt(0) == ' ') {
            name = name.substring(1);
        }
        setCookie(name,data,time);
    }
}

/**
 * Used to ensure that the user has a valid "id" cookie and redirect to the auth page if it does not
 * TODO - Make so only resets if a successful response is got
 */
function checkCookieValidity() {
    var currId = getCookie("id");
    if (currId == "") {
        document.location.href = "/auth?v="+Math.random();
    }
    function authFailure(data) {
        setCookie("id","",0);
        document.location.href = "/auth?v="+Math.random();
    }
    getJson('/db/users?id='+currId,function(data){if (typeof data == "string" || !data[0].hasOwnProperty("name")){authFailure(data);}},authFailure);
}

const _durationNames = {
    "minute":60000,
    "hour":3600000,
    "day":86400000,
    "month":2656800000,
    "year":31557600000
};

/**
 * Used to convert string-formatted values for the "cookieDuration" cookie to number of milliseconds
 *
 * @param {string} timeString - the indicative string ('minute','hour','day','week','month' or 'year') to convert
 *
 * @returns {number} timeMilliseconds - the number of milliseconds represented by the given string. Defaults to 0 if the string is not one of the above recognised strings
 */
function convertNameToDuration(timeString) {
    return _durationNames[timeString] || 0
}

/**
 * Used to reset the expiry time on the "cookieDuration" cookie, or set the cookie to the default value ('hour') if it does not exist
 */
function setCookieDuration() {
    var configJSON = getConfigJson();
    if (getCookie("cookieDuration") == "") {
        if (configJSON.hasOwnProperty("default_cookie_expiry")) {
            var default_cookie_expiry = configJSON["default_cookie_expiry"]
            setCookie("cookieDuration",default_cookie_expiry,convertNameToDuration(default_cookie_expiry));
        } else {
            setCookie("cookieDuration","hour",3600000);
        }
    }
    else {
        var duration = getCookie("cookieDuration");
        setCookie("cookieDuration",duration,convertNameToDuration(duration));
    }
}

/**
 * Convenience function used to get the numerical value represented in the "cookieDuration" cookie
 *
 * @returns {number} timeMilliseconds - the number of milliseconds represented by the string stored in the in the "cookieDuration" cookie
 */
function getCookieDuration() {
    setCookieDuration();
    return convertNameToDuration(getCookie("cookieDuration"));
}

refreshCookies(getCookieDuration());

current_callback();
