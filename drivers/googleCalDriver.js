import { google } from "googleapis";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { googleCalCredentialsKey } from "../quickTests/populateCredentials.js";

const { OAuth2 } = google.auth;

let googleCalendar = null;
let googleCalDriver = {};
let googleCalCredentials = null;

const getGoogleCalCredentials = async () => {
  googleCalCredentials ||= await downloadFromAWS(
    googleCalCredentialsKey,
    "apicredentials"
  );
  return googleCalCredentials;
};

const getGoogleCal = async () => {
  if (!googleCalendar) {
    try {
      googleCalCredentials ||= await getGoogleCalCredentials();
      const oAuth2Client = new OAuth2(
        googleCalCredentials.clientId,
        googleCalCredentials.clientSecret
      );
      oAuth2Client.setCredentials({
        refresh_token: googleCalCredentials.refreshToken,
      });
      googleCalendar = google.calendar({ version: "v3", auth: oAuth2Client });
    } catch (e) {
      throw new Error(e);
    }
  }
  return googleCalendar;
};

//returns ordered list of events from all calendars selected
function getEvents(params) {
  return Promise.all(
    params.calendarNamePatterns.map((calRegex) => {
      return getCalendarId(calRegex).then((id) => {
        const events = listEvents(id, "", params.startTime, params.endTime);
        return events;
      });
    })
  )
    .then((eventLists) => {
      let bigList = [];
      eventLists.forEach((eventList) => {
        bigList.push(...eventList);
      });
      return bigList.sort((a, b) => {
        return a.start.dateTime.localeCompare(b.start.dateTime);
      });
    })
    .catch((err) =>
      console.log(`ERROR: ${err} issue getting events for: ${params}`)
    );
}

const getCalendarId = async function (calMatch) {
  return getGoogleCal()
    .then((gCal) => {
      let p = new Promise((resolve, reject) => {
        gCal.calendarList.list({}, (err, res) => {
          if (err) reject("The API returned an error: " + err);
          else resolve(res.data.items);
        });
      });
      return p;
    })
    .then((calList) => {
      return findFirstMatchingSummary(calList, calMatch);
    })
    .catch((err) => console.log(err));
};

const findFirstMatchingSummary = (list, pattern) => {
  for (let i = 0; i < list.length; i++) {
    let cal = list[i];
    if (cal.summary.match(pattern)) {
      return cal.id;
    }
  }
  throw new Error("didn't find any calendars matching: " + pattern);
};

//warning you can only call this once
const listEvents = async function (calendarId, query, startTime, endTime) {
  return getGoogleCal()
    .then((gCal) => {
      let p = new Promise((resolve, reject) => {
        gCal.events.list(
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
            if (err) reject("The API returned an error: " + err);
            else resolve(res.data.items);
          }
        );
      });
      return p;
    })
    .catch((err) => console.log(err));
};

googleCalDriver.getEvents = getEvents;

export default googleCalDriver;
