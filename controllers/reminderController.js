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
const getTodaysSessions = async () => {
  const startTime = new Date();
  const rawEventList = await googleDriver.getEvents({
    calendarNamePatterns: [
      /^Host one/i,
      /^Host two/i,
      /^Host three/i,
      /^Ivy Advantage Corporate/i,
      /^Api tester/i,
    ],
    startTime: startTime,
    endTime: new Date(startTime.getTime() + 60 * 60 * 24 * 1000),
  });
  const sessionsToday = rawEventList.map((event) => {
    return new TutoringSession(event);
  });
  return Promise.resolve(sessionsToday);
};

module.exports = sendMorningReminders;
