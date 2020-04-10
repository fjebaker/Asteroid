"use strict"

var SETTINGS = (function(){

var cookie_duration_selector = "";
var tab_setting_table = "";
var col_setting_table = "";
var fav_setting_table = "";

//Needs to be read from cookies
var default_time_key = "hour"

function _selectCookieDuration() {
    var value = cookie_duration_selector.value;
    TOOLS.AUTH.updateAccountDuration(value);
}

function _toggleTabSettingButton(key,button) {
    return function(){
        SETTINGS.tabsOpenSettings[key] = button.checked ? 1 : 0;
    };
}

function _toggleColSettingButton(key,button) {
    return function(){
        SETTINGS.showColumnArray[key] = button.checked ? 1 : 0;
    };
}

function _toggleFavSettingButton(key,button) {
    return function(){
        SETTINGS.autoFaveSettings[key] = button.checked ? 1 : 0;
    };
}

return {
populateBody:function(){
    var subtab = TOOLS.QUERIES.getCurrentSubtabName();
    if (subtab === "Tabs") {
        BODY_CONTENT.appendText("Non-essential Tab Visibility:",'b');
        BODY_CONTENT.appendBreak();
        tab_setting_table = document.createElement("table");
        for (var key in SETTINGS.tabsOpenSettings) {
            if (SETTINGS.tabsOpenSettings.hasOwnProperty(key)) {
                var newRow = tab_setting_table.insertRow(-1);
                var nameCell = newRow.insertCell(0);
                var buttonCell = newRow.insertCell(1);
                nameCell.innerText = key || "";
                var newButton = document.createElement("input");
                newButton.type = "checkbox";
                if (SETTINGS.tabsOpenSettings[key] == 1) {
                    newButton.checked = true;
                }
                newButton.addEventListener("click",_toggleTabSettingButton(key,newButton));
                buttonCell.appendChild(newButton);
            }
        }
        BODY_CONTENT.appendNode(tab_setting_table);
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Non-essential Column Visibility:",'b');
        BODY_CONTENT.appendBreak();
        col_setting_table = document.createElement("table");
        for (var key in SETTINGS.showColumnArray) {
            if (SETTINGS.showColumnArray.hasOwnProperty(key)) {
                var newRow = col_setting_table.insertRow(-1);
                var nameCell = newRow.insertCell(0);
                var buttonCell = newRow.insertCell(1);
                nameCell.innerText = key || "";
                var newButton = document.createElement("input");
                newButton.type = "checkbox";
                if (SETTINGS.showColumnArray[key] == 1) {
                    newButton.checked = true;
                }
                newButton.addEventListener("click",_toggleColSettingButton(key,newButton));
                buttonCell.appendChild(newButton);
            }
        }
        BODY_CONTENT.appendNode(col_setting_table);
    } else if (subtab === "Account") {
        BODY_CONTENT.appendText("Account/Cookie Duration:",'b');
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("For information on cookies, go to About - Cookie Policy")
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Expiration time for account and basic cookies:");
        cookie_duration_selector = document.createElement("select");
        cookie_duration_selector.onchange = _selectCookieDuration;
        var keys = {minute:"One Minute",hour:"One Hour",day:"One Day",week:"One Week",month:"One Month",year:"One Year"};
        for (var key in keys) {
            if (keys.hasOwnProperty(key)) {
                var option = document.createElement("option");
                option.value = key;
                option.text = keys[key];
                if (key == default_time_key) {
                    option.selected = true;
                }
                cookie_duration_selector.add(option);
            }
        }
        BODY_CONTENT.appendNode(cookie_duration_selector);
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendBreak();
        BODY_CONTENT.appendText("Automatic Favouriting:",'b');
        BODY_CONTENT.appendBreak();
        fav_setting_table = document.createElement("table");
        for (var key in SETTINGS.autoFaveSettings) {
            if (SETTINGS.autoFaveSettings.hasOwnProperty(key)) {
                var newRow = fav_setting_table.insertRow(-1);
                var nameCell = newRow.insertCell(0);
                var buttonCell = newRow.insertCell(1);
                nameCell.innerText = key || "";
                var newButton = document.createElement("input");
                newButton.type = "checkbox";
                if (SETTINGS.autoFaveSettings[key] == 1) {
                    newButton.checked = true;
                }
                newButton.addEventListener("click",_toggleFavSettingButton(key,newButton));
                buttonCell.appendChild(newButton);
            }
        }
        BODY_CONTENT.appendNode(fav_setting_table);
    } else {
        BODY_CONTENT.appendText("Press a subtab button to open a subtab!");
    }
}
};
})();

LOADER.tab_scripts["Settings"] = SETTINGS //Capitalised

TOOLS.populateSettings(LOADER.loading_callback);
