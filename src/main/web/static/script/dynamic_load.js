//For inserting a script into the current html doc.
//'element' is the element before which the script element should be located, 'path' is the path to the script.
function insert_before(element,path) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    //script.async = true;
    script.src = path + "?v" + Math.random();
    element.parentNode.insertBefore(script,element);
}

//For when multiple scripts need to be loaded in in a specific order.
//'element' is the element before which the scripts should be located, 'paths' is an array containing the paths in order.
//Works by calling a callback for the next stage of loading at the end of each load.
function insert_all_before(element,paths) {
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
