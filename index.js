const {google} = require('googleapis');

const {OAuth2} = google.auth;

const oAuth2Client = new OAuth2('286187659171-8lsogbilkvskbk0aojikls0ml28r7n2e.apps.googleusercontent.com', 'ValmFXd__39RdlBcIGQPPrJd');

const {listEvents} = require('./listEvents');
const {calendarIds, getCalendarId} = require('./calendars');
const printEvents = require("./printEvents").default;
const getWeeklyTutorAvailability = require('./getTutorAvailability').default;


oAuth2Client.setCredentials({
    refresh_token: '1//04GH7dnAYumD5CgYIARAAGAQSNwF-L9Irf239SgxhBrkflGAfsFMpkD1k2_-bYhDfVFJlP0-5ofRUDCmlQF_ZIokJi9jbtM0RmrU'
});

const calendar = google.calendar({version: 'v3', auth: oAuth2Client});

getWeeklyTutorAvailability(/^Ivy Advantage Corporate/i, calendar);

/*
getCalendarId(/^Marcus.*Committal/i, calendar)
.then(id => {
  listEvents(calendar, id, "Lily")
  .then((events) => printEvents(events))
  .catch(err => console.log(err))
})
.catch(err => console.log(err));
*/



/*for(let i = 7;i<15;i++){
    createEvent(new Date(2021, 0, i, 12, 30, 0, 0), 1.5, 'summary', 'description', 'location', 'America/Chicago');

}*/