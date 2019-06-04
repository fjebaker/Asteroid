var bodyDiv = document.getElementById("bodyDiv");

function selectCookieDuration(select) {
    setCookie("cookieDuration",select.value,convertNameToDuration(select.value));
    refreshCookies(convertNameToDuration(select.value));
    window.location.href = window.location.href;
}

bodyDiv.innerHTML = "Expiration time for basic client-side stored cookies: <select onchange='selectCookieDuration(this)' id='cookieDurationSelector'></select>"

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

putOptions();

current_callback();
