var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";

function queue() {
    document.getElementById("listDiv").innerHTML = "queue data goes here";
}

function listTabCallback(name) {
    switch(name) {
        case "Queue":
            return queue;
            break;
        default:
            return "";
            break;
    }
}

supplyButtons(document.getElementById("listTabsDiv"),listTabCallback)
