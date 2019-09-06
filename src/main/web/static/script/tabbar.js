"use strict"

var TAB_BAR = (function(){

LOADER.loaded_scripts["script/tabbar.js"] = "TAB_BAR";

var tabbarElem = document.getElementById("tabsDiv");

/**
 * Used to add a button into a particular HTML element, expanding to fill if needed
 *
 * @param {Object} elem - the element to add a button into
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 * @param {boolean} expand - whether the button should be animated to expand out
 * @param {string} classstr - the class to assign to the button, or "" if none
 *
 * @returns {Object} button - the DOM object of the button
 */
function generateTabButton(elem, buttonText, callback, expand, classstr) {
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    button.addEventListener("click",callback);
    if (classstr != "") {button.className = classstr;}
    elem.appendChild(button);
    return button;
}

/**
 * Used to add a button after a particular HTML element, expanding to fill if needed
 *
 * @param {Object} elem - the element to add a button after
 * @param {string} buttonText - the text to display on the button
 * @param {buttonCallback} callback - the function to call for the 'click' event for the button
 * @param {boolean} expand - whether the button should be animated to expand out
 * @param {string} classstr - the class to assign to the button, or "" if none
 *
 * @returns {Object} button - the DOM object of the button
 */
function insertTabButton(elem, buttonText, callback, expand, classstr) {
    //NOTE: Expanding is currently nonfunctional
    var button = document.createElement("button");
    button.innerHTML = buttonText; //Setting text
    button.addEventListener("click",callback);
    if (classstr != "") {button.className = classstr;}
    elem.parentNode.insertBefore(button,elem.nextSibling);
    return button;
}

/*
 * The callback for a button click
 * @callback buttonCallback
 */

var tabs_object = {
    Voting:["Queue","Downloaded","Favourites","Playlists"],
    Settings:["Cookies","Tabs"],
    Request:["URL request"]
}

var disposable_buttons = []; //big

var main_button_group = ""; //medium & small
var sub_button_group = ""; //medium & small

var button_holder = ""; //small
var menu_toggle = false; //small

/**
 * Callback function for pressing the 'menu' button in small mode
 */
function menuButtonCallback() {
    if (menu_toggle) {
        menu_toggle = false;
        tabbarElem.removeChild(button_holder);
        var newUrl = TOOLS.QUERIES.updateQuery({menu:"closed"});
        if (newUrl != false) {TOOLS.QUERIES.changeQueryString(newUrl);}
    } else {
        menu_toggle = true;
        tabbarElem.appendChild(button_holder);
        var newUrl = TOOLS.QUERIES.updateQuery({menu:"open"});
        if (newUrl != false) {TOOLS.QUERIES.changeQueryString(newUrl);}
    }
}

/**
 * Convenience function for main button press
 *
 *  @param {string} key - the button key pressed
 */
function mainButtonCallback(key) {
    return function() {
        TAB_BAR.reinsertDisposableButtons(key);
        var newUrl = TOOLS.QUERIES.ensureKeyQuery("mainTab",key);
        if (newUrl != false) {TOOLS.QUERIES.changeQueryString(newUrl);}
    }
}

function subButtonCallback(key,subkey) {
    return function(){
        var mainTabQuery = TOOLS.QUERIES.readKeyQuery("mainTab");
        var newUrl = TOOLS.QUERIES.updateQuery({mainTab:key,subTab:subkey});
        if (newUrl !== false) {
            if (mainTabQuery == key) {
                if (window.TAB_BAR === undefined || window.TAB_BAR.name != key) {
                    document.location.href = newUrl;
                } else {
                    TOOLS.QUERIES.changeQueryString(newUrl);
                    BODY_CONTENT.populateBody();
                }
            } else {
                document.location.href = newUrl;
            }
        }
    }
}

return {
pageSize:"noSize", //changed before using
generateSubtabButton:function(key,buttonName,buttonCallback){
	if (TAB_BAR.pageSize == "big") {
        var relevant_element = "";
        var children = tabbarElem.children;
        for (var n = 0; n < children.length; n++) {
            var button = children[n];
            if (button.innerHTML == key) {
                relevant_element = button;
                break;
            }
        }
        if (relevant_element != "") {
			while (relevant_element.nextSibling !== "null" && relevant_element.nextSibling.classText == "sub_tabbar_button_big") {
				relevant_element = relevant_element.nextSibling;
			}
            relevant_element = insertTabButton(relevant_element,buttonName,buttonCallback,true,"sub_tabbar_button_big");
            disposable_buttons.push(relevant_element);
        }

	} else {
        generateTabButton(sub_button_group,buttonName,buttonCallback,true,"sub_tabbar_button_"+TAB_BAR.pageSize);
	}
},
/**
 * Used to populate the tabs nav element with the required buttons and load in any already-selected scripts
 *
 * @alias TAB_BAR~populateTabbar
 */
populateTabbar:function(){
    if (TAB_BAR.pageSize == "big") {
        var headerElem = document.getElementsByTagName("HEADER")[0];
        if (headerElem.innerHTML == "" || headerElem.firstChild.nodeName == "#text") {
            headerElem.innerHTML = '<img src="/resources/images/asteroid_bubble_BLACK_LEGIT.png" style="width:50%">';
        }
    } else {
        document.getElementsByTagName("HEADER")[0].innerHTML = "";
    }
    while (tabbarElem.firstChild) {tabbarElem.removeChild(tabbarElem.firstChild);}
    disposable_buttons = [];
    if (TAB_BAR.pageSize == "small") {
        button_holder = document.createElement("div");
        button_holder.className = "popup_button_holder_small"
    }
    if (TAB_BAR.pageSize != "big") {
        main_button_group = document.createElement("nav");
        sub_button_group = document.createElement("nav");
        main_button_group.className = "main_button_group_"+TAB_BAR.pageSize;
        sub_button_group.className = "sub_button_group_"+TAB_BAR.pageSize;
        if (TAB_BAR.pageSize == "medium") {
            tabbarElem.appendChild(main_button_group);
            tabbarElem.appendChild(sub_button_group);
        } else {
            button_holder.appendChild(main_button_group);
            button_holder.appendChild(sub_button_group);
            generateTabButton(tabbarElem,"Menu",menuButtonCallback,false,"menu_button_small");
            generateTabButton(tabbarElem,"Home",function(){document.location.href="/?v="+Math.random();},false,"home_button_small");
        }
    }
    for (var key in tabs_object) {
        if (TAB_BAR.pageSize == "big") {
            generateTabButton(tabbarElem,key,mainButtonCallback(key),false,"main_tabbar_button_big");
        } else {
            generateTabButton(main_button_group,key,mainButtonCallback(key),false,"main_tabbar_button_"+TAB_BAR.pageSize);
        }
    }
    const menuOpenQuery = TOOLS.QUERIES.readKeyQuery("menu");
    if (TAB_BAR.pageSize == "small" && menuOpenQuery == 'open') {
        menuButtonCallback();
    }
    var mainTabQuery = TOOLS.QUERIES.readKeyQuery("mainTab");
    if (mainTabQuery !== null) {
        if (tabs_object.hasOwnProperty(mainTabQuery)) {
            TAB_BAR.reinsertDisposableButtons(mainTabQuery);
            //Here, load in a relevant script and do stuff with it
            TOOLS.fillByScreenSize("script/"+mainTabQuery.toLowerCase()+".js",function(){
                BODY_CONTENT.populateBody();
                TAB_BAR.name = mainTabQuery;
            });
        }
    }
},

/**
 * Used to replace the currently active disposable buttons with the ones relevant to a different main tab
 *
 * @alias TAB_BAR~reinsertDisposableButtons
 * @param {string} key - the main tab whose relevant keys should be inserted
 */
reinsertDisposableButtons:function(key){
    //remove current disposable buttons
    if (TAB_BAR.pageSize == "big") {
        for (var n = 0; n < disposable_buttons.length; n++) {
            disposable_buttons[n].parentNode.removeChild(disposable_buttons[n]);
        }
        disposable_buttons = [];
        var relevant_element = "";
        var children = tabbarElem.children;
        for (var n = 0; n < children.length; n++) {
            var button = children[n];
            if (button.innerHTML == key) {
                relevant_element = button;
                break;
            }
        }
        if (relevant_element != "") {
            var newbutts = tabs_object[key];
            for (var n = 0; n < newbutts.length; n++) {
                relevant_element = insertTabButton(relevant_element,newbutts[n],subButtonCallback(key,newbutts[n]),true,"sub_tabbar_button_big");
                disposable_buttons.push(relevant_element);
            }
        }
    } else {
        while (sub_button_group.firstChild) {sub_button_group.removeChild(sub_button_group.firstChild);}
        var newbutts = tabs_object[key];
        for (var n=0; n < newbutts.length; n++) {
            generateTabButton(sub_button_group,newbutts[n],subButtonCallback(key,newbutts[n]),true,"sub_tabbar_button_"+TAB_BAR.pageSize);
        }
    }
},

name:""

}

})();

LOADER.current_callback();
