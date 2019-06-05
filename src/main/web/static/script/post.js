//Sends a post request with data 'data' to 'address'.
//On error or timeout, calls failureCallback with the request as arg.
//On success, calls successCallback with the request as arg.
//Concern: is it fine to use onload etc. for all?
function postRequest(data,address,successCallback,failureCallback) {
    var request = new XMLHttpRequest();
    request.open('POST',address,true);
    request.onload = function(){successCallback(request);};
    request.onerror = function(){failureCallback(request);};
    request.ontimeout = function(){failureCallback(request);};
    request.send(data);
}
    
current_callback();
