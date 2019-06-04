var bodyDiv1 = document.getElementById("bodyDiv1");

if (getCookie("id") == "") {
    bodyDiv1.innerHTML = "This is where my cookie giving button would go... IF I HAD ONE!!!";
    setCookie("id","hello b0ss",30000);
} else {
    redirectLocal("");
}

current_callback();
