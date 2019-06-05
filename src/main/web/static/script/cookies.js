//Getting a cookie of specified name 'name'
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

//Setting a cookie of name 'name' with string data 'data' to last 'time' number of milliseconds
function setCookie(name, data, time) {
    var date = new Date(); //Current date
    date.setTime(date.getTime() + time); //Adding time to date
    var expiry = "expires=" + date.toUTCString(); //Setting expiry info
    document.cookie = name + "=" + data + ";" + expiry + ";path=/"; //setting cookie
}

//TODO DOCSTRING
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

function checkCookieValidity() {
    if (getCookie("id") == "") {
        document.location.href = "/auth";
    }
}

//For cookieDuration cookie, durations are stored as an indicative string. This converts that string to a number of milliseconds.
function convertNameToDuration(name) {
    switch (name){
        case "minute":
            return 60000;
            break;
        case "hour":
            return 3600000;
            break;
        case "day":
            return 86400000;
            break;
        case "week":
            return 604800000;
            break;
        case "month":
            return 2656800000;
            break;
        case "year":
            return 31557600000;
            break;
        default:
            return 0;
    }
}

//
function setCookieDuration() {
    if (getCookie("cookieDuration") == "") {
        setCookie("cookieDuration","minute",60000);
    }
    else {
        var duration = getCookie("cookieDuration");
        setCookie("cookieDuration",duration,convertNameToDuration(duration));
    }
}

//
function getCookieDuration() {
    setCookieDuration();
    return convertNameToDuration(getCookie("cookieDuration"));
}

setCookieDuration();
refreshCookies(getCookieDuration());

current_callback();
