var bodyDiv1 = document.getElementById("bodyDiv1");

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

//Redirects to another HTML page 'name' in the html folder. May be replaced by server requests later, idk
function redirectLocal(name) {
    var pathArray = document.location.pathname.split('/');
    pathArray.pop();
    window.location.href = pathArray.join('/') + "/" + name;
}

function supplyIdHTML() {
    if (getCookie("id") == "") {
        bodyDiv1.innerHTML = "This is where my cookie giving button would go... IF I HAD ONE!!!";
        setCookie("id","hello b0ss",30000);
    } else {
        redirectLocal("home.html");
    }
}

function checkCookieValidity() {
    if (getCookie("id") == "") {
        redirectLocal("auth.html");
    }
}
