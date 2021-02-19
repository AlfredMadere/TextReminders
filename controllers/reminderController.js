const googleDriver = require("../drivers/googleCalDriver");
const sendText = require("../drivers/sendClickDriver");
const TutoringSession = require("../models/TutoringSession");
import moment from "moment-timezone";
moment().tz("America/Los_Angeles").format();

const sendMorningReminders = async (tz) => {
  const sessionsToday = await getTodaysSessions();
  sessionsToday.forEach((session) => {
    textParticipantsInTz(session, tz);
  });
  return Promise.resolve(true);
};

const sendLastReminder = async (params) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + params.leadTime * 60 * 1000);
  const upcommingSessions = await getSessionsBetween(startTime, endTime);
  if (upcommingSessions.length) {
    upcommingSessions.forEach((session) => {
      sendText({
        number: session.tutor.tutorNumber,
        message: session.tutorTextReminder(),
        attendeeType: "tutor",
        attendee: session.tutor.tutorName,
      });
      sendText({
        number: session.student.studentNumber,
        message: session.studentTextReminder(),
        attendeeType: "student",
        attendee: session.student.studentName,
      });
      sendText({
        number: session.student.parentNumber,
        message: session.studentTextReminder(),
        attendeeType: "parent",
        attendee: session.student.parentName,
      });
    });
  }
};
const textParticipantsInTz = (session, tz) => {
  if (
    moment.tz(session.tutor.timeZone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    sendText({
      number: session.tutor.tutorNumber,
      message: session.tutorTextReminder(),
      attendeeType: "tutor",
      attendee: session.tutor.tutorName,
    });
  } else {
    console.log("tutor not texted");
  }
  if (
    moment.tz(session.student.timeZone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    sendText({
      number: session.student.studentNumber,
      message: session.studentTextReminder(),
      attendeeType: "student",
      attendee: session.student.studentName,
    });
    sendText({
      number: session.student.parentNumber,
      message: session.studentTextReminder(),
      attendeeType: "parent",
      attendee: session.student.parentName,
    });
  } else {
    console.log("student and parent not texted");
  }
};

const getSessionsBetween = async (startTime, endTime) => {
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
  const sessionsBetween = rawEventList.map((event) => {
    return new TutoringSession(event);
  });
  return Promise.resolve(sessionsBetween);
};

const getTodaysSessions = () => {
  const startTime = new Date();
  let endTime = new Date(startTime.getTime() + 60 * 60 * 24 * 1000);
  return getSessionsBetween(startTime, endTime);
};

module.exports = { sendMorningReminders, sendLastReminder };
