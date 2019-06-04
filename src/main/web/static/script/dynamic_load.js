function insert_before(element,path) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    //script.async = true;
    script.src = path + "?v" + Math.random();
    element.parentNode.insertBefore(script,element);
}

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
