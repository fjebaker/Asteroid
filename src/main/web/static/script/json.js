/*
 * Used to handle GET requests for JSON data distributed by the flask server
 *
 * @param {string} filename - the location to which the GET request should be sent
 * @param {successCallback} successCallback - the callback to call upon successful loading of the JSON resource
 * @param {failureCallback} failureCallback -  the callback to call upon timeout or error event of the GET request
 */
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

/**
 * The callback called upon the successful loading of a JSON resource accessed via GET request
 * @callback successCallback
 * @param {Object|string} data - If the GET request loads with status code 200 (OK), the JSON resource loaded. If the GET request loads with any other HTTP status code, returns the status code as a string (e.g "404")
 */

/**
 * The callback called upon a timeout or error in accessing a JSON resource via GET request
 * @callback failureCallback
 */


current_callback();
