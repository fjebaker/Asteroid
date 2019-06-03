function generateTabButton(div, buttonText, callback) {
    var button = document.createElement("button");
    button.innerHTML = buttonText;
    div.appendChild(button);
    button.addEventListener("click",callback);
}

//Inserts script with name scriptName into the page
function includeBodyScript(scriptName) {
    var scriptFiller = document.getElementById("scriptFiller");
    scriptFiller.src = "../script/" + scriptName;
}

function tmpScript() {
    includeBodyScript("testbody.js");
}

//Puts buttons in the tabs section
function supplyTabButtons() {
    var tabsDiv = document.getElementById("tabsDiv");
    generateTabButton(tabsDiv, "Voting", tmpScript);
    generateTabButton(tabsDiv, "Rating", tmpScript);
    generateTabButton(tabsDiv, "Tabs", tmpScript);
    generateTabButton(tabsDiv, "Account", tmpScript);
}
