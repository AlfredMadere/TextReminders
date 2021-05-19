import googleDriver from "../drivers/googleCalDriver.js";
import sendText from "../drivers/twilioDriver.js";
import TutoringSession from "../models/TutoringSession.js";
import uploadToAWS from "../drivers/awsDriver.js";
import { downloadFromAWS } from "../drivers/awsDriver.js";
//import { textReminderCacheKey } from "../quickTests/populateCredentials.js";
import moment from "moment-timezone";
const textReminderCacheKey =
  process.env.NODE_ENV === "production"
    ? "textReminderCache"
    : "textReminderCache_" + process.env.NODE_ENV;
const REMINDER_CACHE_UPDATE_INTERVAL = 5000;
let lastCacheContent;
let sentReminders = {};



//WHAT SHOULD BE IN HERE ---------------------
const sendMorningReminders = (tz) => {
  const sessionsToday = await getTodaysSessions();
  if (sessionsToday.length) {
    sessionsToday.forEach(async (session) => {
      session.sendMorningRemindersToParticipantsInTz(tz);
    });
  }
  return Promise.resolve(true);
}
//--------------------------



const sendAndRecordText = async (params) => {
  switch (params.attendeeType) {
    case "tutor":
      if (params.session.tutor) {
        sendText({
          number: params.session.tutor.number,
          message:
            params.type === "morning reminder"
              ? params.session.tutorReminderText(true)
              : params.session.tutorReminderText(false),
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
            message:
              params.type === "morning reminder"
                ? params.session.studentReminderText(true)
                : params.session.studentReminderText(false),
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
            message:
              params.type === "morning reminder"
                ? params.session.studentReminderText(true)
                : params.session.studentReminderText(false),
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

  const upcommingSessions = await TutoringSession.getSessionsStartingBetween(
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


export default sendMorningReminders;
export {
  sendLastReminder,
  updateSentRemindersFromCache,
  updateSentReminderCacheIfStale,
};
