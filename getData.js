addEvents();

/**
 * getElementByXpath - Gets the information from an xpath.
 *
 * @param  {string} path   the xpath.
 * @return {string}        the information.
 */
function getElementByXpath(path) {

  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


/**
 * getData - Returns all the data from the table and appends it to a nested array.
 * The array contains per hour a list with the lessons and hours.
 *
 * @return {array}  Array containing all of the data from the table.
 */
function getData() {
  let table = getElementByXpath("/html/body/table/tbody/tr[2]/td/table");
  if (!table) {
    alert("Kies een week!");
    return [];
  }
  let rowLength = table.rows.length;
  allData = []
  for (let i = 1; i < rowLength; i++) {
    let data = []
    let cells = table.rows.item(i).cells;
    let cellLength = cells.length;
    for (let j = 1; j < cellLength; j++) {
      let cellValue = cells.item(j).innerHTML;
      data.push(cellValue);
    }
    allData.push(data);
  }
  console.log(allData);
  return allData;
}


/**
 * createEvent - Returns an Google Calendar event.
 *
 * @param  {string} summary   The lesson.
 * @param  {string} startDate The start date of the lesson.
 * @param  {string} endDate   The end date of the lesson.
 * @return {json}             An event
 */
function createEvent(summary, startDate, endDate, classroom) {
  return {
    "summary": summary,
    "location": classroom,
    "start": {
      "dateTime": startDate,
      "timeZone": "Europe/Amsterdam"
    },
    "end": {
      "dateTime": endDate,
      "timeZone": "Europe/Amsterdam"
    },
  }
}


/**
 * getWeekDays - Returns the weekdays from a given date.
 *
 * @param  {string} currentDate The date of wich the weekdays should be returned.
 * @return {json}               JSON object containing the days with an index,
 *                              index is the same as the lesson in the table
 */
function getWeekDays(currentDate) {
  let week = {};
  currentDate.setDate((currentDate.getDate() - currentDate.getDay() + 2));
  for (let i = 1; i < 6; i++) {
    week[i] = new Date(currentDate).toISOString().split("T")[0]
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return week;
}


/**
 * getSelectedValue - Returns the selected item of a dropdown menu.
 *
 * @return {string}  selected item of dropdown menu.
 */
function getSelectedValue() {
  let items = getElementByXpath("//*[@id=\"StartWeek\"]");
  let selectedItem = items.options[items.selectedIndex].value;
  return selectedItem;
}


/**
 * addEvents - Adds events to a array and returns array.
 *
 * @return {array}  Array containing events.
 */
function addEvents() {
  let dates = getWeekDays(new Date(getSelectedValue()));
  let regex = /[A-Z][0-9]\.[0-9]{2}/
  let allData = getData();
  allEvents = [];
  for (let i = 0; i < allData.length; i++) {
    for (let j = 0; j < allData[i].length; j++) {
      if (allData[i][j] !== "") {
        let summary = allData[i][j].split(" ")[0];
        let ind = allData[i].indexOf(allData[i][j]);
        if (dates[ind] && summary !== "&nbsp;") {
          if (allData[i][0] === "&nbsp;") {
            alert("Check lestijden checkbox pls..")
            return;
          } else {
            let classroom = ""
            if (allData[i][j] !== "&nbsp;") {
              classroom = allData[i][j].match(regex)[0]
            }
            let startDate = dates[ind] + "T" + allData[i][0] + ":00";
            let endDate = dates[ind] + "T" + allData[i + 1][0] + ":00";
            let event = createEvent(summary, startDate, endDate, classroom);
            allEvents.push(event);
          }
        }
      }
    }
  }
  console.log(allEvents);
  return allEvents;
}
