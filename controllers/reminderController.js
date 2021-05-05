import googleDriver from "../drivers/googleCalDriver.js";
import sendText from "../drivers/twilioDriver.js";
import TutoringSession from "../models/TutoringSession.js";
import uploadToAWS from "../drivers/awsDriver.js";
import { downloadFromAWS } from "../drivers/awsDriver.js";
//import { textReminderCacheKey } from "../quickTests/populateCredentials.js";
import moment from "moment-timezone";
const textReminderCacheKey = process.env.NODE_ENV === "production" ? "textReminderCache" : "textReminderCache_" + process.env.NODE_ENV;
const REMINDER_CACHE_UPDATE_INTERVAL = 5000;
let lastCacheContent;
let sentReminders = {};

const updateSentReminderCacheIfStale = async () => {
  let currentCacheContent = JSON.stringify(sentReminders);
  if(!(lastCacheContent === currentCacheContent)){
    console.log("updating aws");
    const uploadedTingos = await uploadToAWS(
      currentCacheContent,
      textReminderCacheKey,
      "reminderappcache"
    );
    lastCacheContent = currentCacheContent;
    return uploadedTingos;
  }
  setTimeout(updateSentReminderCacheIfStale, REMINDER_CACHE_UPDATE_INTERVAL);
};

const updateSentRemindersFromCache = async () => {
  //i should have a check here to make sure that remindertextcache exists and create it if it doesn't
  const sentRemindersString = await downloadFromAWS(
    textReminderCacheKey,
    "reminderappcache"
  );
  sentReminders = JSON.parse(sentRemindersString);
  lastCacheContent = sentRemindersString;
  console.log("updating sent reminders from cache", sentRemindersString.length);
  return sentReminders;
};

const sendMorningReminders = async (tz) => {
  const sessionsToday = await getTodaysSessions();
  if (sessionsToday.length) {
    sessionsToday.forEach(async (session) => {
      textParticipantsInTz(session, tz);
    });
  }
  return Promise.resolve(true);
};

const sendAndRecordText = async (params) => {
  switch (params.attendeeType) {
    case "tutor":
      if (params.session.tutor) {
        sendText({
          number: params.session.tutor.number,
          message: params.type === "morning reminder" ? params.session.tutorReminderText(true) : params.session.tutorReminderText(false),
          attendeeType: params.attendeeType,
          attendee: params.session.tutor.name,
          type: params.type,
          calendar: params.session.calendar,
        });
      } else {
        sendNoParticipantErrorText({
          participant: "tutor",
          session: params.session,
        });
      }
      break;
    case "student":
      if (params.session.student) {
        params.session.student.studentNumber &&
          sendText({
            number: params.session.student.studentNumber,
            message: params.type === "morning reminder" ? params.session.studentReminderText(true) : params.session.studentReminderText(false),
            attendeeType: params.attendeeType,
            attendee: params.session.student.studentName,
            type: params.type,
            calendar: params.session.calendar,
          });
      } else {
        sendNoParticipantErrorText({
          participant: "student",
          session: params.session,
        });
      }
      break;
    case "parent":
      if (params.session.student) {
        params.session.student.parentNumber &&
          sendText({
            number: params.session.student.parentNumber,
            message: params.type === "morning reminder" ? params.session.studentReminderText(true) : params.session.studentReminderText(false),
            attendeeType: params.attendeeType,
            attendee: params.session.student.parentName,
            type: params.type,
            calendar: params.session.calendar,
          });
      } else {
        sendNoParticipantErrorText({
          participant: "student",
          session: params.session,
        });
      }
      break;
    default:
      console.log(
        "things are broken because attendee type is ",
        params.attendeeType
      );
  }
  sentReminders[params.reminderId] = 1;
};

