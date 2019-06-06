/**
 * Used for inserting a script into the current html document.
 *
 * @param {Object} element - document element before which the script should be inserted
 * @param {string} path - path the the .js script
 */
function insert_before(element,path) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    //script.async = true;
    script.src = path + "?v" + Math.random();
    element.parentNode.insertBefore(script,element);
}

/**
 * Used for inserting multiple scripts into a html document in a specific order.
 *
 * @param {Object} element - document element before which the scripts should be inserted
 * @param {Array} paths - paths to the various .js scripts
 */
function insert_all_before(element,paths) {
    //Works by calling a callback for the next stage of loading at the end of each load.
    if (paths.length == 1) {
        current_callback = function(){};
    } else {
        var new_paths = paths.slice(1);
        current_callback = function(){
            insert_all_before(element,new_paths);
        }
    }
    insert_before(element,paths[0]);
}
