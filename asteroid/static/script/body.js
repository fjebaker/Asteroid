"use strict"

var BODY_CONTENT = (function(){

var bodyDiv = document.getElementById("bodyDiv");

return {
/**
 * Used to populate the body element depending on what the screen size is
 *
 * @alias BODY_CONTENT~populate
 */
populate:function() {
    BODY_CONTENT.appendText("No tab currently open! Use the tab buttons to redirect!")
},

/**
 * Used to clear the body element
 *
 * @alias BODY_CONTENT~clear
 */
clear:function() {
    while (bodyDiv.firstChild) {bodyDiv.removeChild(bodyDiv.firstChild);}
},

/**
 * Used to append a node to the body element
 *
 * @alias BODY_CONTENT~appendNode
 * @param {Object} elem - the node to append
 */
appendNode:function(elem) {
    bodyDiv.appendChild(elem);
},

/**
 * Used to append text to the body element
 *
 * @alias BODY_CONTENT~appendText
 * @param {string} text - the text to append
 */
appendText:function(text,kind) {
    if (kind === undefined) {
        var node = document.createTextNode(text);
        bodyDiv.appendChild(node);
    } else {
        var node = document.createElement(kind);
        node.innerText = text;
        bodyDiv.appendChild(node);
    }
},

/**
 * Used to append a break to the body element
 *
 * @alias BODY_CONTENT~appendBreak
 */
appendBreak:function() {
    var node = document.createElement("br");
    bodyDiv.appendChild(node);
}


};
})();

LOADER.loading_callback();
