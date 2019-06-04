var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";

function queue() {
    document.getElementById("listDiv").innerHTML = "queue data goes here";
}

function downloaded() {
    document.getElementById("listDiv").innerHTML = "downloaded data goes here";
}

function favourites() {
    document.getElementById("listDiv").innerHTML = "downloaded data goes here";
}

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
        default:
            return "";
            break;
    }
}

supplyButtons(document.getElementById("listTabsDiv"),listTabCallback)

current_callback();
