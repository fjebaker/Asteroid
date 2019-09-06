"use strict"

var CONFIG = {"non-cacheing":1};

var LOADER = {

/**
 * Used for inserting a script into the current html document.
 *
 * @alias LOADER~insert_before
 * @param {string} path - path the the .js script
 * @param {function} final_callback - function to call upon complete execution of insertion
 * @returns {string} script_name - the final loaded in script name
 */
insert_before:function(path,final_callback) {
    LOADER.current_callback = final_callback;
    var script = document.createElement("script");
    script.type = "text/javascript";
    //script.async = true;
    script.src = path + "?v=" + Math.random();
    document.body.appendChild(script);
    return script.src;
},

/**
 * Used for inserting multiple scripts into a html document in a specific order.
 *
 * @alias LOADER~insert_all_before
 * @param {Object} element - document element before which the scripts should be inserted
 * @param {Array} paths - paths to the various .js scripts
 */
insert_all_before:function(paths,finalcallback) {
    //Works by calling a callback for the next stage of loading at the end of each load.
    if (paths.length == 1) {
        if (finalcallback == null) {
            LOADER.current_callback = function(){};
        } else {
            LOADER.current_callback = function(){
                finalcallback();
                LOADER.current_callback = function(){};
            };
        }
    } else {
        var new_paths = paths.slice(1);
        LOADER.current_callback = function(){
            insert_all_before(element,new_paths,finalcallback);
        }
    }
    insert_before(paths[0],finalcallback);
},

/**
 * Used for inserting a CSS stylesheet into the header
 *
 * @alias LOADER~insert_css
 * @param {string} path - the path to the stylesheet location
 */
insert_css:function(path) {
    var head = document.getElementsByTagName('head')[0];
    var setString = head.innerHTML + "<link rel='stylesheet' href ='" + path;
    if (CONFIG["non-cacheing"] == 1) {
        setString += ("?v=" + Math.random());
    }
    setString += "'>";
    head.innerHTML = setString;
},

loaded_scripts:{},

current_callback:function(){}

}
