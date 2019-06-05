//Reloads the current page with the query added on
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

//Reloads the current page, modifying the query with queries in 'queryList' being added / replacing current vals
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

//If the current page has no query, reloads the current page with default queries 'queryList' added on
function ensureQuery(queryDict) {
    if (location.search === "") {
        freshQuery(queryList);
    }
}

//If the current page has no query value for 'key', reloads the current page with default value 'defaultValue' added to the queries.
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
