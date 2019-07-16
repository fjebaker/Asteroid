var bodyDiv = document.getElementById("bodyDiv"); //This is standard for all HTML files

function _requestURL() {
    function success(request) {
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
    var formData = new FormData();
    formData.append("url",url)
    postRequest(formData,"/request",success,failure)
}

function setupRequestArea() {
    bodyDiv.innerHTML = "<br>URL to request: <input type='text' id='requestPostData'><br><button id='requestPostButton'>Request!</button>";
    document.getElementById("requestPostButton").onclick = _requestURL
}

tab_callback();
