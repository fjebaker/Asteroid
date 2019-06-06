//Sends a post request with data 'data' to 'address'.
//On error or timeout, calls failureCallback with the request as arg.
//On success, calls successCallback with the request as arg.
//Concern: is it fine to use onload etc. for all?

/*
 * Used to handle POST requests to the flask server
 *
 * @param {FormData} data - the form data to be posted to the server
 * @param {postCallback} successCallback - the callback to call upon success of the POST request
 * @param {postCallback} failureCallback -  the callback to call upon timeout or error event of the POST request
 */
function postRequest(data,address,successCallback,failureCallback) {
    var request = new XMLHttpRequest();
    request.open('POST',address,true);
    request.onload = function(){successCallback(request);};
    request.onerror = function(){failureCallback(request);};
    request.ontimeout = function(){failureCallback(request);};
    request.send(data);
}

/**
 * The callback called upon either the success or failure of a POST request
 * @callback postCallback
 * @param {XMLHttpRequest} request - the HTTP POST request in question
 */

current_callback();
