//Sends a GET request for the json file at 'filename' and calls a callback depending on the result.
//If the GET request is successful and returns a valid JSON file, successCallback is called with the JSON data.
//If the GET request is successful but does not return a valid JSON file, successCallback is called with the status code as a string.
//If the GET request is unsuccessful, failureCallback is called.
function getJson(filename,successCallback,failureCallback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET",filename,true);
    function success() {
        if (rawFile.status == "200") {
            successCallback(JSON.parse(rawFile.response));
        } else {
            successCallback(rawFile.status.toString());
        }
    }
    function failure() {
        failureCallback();
    }
    rawFile.onload = success;
    rawFile.onerror = failure;
    rawFile.ontimeout = failure;
    rawFile.send();
}

current_callback();
