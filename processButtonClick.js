

/**
 * clickHandler - If button pressed, send message to background.js to execute
 * script to get data from page.
 *
 */
function clickHandler() {
    chrome.runtime.sendMessage({directive: "popup-click"}, function(response) {
        this.close(); // close the popup when the background finishes processing request
    });
}


/**
 * anonymous function - Adds an event listener to button on popup.html.
 */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('addData').addEventListener('click', clickHandler);
})
