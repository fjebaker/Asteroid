"use strict"

var LOADER = (function(){

/**
 * Loads in a js script specified by the path, and calls a callback once loaded.
 *
 * @param {string} path - the path to the .js script
 * @param {function} callback - the callback to call once successfully loaded
 */
function _load_script(path,callback) {
    LOADER.loading_callback = callback;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = path + "?v=" + Math.random();
    document.body.appendChild(script);
}

/**
 * Loads in a CSS stylesheet to the header
 *
 * @param {string} path - the path to the .css file
 */
function _load_css(path) {
    var head = document.getElementsByTagName('head')[0];
    var css = document.createElement("link");
    css.rel = "stylesheet"
    css.type = "text/css";
    css.href = path + "?v=" + Math.random();
    head.appendChild(css);
}

return {
/**
 * If it is not already loaded, loads in a js tab script specified by the name.
 * Once the script is definitely loaded, sets it as the current script for tabs and body,
 * and then finally calls the callback.
 *
 * @alias LOADER~loadTabScript
 * @param {string} name - the name of the tab script
 * @param {function} callback - the callback to call once successfully loaded
 */
loadTabScript:function(name,callback) {
    var full_callback = function() {
        BODY_CONTENT.populate = function(){LOADER.tab_scripts[name].populateBody();};
        callback();
    }

    if (LOADER.tab_scripts.hasOwnProperty(name)) {
        full_callback();
    } else {
        _load_script("tabs/"+name.toLowerCase()+".js",full_callback);
    }
},

//An object used to check whether a tab script has already been loaded
tab_scripts:{},

//Scripts will call LOADER.loading_callback() once they are completed
loading_callback:function(){
    //This is the script for initialising the home screen

    function current_tab_callback() {
        //Populate the body
        BODY_CONTENT.populate();
    }

    //Called once body.js is loaded in
    function body_callback() {
        //If one exists, load in the screen content for the currently open tab
        var current_tab = TOOLS.QUERIES.getCurrentTabName();
        if (current_tab !== false) {
            LOADER.loadTabScript(current_tab,current_tab_callback);
        } else {
            current_tab_callback();
        }
    }

    //Called once tabs.js is loaded in
    function tabs_callback() {
        //Populate the tabs
        TABS_CONTENT.populate();
        //Get body script
        _load_script("script/body.js",body_callback);
    }

    //Called once header.js is loaded in
    function header_callback() {
        //Populate the header
        HEADER_CONTENT.populate();
        //Get tabs script
        _load_script("script/tabs.js",tabs_callback);
    }

    //Called once the settings have been updated
    function settings_callback() {
        //Get header script
        _load_script("script/header.js",header_callback);
    }

    //Called once tools.js is loaded in
    function tools_callback() {
        //Checks that user authentication is valid
        TOOLS.AUTH.validateAuth();
        //Sets the screen size
        MISC_INFO.screen_size = TOOLS.getScreenSize();
        //Update the settings from default / account info
        TOOLS.populateSettings(settings_callback);
    }

    //Called once jsconfig.js is loaded in
    function jsconfig_callback() {
        //Get the stylesheet in the header
        _load_css("css/home.css");
        //Get the tools
        _load_script("script/tools.js",tools_callback);
    }

    //Starts the callback chain
    _load_script("config/jsconfig.js",jsconfig_callback);
}

};
})();

var MISC_INFO = {
    //An object denoting the valid tabs and what subtabs they have
    tabs_object:{
        Voting:["Queue","Recently Requested","Downloaded","Favourites"],
        Settings:["Account","Tabs"],
        Request:[],
        Playlists:["Public Playlists","My Playlists","Add Playlist"],
        About:["Credits","Cookie Policy"]
    },
    //Current screen size, for reference
    screen_size:"undefined",
    //Whether, in small mode, the menu should be hidden by default
    menu_hidden:false
};

var SETTINGS = {
};

var PLAYLISTS = {
    userPlaylistInfo:{
        "(favourites)":{
            _id:"(favourites)",
            name:"Favourites",
            privacy:"private",
            store_sids:true,
            size:0,
            sid_data:[]
        }
    },
    publicPlaylistInfo:{}
};

LOADER.loading_callback();
