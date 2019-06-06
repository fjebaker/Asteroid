var bodyDiv = document.getElementById("bodyDiv");
insert_before(bodyDiv,"../script/post.js");
bodyDiv.innerHTML = "<div id='listTabsDiv'></div><div id='listDiv'>list data goes here</div>";
var allSongsJSONData = "no result";
//success func should check if string
getJson("/db/music?=getAllSongs",function(data){allSongsJSONData = data;queue();},function(){document.location.href = document.location.href;});

//Called upon form submission
function _submitVote(event){
    event.preventDefault();
    function success(request) {
        if (request.status == 404) {
            console.log("404: POST response not found");
        }
        if (request.status == 201||request.status == 200) {
            updateQuery({v:Math.random()});
        }
    }
    function failure(request) {
        console.log("Error sending POST request");
    }
    postRequest(new FormData(event.target),"/vote",success,failure);
}

//Generates and returns form for voting buttons with id songid
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
    uidValue.value=getCookie("id");
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
    form.addEventListener("submit",_submitVote);
    return form;
}

//Changes a number of seconds 'secs' into a string formatted "minutes:seconds"
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

//Fills the listDiv with the server's downloaded song list
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

//Fills the queue table with queue items from the json data 'data'
function _queue(data) {
    if (typeof data == "string") {
        console.log("Unable to load user data for uniqueness check: status "+data);
    } else {
        data.sort(function(a,b){return b[2]-a[2];})
        var queueVotingTable = document.getElementById("queueVotingTable");
        for (var i=0; i<data.length; i++) {
            if (data[i][2] > 0) {
                if (data[i][0] < allSongsJSONData.length) {
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
                    var votingForm = createVoteForm(data[i][0]);
                    voteCell.appendChild(votingForm);
                }
            }
            else {i = data.length;}
        }
    }
}

//Calls getJson to fill listDiv with queue data
function queue() {
    document.getElementById("listDiv").innerHTML = "<table style='width:100%' id='queueVotingTable'><tr><th>Name</th><th>Artist</th><th>Duration</th><th>Votes</th><th>Vote</th></tr></table>"
    getJson("/vote",_queue,function(data){document.getElementById("listDiv").innerHTML = "Unable to load queue data!";});
}

//nop
function favourites() {
    document.getElementById("listDiv").innerHTML = "favourites data goes here";
}

//nop
function playlists() {
    document.getElementById("listDiv").innerHTML = "playlist data goes here";
}

//Lookup table for stuff
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
