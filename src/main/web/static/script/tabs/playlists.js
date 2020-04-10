"use strict"

var PLAYLISTS = (function(){

var playlist_table = "";

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "View Playlists") {
        playlist_table = document.createElement("table");
        
    } else if (subtab === "Add Playlist") {
    }
},

playlistNames:PLAYLISTS.playlistNames,

playlistData:PLAYLISTS.playlistData
};
})();

LOADER.tab_scripts["Playlists"] = PLAYLISTS //Capitalised
LOADER.loading_callback();
