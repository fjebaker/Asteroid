/**
 * Callback used for modifying the "cookieDuration" cookie via a 'select' element on the 'change' event and reloading the page with new expiry times on all cookies.
 *
 * @param {Object} select - the select element whose 'change' event has been triggered.
 */
function selectCookieDuration(select) {
    setCookie("cookieDuration",select.value,convertNameToDuration(select.value));
    refreshCookies(convertNameToDuration(select.value)); //Ensuring all cookies are updated with the current cookie duration
    window.location.href = window.location.href;
}

/**
 *  Used for populating a select element with the options relevant to setting the "cookieDuration" cookie
 */
function putOptions() {
    var cookieDurationSelector = document.getElementById("cookieDurationSelector");
    var keys = ['minute','hour','day','week','month','year'];
    var texts = ['1 Minute','1 Hour','1 Day','1 Week','1 Month','1 Year'];
    var defaultKey = getCookie("cookieDuration");
    for (var i = 0; i<keys.length && i<texts.length; i++) {
        var option = document.createElement("option");
        option.value = keys[i];
        option.text = texts[i];
        if (keys[i] == defaultKey) {option.selected = true;}
        cookieDurationSelector.add(option);
    }
}

/**
 * Used for populating a div element with the accounts HTML
 *
 * @param {string} divname - the id for the div element
 */
function populateDivAccount(divname) {
    var bodyDiv = document.getElementById(divname);
    bodyDiv.innerHTML = "Expiration time for basic client-side stored cookies: <select onchange='selectCookieDuration(this)' id='cookieDurationSelector'></select>"
    putOptions();
}

putOptions();

current_callback();
