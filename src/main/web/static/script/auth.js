var bodyDiv = document.getElementById("bodyDiv"); //This is standard for all HTML files

function _dealWithReceivedJson(data,submittedName,event){
    //Needs changing for proper reporting
    var messageSection = document.createElement("p");
    if (typeof data == "string") {
        messageSection.innerHTML = "Unable to load user data for uniqueness check: status "+data;
    } else {
        var match = false;
        for (var i=0; i<data.length; i++) {
            if(submittedName.toString().toLowerCase() === data[i].name.toString().toLowerCase()) {
                match = true;
                i = data.length;
            }
        }
        if (match) {
            messageSection.innerHTML = "Username is already taken";
        } else {
            document.getElementById("usernameInput").value = submittedName;
            function success(request) {
                if (request.status == 400) {
                    messageSection.innerHTML = "400: Bad request";
                }
                if (request.status == 404) {
                    messageSection.innerHTML = "404: Not found";
                }
                if (request.status == 201) {
                    setCookie("id", JSON.parse(request.response).id,getCookieDuration());
                    updateQuery({v:Math.random()});
                }
            }
            function failure(request) {
                messageSection.innerHTML = "Error sending POST request";
            }
            postRequest(new FormData(event.target),"/register",success,failure);
            messageSection.innerHTML = "Username request sent";
        }
    }
    bodyDiv.appendChild(messageSection);
}

//Event to be called upon form submission
function _submitClick(event) {
    event.preventDefault();
    var submittedName = document.getElementById("usernameInput").value;
    submittedName = submittedName.replace(/\s/g,'');
    if (submittedName === '') {
        var messageSection = document.createElement("p");
        messageSection.innerHTML = "Blank usernames are not valid"
        bodyDiv.appendChild(messageSection);
    } else {
        getJson("/db/users?=getAllUsers",function(data){_dealWithReceivedJson(data,submittedName,event);},function(data){messageSection.innerHTML = "Unable to load user data for uniqueness check";bodyDiv.appendChild(messageSection);});
    }
}

ensureKeyQuery("v",Math.random())

if (getCookie("id") == "") {
    bodyDiv.innerHTML = "<p>Enter Username:</p>";
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/register';
    const usernameInput = document.createElement('input');
    usernameInput.type='text';
    usernameInput.name='name';
    usernameInput.id='usernameInput'
    form.appendChild(usernameInput);
    const sendButton = document.createElement('input');
    sendButton.type='submit';
    sendButton.value='submit';
    form.appendChild(sendButton);
    form.addEventListener("submit",_submitClick);
    bodyDiv.appendChild(form);
} else {
    document.location.href = "/?v="+Math.random();
}

current_callback();
