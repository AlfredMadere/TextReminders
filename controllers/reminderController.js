const googleDriver = require("../drivers/googleCalDriver");
const sendText = require("../drivers/twilioDriver");
const TutoringSession = require("../models/TutoringSession");
const sentRemindersCache = require("../lookUpTables/sentReminders.json");
const fs = require("fs");
import moment from "moment-timezone";

let sentReminders = {};

const updateSentReminderCache = (sR) => {
  fs.writeFile(
    "./lookUpTables/sentReminders.json",
    JSON.stringify(sR),
    (err) => {
      if (err) throw err;

      console.log("done writing");
    }
  );
};

const updateSentRemindersFromCache = () => {
  sentReminders = Object.assign({}, sentRemindersCache);
};

const sendMorningReminders = async (tz) => {
  const sessionsToday = await getTodaysSessions();
  sessionsToday.forEach((session) => {
    textParticipantsInTz(session, tz);
  });
  return Promise.resolve(true);
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
    upcommingSessions.forEach((session) => {
      if (!session.student) {
        console.log("null student", session);
      }
      if (!session.tutor) {
        console.log("null tutor", session);
      }
      const parentReminderId = `${session.id}${session.student.parentNumber}${session.startTime}`;
      const studentReminderId =
        session.id + session.student.studentNumber + session.startTime;
      const tutorReminderId =
        session.id + session.student.tutorNumber + session.startTime;
      if (!(tutorReminderId in sentReminders)) {
        sendText({
          number: session.tutor.number,
          message: session.tutorReminderText(),
          attendeeType: "tutor",
          attendee: session.tutor.name,
          type: type,
        });
        sentReminders[tutorReminderId] = 1;
      }
      if (!(studentReminderId in sentReminders)) {
        session.student.studentNumber &&
          sendText({
            number: session.student.studentNumber,
            message: session.studentReminderText(),
            attendeeType: "student",
            attendee: session.student.studentName,
            type: type,
          });
        sentReminders[studentReminderId] = 1;
      }
      if (!(parentReminderId in sentReminders)) {
        sendText({
          number: session.student.parentNumber,
          message: session.studentReminderText(),
          attendeeType: "parent",
          attendee: session.student.parentName,
          type: type,
        });
        sentReminders[parentReminderId] = 1;
      }
      updateSentReminderCache(sentReminders);
    });
  }
};
const textParticipantsInTz = (session, tz) => {
  const type = "morning reminder";
  if (
    moment.tz(session.tutor.timeZone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    sendText({
      number: session.tutor.number,
      message: session.tutorReminderText(),
      attendeeType: "tutor",
      attendee: session.tutor.name,
      type: type,
    });
  } else {
    console.log("tutor not texted");
  }
  if (
    moment.tz(session.student.timeZone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    session.student.studentNumber &&
      sendText({
        number: session.student.studentNumber,
        message: session.studentReminderText(),
        attendeeType: "student",
        attendee: session.student.studentName,
        type: type,
      });
    sendText({
      number: session.student.parentNumber,
      message: session.studentReminderText(),
      attendeeType: "parent",
      attendee: session.student.parentName,
      type: type,
    });
  } else {
    console.log("student and parent not texted");
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
  console.log("Sessions between", sessionsBetween);
  return Promise.resolve(sessionsBetween);
};

const getTodaysSessions = () => {
  const startTime = new Date();
  let endTime = new Date(startTime.getTime() + 60 * 60 * 24 * 1000);
  return getSessionsStartingBetween(startTime, endTime);
};

module.exports = {
  sendMorningReminders,
  sendLastReminder,
  updateSentRemindersFromCache,
};
