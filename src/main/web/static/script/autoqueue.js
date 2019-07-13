/**
 * Function used to request a song from the autoadd song list once every 2 minutes
 *
 * @param Object songArr - A javascript array object containing the rowids of all songs in the autoadd song list (as strings)
 */
function autoAdd(songArr) {
    var indexToAdd = songArr[Math.floor(Math.random()*songArr.length)];
    var formData = new FormData();
    formData.append('s_id',indexToAdd);
    formData.append('u_id',getCookie("id"));
    formData.append('vote',1);
    function success(request) {
        if (request.status == 404) {
            console.log("404: POST response not found");
        }
        if (request.status == 201||request.status == 200) {
            console.log("Queued song with id "+indexToAdd)
            document.getElementById("tabsDiv").innerHTML += "Queued song with id "+indexToAdd+"<br>";
            setTimeout(autoAdd,120000,songArr);
        }
    }
    function failure(request) {
        console.log("Error sending POST request");
    }
    postRequest(formData,"/vote",success,failure);
}


/**
 * Function used to begin the autoadding process with a list of songs in the query string, or redirect if autoadding is not allowed / invalid
 */
function parseQueryStringSongList() {
    //Check if valid to be here
    var urlParams = new URLSearchParams(location.search);
    if(urlParams.has("songs")) {
        var songsArr = urlParams.get("songs").split(" ");
        document.getElementById("tabsDiv").innerHTML = "Autoqueueing songs -- as long as this tab is actively running, a random song from the requested set of songs will be added to the queue every so often.<br>";
        setTimeout(autoAdd,120000,songsArr);
    } else {
        document.location.href ="/?v="+Math.random();
    }
}

current_callback();
