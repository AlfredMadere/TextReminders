const waitUntil = require("./util/waitUntil").default;

let eventsList = null;
exports.listEvents = async function (calendar, calendarId, query) {
  if (!eventsList) {
    calendar.events.list(
      {
        calendarId: calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 20,
        singleEvents: true,
        orderBy: "startTime",
        q: query,
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        eventsList = res.data.items;
      }
    );
    await waitUntil(() => {
      return eventsList;
    }, 10000);
  }
  console.log(eventsList);

  return eventsList.length
    ? Promise.resolve(eventsList)
    : Promise.reject("did not find any events matching query");
};
