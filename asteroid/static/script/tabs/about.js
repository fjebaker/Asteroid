"use strict"

var ABOUT = (function(){
return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "Cookie Policy") {
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("In registering an account on this Asteroid server, the user agrees to the storing of the following non-tracking cookies on their device:");
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("id : an authentication string for your account that lets the browser know that you are logged into a valid account.");
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("cookieDuration : a string holding information about how long these cookies, and the users account information, will be stored.");
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Whilst these cookies are necessary to registering an account, a registered user may instantly deregister their account, or modify the duration after which their account will expire, by going to Settings - Account. When a temporary account expires or is deregistered, all stored cookies and information stored on the server will be deleted. When a permanent, password-protected account expires, all stored cookies will be deleted, but all information stored on the server will be retained. Whilst the predominant features of this server are inaccessible without registering an account, the user is under no obligation to register an account.");
    } else if (subtab === "Credits") {
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("TODO: put credits here");
    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
}
};
})();

LOADER.tab_scripts["About"] = ABOUT
LOADER.loading_callback();
