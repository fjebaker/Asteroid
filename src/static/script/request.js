"use strict"

var BODY_CONTENT = (function(){

LOADER.loaded_scripts["script/request.js"] = "BODY_CONTENT";

var bodyDiv = document.getElementById("bodyDiv"); //This is standard for all HTML files

function _requestURL() {
    function success(request) {
        if (request.status == 400) {
            document.getElementById("requestPostEm").innerHTML += "Please input a valid URL.<br>"
        }
        if (request.status == 404) {
            console.log("404: POST response not found")
        }
        if (request.status == 201||request.status == 200) {
            bodyDiv.innerHTML = "<br>Song request successfully made!"
        }
    }
    function failure(request) {
        console.log("Error sending POST request");
    }
    var url = document.getElementById("requestPostData").value;
    var parser = document.createElement('a');
    parser.href = url;
    if (parser.host != "" && parser.host != window.location.host) {
        var formData = new FormData();
        formData.append("url",url)
        formData.append("type","url")
        TOOLS.postRequest(formData,"/request",success,failure)
    } else {
        document.getElementById("requestPostEm").innerHTML += "Please input a valid URL.<br>"
    }
}

return {
pageSize:"noSize",
populateBody:function(){
    bodyDiv.innerHTML = "<br>URL to request: <input type='text' id='requestPostData'><br><button class='request_post_button_"+BODY_CONTENT.pageSize+"' id='requestPostButton'>Request!</button><em id='requestPostEm'></em>";
    document.getElementById("requestPostButton").onclick = _requestURL;
}

};

})();

LOADER.current_callback();
