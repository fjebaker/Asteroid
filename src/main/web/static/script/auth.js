var bodyDiv1 = document.getElementById("bodyDiv1");

function _deal_with_received_json(data,submittedName,event){
    var messageSection = document.createElement("p");
    if (typeof data == "string") {
        messageSection.innerHTML = "<br>Unable to load user data for uniqueness check"
    } else {
        var match = false;
        for (var i=0; i<data.length; i++) {
            if(submittedName.toString().toLowerCase() === data[i].name.toString().toLowerCase()) {
                match = true;
                i = data.length;
            }
        }
        if (match) {
            messageSection.innerHTML = "<br>Username is already taken"
        } else {
            var request = new XMLHttpRequest();
            request.open('POST','/register',true);
            request.onload = function() {
                if (request.status == 404) {
                    messageSection.innerHTML = "<br>404: POST response not found"
                }
                if (request.status == 201) {
                    setCookie("id",submittedName,getCookieDuration());
                    document.location.href = document.location.href;
                }
            };
            request.onerror = function() {
                messageSection.innerHTML = "<br>Error sending POST request";
            };
            document.getElementById("usernameInput").value = submittedName;
            request.send(new FormData(event.target));
        }
    }
    bodyDiv1.appendChild(messageSection);
}

function _submit_click(event) {
    event.preventDefault();
    var submittedName = document.getElementById("usernameInput").value;
    submittedName = submittedName.replace(/\s/g,'');
    if (submittedName === '') {
        var messageSection = document.createElement("p");
        messageSection.innerHTML = "<br>Blank usernames are not valid"
        bodyDiv1.appendChild(messageSection);
    } else {
        getJson("/db/users?=getAllUsers",function(data){_deal_with_received_json(data,submittedName,event);});
    }
}

if (getCookie("id") == "") {
    bodyDiv1.innerHTML = "<p>Enter Username:</p>";
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
    form.appendChild(sendButton);
    form.addEventListener("submit",_submit_click);
    bodyDiv1.appendChild(form);
} else {
    redirectLocal("");
}

current_callback();
