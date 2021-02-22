const { google } = require("googleapis");

const { OAuth2 } = google.auth;

const {
  oAuthCred1,
  oAuthCred2,
  refreshToken,
} = require("../credentials/googleCalendar/googleCalendarCredentials");

const oAuth2Client = new OAuth2(oAuthCred1, oAuthCred2);

const waitUntil = require("../util/waitUntil").default;

oAuth2Client.setCredentials({
  refresh_token: refreshToken,
});

const googleCalendar = google.calendar({ version: "v3", auth: oAuth2Client });

let googleDriver = {};

//returns ordered list of events from all calendars selected
function getEvents(params) {
  return Promise.all(
    params.calendarNamePatterns.map((calRegex) => {
      return getCalendarId(calRegex).then((id) => {
        return listEvents(id, "", params.startTime, params.endTime);
      });
    })
  ).then((eventLists) => {
    let bigList = [];
    eventLists.forEach((eventList) => {
      bigList.push(...eventList);
    });
    return bigList.sort((a, b) => {
      return a.start.dateTime.localeCompare(b.start.dateTime);
    });
  });
}

const getCalendarId = async function (calMatch) {
  let calendarList = null;
  googleCalendar.calendarList.list({}, (err, res) => {
    if (err) return console.log("The API returned an error: " + err);
    calendarList = res.data.items;
  });
  await waitUntil(() => {
    return calendarList;
  }, 3000);
  for (let i = 0; i < calendarList.length; i++) {
    let cal = calendarList[i];
    //console.log(cal.summary, cal.id);
    if (cal.summary.match(calMatch)) {
      return Promise.resolve(cal.id);
    }
  }
  return Promise.reject("No matching calendar");
};

//warning you can only call this once
const listEvents = async function (calendarId, query, startTime, endTime) {
  let eventsList = null;
  googleCalendar.events.list(
    {
      calendarId: calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
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

  return Promise.resolve(eventsList);
};

googleDriver.getEvents = getEvents;

module.exports = googleDriver;
