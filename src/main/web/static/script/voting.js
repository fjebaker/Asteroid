var bodyDiv = document.getElementById("bodyDiv");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";
var allSongsJSONData = "no result";
getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;queue();});

function _song_id_from_name(name) {
    for (var i=0; i<allSongsJSONData.length; i++) {
        if (allSongsJSONData[i].name === name) {return i;}
    }
    return -1;
}

function _submit_vote(event){
    event.preventDefault();
    var request = new XMLHttpRequest();
    request.open('POST','/vote',true);
    request.onload = function() {
        if (request.status == 404) {
            console.log("404: POST response not found");
        }
        if (request.status == 201||request.status == 200) {
            document.location.href = document.location.href;
        }
    };
    request.onerror = function() {
        console.log("Error sending POST request");
    };
    request.send(new FormData(event.target));
}

function createVoteForm(songid) {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/register';
    const songName = document.createElement('input');
    songName.type='hidden';
    songName.name='s_id';
    songName.value=songid;
    form.appendChild(songName);
    const uidValue = document.createElement('input');
    uidValue.type='hidden';
    uidValue.name='u_id';
    uidValue.value='999'; //Sort out later
    form.appendChild(uidValue);
    const voteValue = document.createElement('input');
    voteValue.type='hidden';
    voteValue.name='vote';
    voteValue.value='1';
    form.appendChild(voteValue);
    const upvoteButton = document.createElement('button');
    upvoteButton.type='submit';
    upvoteButton.name='vote';
    upvoteButton.value=1;
    upvoteButton.innerHTML="Upvote";
    form.appendChild(upvoteButton);
    const downvoteButton = document.createElement('button');
    downvoteButton.type='submit';
    downvoteButton.name='vote';
    downvoteButton.value=-1;
    downvoteButton.innerHTML="Downvote";
    downvoteButton.onclick=function(){voteValue.value=-1;};
    form.appendChild(downvoteButton);
    form.addEventListener("submit",_submit_vote);
    return form;
}

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
        var votingForm = createVoteForm(i);
        voteCell.appendChild(votingForm);
    }
}

function _queue(data) {
    data.sort(function(a,b){return b[2]-a[2];})
    var queueVotingTable = document.getElementById("queueVotingTable");
    for (var i=0; i<data.length; i++) {
        if (data[i][2] > 0) {
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
            var votingForm = createVoteForm(_song_id_from_name(currSong.name));
            voteCell.appendChild(votingForm);
        }
        else {i = data.length;}
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

supplyButtons(document.getElementById("listTabsDiv"),listTabCallback);

current_callback();
