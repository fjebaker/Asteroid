"use strict"

var TABS_CONTENT = (function(){

var tabsElem = document.getElementById("tabsDiv");
var selected_tab = TOOLS.QUERIES.getCurrentTabName();

//Useful objects for reference
var disposable_buttons = []; //big
var main_button_group = ""; //medium & small
var sub_button_group = ""; //medium & small

function _mainButtonCallback(key) {
    return function(){
        TABS_CONTENT.closeSubtabs();
        if (selected_tab !== key) {
            TABS_CONTENT.expandSubtab(key);
            selected_tab = key;
        } else {
            selected_tab = false;
        }
    };
}


function _subButtonCallback(key,subkey) {
    return function(){
        TOOLS.QUERIES.virtualRedirect(key,subkey);
    };
}

return {
/**
 * Used to populate the header element depending on what the screen size is
 *
 * @alias TABS_CONTENT~populate
 */
populate:function() {
    var screenSize = MISC_INFO.screen_size;
    if (screenSize != "big") {
        main_button_group = document.createElement("nav");
        sub_button_group = document.createElement("nav");
        main_button_group.className = "main_button_group_"+screenSize;
        sub_button_group.className = "sub_button_group_"+screenSize;
        tabsElem.appendChild(main_button_group);
        tabsElem.appendChild(sub_button_group);
        for (var key in MISC_INFO.tabs_object) {
            TOOLS.appendButton(main_button_group,key,_mainButtonCallback(key),false,"main_tabbar_button_"+screenSize);
        }
    } else {
        for (var key in MISC_INFO.tabs_object) {
            TOOLS.appendButton(tabsElem,key,_mainButtonCallback(key),false,"main_tabbar_button_big");
        }
    }
    if (selected_tab !== false) {
        TABS_CONTENT.expandSubtab(selected_tab);
    }
},

/**
 * Used to clear the header element
 *
 * @alias TABS_CONTENT~clear
 */
clear:function() {
    TABS_CONTENT.closeSubtabs();
    while (tabsElem.firstChild) {tabsElem.removeChild(tabsElem.firstChild);}
},

/**
 * Used to expand out a subtab of a certain name
 *
 * @alias TABS_CONTENT~expandSubtab
 * @param {string} key - the tab whose buttons should be expanded
 */
expandSubtab:function(key) {

    function subtabExpansion() {
        if (MISC_INFO.screen_size == "big") {
            var relevant_element = "";
            var children = tabsElem.children;
            for (var n = 0; n < children.length; n++) {
                var button = children[n];
                if (button.innerHTML == key) {
                    relevant_element = button;
                    break;
                }
            }
            if (relevant_element !== "") {
                var newButtons = MISC_INFO.tabs_object[key];
                for (var n = 0; n < newButtons.length; n++) {
                    relevant_element = TOOLS.insertButton(relevant_element,newButtons[n],_subButtonCallback(key,newButtons[n]),true,"sub_tabbar_button_big");
                    disposable_buttons.push(relevant_element);
                }
            }
        } else {
            var newButtons = MISC_INFO.tabs_object[key];
            for (var n = 0; n < newButtons.length; n++) {
                TOOLS.appendButton(sub_button_group,newButtons[n],_subButtonCallback(key,newButtons[n]),true,"sub_tabbar_button_"+MISC_INFO.screen_size);
            }
        }
    }

    if (key == "Request") {
        LOADER.loadTabScript("Request",subtabExpansion);
    } else {
        subtabExpansion();
    }
},

/**
 * Used to close up open subtabs
 *
 * @alias TABS_CONTENT~closeSubtabs
 */
closeSubtabs:function() {
    if (MISC_INFO.screen_size == "big") {
        for (var n = 0; n < disposable_buttons.length; n++) {
            if (disposable_buttons[n] !== null && disposable_buttons[n].parentNode !== null) {
                disposable_buttons[n].parentNode.removeChild(disposable_buttons[n]);
            }
        }
        disposable_buttons = [];
    } else {
        while (sub_button_group.firstChild) {sub_button_group.removeChild(sub_button_group.firstChild);}
    }
}

};
})();

LOADER.loading_callback();