const sendNoParticipantErrorText = (params) => {
  sendText({
    number: 5122990497,
    message: `null ${params.participant} for ${params.session.summary}`,
    calendar: params.session.calendar,
    type: "error handling",
  });
};
const sendLastReminder = async (params) => {
  const type = "last reminder";
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + params.leadTime * 60 * 1000);

  const upcommingSessions = await getSessionsStartingBetween(
    startTime,
    endTime
  );
  if (upcommingSessions.length) {
    upcommingSessions.forEach(async (session) => {
      let parentReminderId = null;
      let studentReminderId = null;
      let tutorReminderId = null;
      if (session.student) {
        studentReminderId =
          session.id + session.student.studentNumber + session.startTime;
          parentReminderId = `${session.id}${session.student.parentNumber}${session.startTime}`;
      } else {
        studentReminderId = session.id + session.startTime + "NULL_STUDENT";
        parentReminderId = session.id + session.startTime + "NULL_STUDENT";
      }
      if (session.tutor) {
        tutorReminderId =
          session.id +
          session.tutor.number +
          session.startTime +
          session.tutor.name;
      } else {
        tutorReminderId = session.id + session.startTime + "NULL_TUTOR";
      }

      if (!(tutorReminderId in sentReminders)) {
        sendAndRecordText({
          session: session,
          attendeeType: "tutor",
          type: type,
          reminderId: tutorReminderId,
        });
      }
      if (!(studentReminderId in sentReminders)) {
        sendAndRecordText({
          session: session,
          attendeeType: "student",
          type: type,
          reminderId: studentReminderId,
        });
      }
      if (!(parentReminderId in sentReminders)) {
        sendAndRecordText({
          session: session,
          attendeeType: "parent",
          type: type,
          reminderId: parentReminderId,
        });
      }
    });
  }
};

const textParticipantsInTz = (session, tz) => {
  const type = "morning reminder";
  let parentReminderId = null;
  let studentReminderId = null;
  let tutorReminderId = null;
  if (session.student) {
    studentReminderId =
      session.id + session.student.studentNumber + session.startTime + type;
      parentReminderId = `${session.id}${session.student.parentNumber}${session.startTime}${type}`;
      if (
        moment.tz(session.student.timezone).utcOffset() == moment.tz(tz).utcOffset()
      ) {
        if(!(studentReminderId in sentReminders)){
          sendAndRecordText({
            session: session,
            attendeeType: "student",
            type: type,
            reminderId: studentReminderId,
          });
        }
        if(!(parentReminderId in sentReminders)){
          sendAndRecordText({
            session: session,
            attendeeType: "parent",
            type: type,
            reminderId: parentReminderId,
          });
        }
      } else {
        console.log(
          `tutor ${session.tutor.name} not texted for ${
            session.student ? session.student.studentName : "undefined student"
          }'s session. Recipient timezone: ${
            session.tutor.timezone
          } input timezone: ${tz}`
        );
      }
  } else {
    studentReminderId = session.id + session.startTime + "NULL_STUDENT";
    parentReminderId = session.id + session.startTime + "NULL_STUDENT";
    if(!(studentReminderId in sentReminders)){
      sendAndRecordText({
        session: session,
        attendeeType: "student",
        type: type,
        reminderId: studentReminderId
      });
    }
  }
  if (session.tutor) {
    tutorReminderId =
      session.id +
      session.tutor.number +
      session.startTime +
      session.tutor.name + type;
      if (
        moment.tz(session.tutor.timezone).utcOffset() == moment.tz(tz).utcOffset()
      ) {
        if(!(tutorReminderId in sentReminders)){
          sendAndRecordText({
            session: session,
            attendeeType: "tutor",
            type: type,
            reminderId: tutorReminderId,
          });
        }
      } else {
        console.log(
          `tutor ${session.tutor.name} not texted for ${
            session.student ? session.student.studentName : "undefined student"
          }'s session. Recipient timezone: ${
            session.tutor.timezone
          } input timezone: ${tz}`
        );
      }
  } else {
    tutorReminderId = session.id + session.startTime + "NULL_TUTOR";
    if(!(tutorReminderId in sentReminders)){
      sendAndRecordText({
        session: session,
        attendeeType: "tutor",
        type: type,
        reminderId: tutorReminderId
      });
    }
  }
  

};

const getSessionsStartingBetween = async (startTime, endTime) => {
  const rawEventList = await googleDriver.getEvents({
    calendarNamePatterns: [
      /^Host one/i,
      /^Host two/i,
      /^Host three/i,
      /^Ivy Advantage Corporate/i,
      /^Api tester/i,
    ],
    startTime: startTime,
    endTime: endTime,
  });
  const sessionsBetween = rawEventList
    .filter((x) => {
      return Date.parse(x.start.dateTime) > startTime.getTime();
    })
    .map((event) => {
      return new TutoringSession(event);
    });
  return Promise.resolve(sessionsBetween);
};

const getTodaysSessions = () => {
  const startTime = new Date();
  let endTime = new Date(startTime.getTime() + 60 * 60 * 18 * 1000);
  return getSessionsStartingBetween(startTime, endTime);
};

export default sendMorningReminders;
export { sendLastReminder, updateSentRemindersFromCache, updateSentReminderCacheIfStale};
