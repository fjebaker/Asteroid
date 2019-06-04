var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";
var allSongsJSONData = "no result";
getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;});

function songLengthFormat(secs) {
    var secrem = secs % 60;
    var mins = (secs - secrem)/60;
    if (secrem < 10) {
        return mins + ":0" + secrem;
    }
    else {
        return mins + ":" + secrem;
    }
}

function downloaded() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='downloadedVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Vote</th></tr></table>"
    var downloadedVotingTable = document.getElementById("downloadedVotingTable");
    for (var i=0; i<allSongsJSONData.length; i++) {
        var newRow = downloadedVotingTable.insertRow(-1);
        var nameCell = newRow.insertCell(0);
        var artistCell = newRow.insertCell(1);
        var durationCell = newRow.insertCell(2);
        var voteCell = newRow.insertCell(3);
        var currSong = allSongsJSONData[i];
        nameCell.innerHTML = currSong.name;
        artistCell.innerHTML = currSong.artist;
        durationCell.innerHTML = songLengthFormat(currSong.duration);
    }
}

function _queue(data) {
    data.sort(function(a,b){return b[2]-a[2];})
    var queueVotingTable = document.getElementById("queueVotingTable");
    for (var i=0; i<data.length; i++) {
        var newRow = queueVotingTable.insertRow(-1);
        var nameCell = newRow.insertCell(0);
        var artistCell = newRow.insertCell(1);
        var durationCell = newRow.insertCell(2);
        var votesCell = newRow.insertCell(3);
        var voteCell = newRow.insertCell(4);
        var currSong = allSongsJSONData[data[i][0]];
        nameCell.innerHTML = currSong.name;
        artistCell.innerHTML = currSong.artist;
        durationCell.innerHTML = songLengthFormat(currSong.duration);
        votesCell.innerHTML = data[i][2];
    }
}

function queue() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='queueVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Votes</th><th>Vote</th></tr></table>"
    getJson("/vote",_queue);
}

function favourites() {
    document.getElementById("listDiv").innerHTML = "favourites data goes here";
}

function playlists() {
    document.getElementById("listDiv").innerHTML = "playlist data goes here";
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
            return playlists;
            break;
        default:
            return "";
            break;
    }
}

supplyButtons(document.getElementById("listTabsDiv"),listTabCallback)

current_callback();
