"use strict"

var HEADER_CONTENT = (function(){

var headerElem = document.getElementsByTagName("HEADER")[0];

var imageElem = document.createElement("img");
imageElem.src = "/resources/images/asteroid_bubble_BLACK_LEGIT.png";

function _appendHeaderImage(parent,widthstr) {
    imageElem.style.width=widthstr;
    parent.appendChild(imageElem);
}

function _menuButtonCallback() {
    if (MISC_INFO.menu_hidden) {
        TABS_CONTENT.populate();
        MISC_INFO.menu_hidden=false;
    } else {
        TABS_CONTENT.clear();
        MISC_INFO.menu_hidden=true;
    }
}

return {
/**
 * Used to populate the header element depending on what the screen size is
 *
 * @alias HEADER_CONTENT~populate
 */
populate:function() {
    var screenSize = MISC_INFO.screen_size;
    if (screenSize == "big") {
        _appendHeaderImage(headerElem,"50%")
    } else if (screenSize == "medium") {
        _appendHeaderImage(headerElem,"700px")
    } else {
        var parentDiv = document.createElement("div");
        parentDiv.style.display = "table";
        parentDiv.style.width = "100%";
        var menuDiv = document.createElement("div");
        menuDiv.style.width = "35px";
        menuDiv.style.display = "table-cell";
        TOOLS.appendButton(menuDiv,"Menu",_menuButtonCallback,false,"menu_button_small");
        var imgDiv = document.createElement("div");
        imgDiv.style.display = "table-cell";
        _appendHeaderImage(imgDiv,"100%");
        var homeDiv = document.createElement("div");
        homeDiv.style.width = "35px";
        homeDiv.style.display = "table-cell";
        TOOLS.appendButton(homeDiv,"Home",function(){document.location.href="/?v="+Math.random();},false,"home_button_small");
        parentDiv.appendChild(menuDiv);
        parentDiv.appendChild(imgDiv);
        parentDiv.appendChild(homeDiv);
        headerElem.appendChild(parentDiv);
    }
},

/**
 * Used to clear the header element
 *
 * @alias HEADER_CONTENT~clear
 */
clear:function() {
    while (headerElem.firstChild) {headerElem.removeChild(headerElem.firstChild);}
}

};
})();

LOADER.loading_callback();
