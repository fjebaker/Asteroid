"use strict"

var REQUEST = (function(){
return {
populateBody:function(){
    BODY_CONTENT.appendText("Request");
}
};
})();

LOADER.tab_scripts["Request"] = REQUEST //Capitalised
LOADER.loading_callback();
