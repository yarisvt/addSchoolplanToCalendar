const API_KEY = 'YOUR_API_KEY';
const CLIENT_ID = 'YOUR_CLIENT_ID';
const SCOPES = 'https://www.googleapis.com/auth/calendar'
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const delay = ms => new Promise(res => setTimeout(res, ms));


/**
 * onGAPILoad - Loads the Google Authenticator API
 *
 */
function onGAPILoad() {
  gapi.client.init({
    // Don't pass client nor scope as these will init auth2, which we don't want
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  }).then(function () {
    console.log('gapi initialized')
    chrome.identity.getAuthToken({
      interactive: true
    }, function (token) {
      gapi.auth.setToken({
        'access_token': token,
      });

    })
  }, function (error) {
    console.log('error', error)
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    switch (request.directive) {
      case "popup-click":
        // execute the content script
        chrome.tabs.executeScript(null, { // defaults to the current tab
          file: "getData.js", // script to inject into page and run in sandbox
          allFrames: true // This injects script into iframes in the page and doesn't work before 4.0.266.0.
        }, receiveItems);
        sendResponse({
          success: true
        }); // sending back empty response to sender
        break;
      default:
        // helps debug when request directive doesn't match
        alert("Unmatched request of '" + request + "' from script to background.js from " + sender);
        break;
    }
  }
);


/**
 * receiveItems - Inserts events to calendar.
 *
 * @param  {array} resultsArray array containing the events.
 */
async function receiveItems(resultsArray) {
  console.log(resultsArray);
  if (resultsArray[0]) {
    for await (let event of resultsArray[0]) {
      let request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });
      await request.execute(event => console.log(`Event created: ${event.htmlLink}`));

      await delay(5000);
      alert("Events aan je google calendar toegevoegd!")
    }
  } else {
    alert('Er is iets mis gegaan.')
  }
}