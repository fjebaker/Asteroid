/**
 * Used to reload the current page, removing the current query string if applicable and adding a new query string from the queryDict argument
 *
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
function freshQuery(queryDict) {
    var pathname = document.location.pathname;
    var queryString = "?"
    for (var key in queryDict) {
        if(queryDict.hasOwnProperty(key)) {
            queryString += key + "=" + queryDict[key] + "&"; //Add queries one by one
        }
    }
    if (queryString.length === 1) {
        console.log("updateQuery called with a blank query list!")
    } else {
        window.location.href = pathname + queryString.substring(0,queryString.length-1); //Stripping trailing &
    }
}

/**
 * Used to reload the current page, updating the query string from the queryDict argument
 * Queries already present will have their values overwritten if specified in the queryDict argument; requested queries not previously present will be appended to the query string
 *
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
function updateQuery(queryDict) {
    if (location.search === "") {
        freshQuery(queryDict);
    }
    else {
        var pathname = document.location.pathname;
        var urlParams = new URLSearchParams(location.search);
        for (var key in queryDict) {
            if (queryDict.hasOwnProperty(key)) {
                urlParams.set(key,queryDict[key]);
            }
        }
        window.location.href = pathname + "?" + urlParams.toString();
    }
}

/**
 * Used to update the query string from the queryDict argument without reloading the page
 *
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
function updateQueryWithoutReload(queryDict) {
    if (location.search === "") {
        freshQuery(queryDict);
    }
    else {
        var pathname = document.location.pathname;
        var urlParams = new URLSearchParams(location.search);
        for (var key in queryDict) {
            if (queryDict.hasOwnProperty(key)) {
                urlParams.set(key,queryDict[key]);
            }
        }
        window.history.pushState({},null,pathname + "?" + urlParams.toString());
    }
}

/**
 * Used to ensure that a query string exists for the current page - if one does not, redirects to the current page but with a query string built from the key-value pairs of the 'queryDict' argument
 *
 * @param {Object} queryDict - an object with each required query string key as a property with the required value as its value; i.e such that queryDict[key] = value for each key-value pair required in the query
 */
function ensureQuery(queryDict) {
    if (location.search === "") {
        freshQuery(queryList);
    }
}

/**
 * Used to ensure that a query exists for a specific key on the current page - if it does not, redirects to the current page but with the key in the query string with value set to the specified default value
 *
 * @param {string} key - the key to check for in the query string and add if missing
 * @param {string} defaultValue - the value to set the key to if it is not present
 */
function ensureKeyQuery(key,defaultValue) {
    var queryDict = {};
    queryDict[key] = defaultValue;
    if (location.search === "") {
        freshQuery(queryDict);
    } else {
        var pathname = document.location.pathname;
        var urlParams = new URLSearchParams(location.search);
        if (urlParams.get(key) === null) {
            urlParams.set(key,defaultValue);
            window.location.href = pathname + "?" + urlParams.toString();
        }
    }
}

current_callback();
