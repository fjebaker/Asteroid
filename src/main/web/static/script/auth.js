"use strict"

var AUTH = (function() {

LOADER.loaded_scripts["script/auth.js"] = "AUTH";

var bodyDiv = document.getElementById("bodyDiv"); //This is standard for all HTML files
var astyImg = document.getElementsByTagName("IMG")[0];

/**
 * Callback used for dealing with loaded 'getAllUsers' JSON data in the process of submitting a username for authorisation.
 *
 * @param {string|Object} data - the JSON data, if successfully loaded, or a string giving the error status if loading was unsuccessful.
 * @param {string} submittedName - the username submitted by the user, with possible modification made by previously called functions.
 * @param {Object} event - the event (default implementation: a "click" event) which triggered the username submission.
 */
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
                    TOOLS.COOKIES.setCookie("id", JSON.parse(request.response).id,TOOLS.COOKIES.getCookieDuration());
                    var redirStr = TOOLS.QUERIES.updateQuery({v:Math.random()});
                    if (redirStr != false) {
                        document.location.href = redirStr;
                    }
                }
            }
            function failure(request) {
                messageSection.innerHTML = "Error sending POST request";
            }
            TOOLS.postRequest(new FormData(event.target),"/register",success,failure);
            messageSection.innerHTML = "Username request sent";
        }
    }
    bodyDiv.appendChild(messageSection);
}

/**
 * Callback used for the submission trigger in the process of a user submitting a username for authorisation.
 *
 * @param {Object} event - the event (default implementation: a "click" event) which triggered the username submission.
 */
function _submitClick(event) {
    event.preventDefault();
    var submittedName = document.getElementById("usernameInput").value;
    submittedName = submittedName.replace(/\s/g,'');
    if (submittedName === '') {
        var messageSection = document.createElement("p");
        messageSection.innerHTML = "Blank usernames are not valid"
        bodyDiv.appendChild(messageSection);
    } else {
        TOOLS.getJson("/db/users?getAllUsers",function(data){_dealWithReceivedJson(data,submittedName,event);},function(data){messageSection.innerHTML = "Unable to load user data for uniqueness check";bodyDiv.appendChild(messageSection);});
    }
}

return {
pageSize:"noSize",

/**
 * Used to check if the user has a valid "id" auth cookie and creates a form if not
 *
 * @alias AUTH~createAuth
 */
createAuth:function() {
    if (AUTH.pageSize == "big") {
        astyImg.style="width:50%";
    } else {
        astyImg.style="width:100%";
    }
    var currId = TOOLS.COOKIES.getCookie("id");
    function create_auth_form() {
        bodyDiv.innerHTML = "<p>Enter Username:</p>";
        const form = document.createElement('form');
        form.class="auth_form_"+AUTH.pageSize;
        form.method = 'post';
        form.action = '/register';
        const usernameInput = document.createElement('input');
        usernameInput.type='text';
        usernameInput.name='name';
        usernameInput.id='usernameInput'
        if (AUTH.pageSize == "small") {
            usernameInput.size=40;
        } else {
            usernameInput.size=80;
        }
        form.appendChild(usernameInput);
        const sendButton = document.createElement('input');
        sendButton.type='submit';
        sendButton.value='submit';
        form.appendChild(sendButton);
        form.addEventListener("submit",_submitClick);
        bodyDiv.appendChild(form);
    }
    function authFailure(data) {
        const em = document.createElement('em')
        em.innerHTML = "Error contacting the server to authorise your account! Please try again."
        bodyDiv.parentNode.insertBefore(em,bodyDiv)
        bodyDiv.innerHTML = "<button onclick='updateQuery(\"v\":Math.random())'>Refresh page</button>"
    }
    if (currId == "") {
        create_auth_form();
    } else {
        TOOLS.getJson('/db/users?id='+currId,function(data){if(typeof data == "string" || !data[0].hasOwnProperty("name")){authFailure(data);}else{document.location.href = "/?menu=open&v="+Math.random();}});
    }
}

}

})();

LOADER.current_callback();
