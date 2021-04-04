//const googleDriver = require("../drivers/googleCalDriver");
import googleDriver from "../drivers/googleCalDriver.js";
//const sendText = require("../drivers/twilioDriver");
import sendText from "../drivers/twilioDriver.js";
//const TutoringSession = require("../models/TutoringSession");
import TutoringSession from "../models/TutoringSession.js";
import uploadToAWS from "../drivers/awsDriver.js";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { textReminderCacheKey } from "../quickTests/populateCredentials.js";
//const sentRemindersCache = require("../lookUpTables/sentReminders.json");
//const fs = require("fs");
import fs from "fs";
import moment from "moment-timezone";

let sentReminders = {};

//Need to get cache working
const updateSentReminderCache = async (sR) => {
  const uploadedTingos = await uploadToAWS(
    JSON.stringify(sR),
    textReminderCacheKey,
    "reminderappcache"
  );
  return uploadedTingos;
};

const updateSentRemindersFromCache = async () => {
  //i should have a check here to make sure that remindertextcache exists and create it if it doesn't
  const sentRemindersString = await downloadFromAWS(
    textReminderCacheKey,
    "reminderappcache"
  );
  sentReminders = JSON.parse(sentRemindersString);
  return sentReminders;
};

const sendMorningReminders = async (tz) => {
  const sessionsToday = await getTodaysSessions();
  sessionsToday.forEach((session) => {
    textParticipantsInTz(session, tz);
  });
  return Promise.resolve(true);
};

const sendAndRecordText = (params) => {
  sendText({
    number:
      params.attendeeType === "tutor"
        ? params.session.tutor.number
        : params.attendeeType === "student"
        ? params.session.student.studentNumber
        : params.attendeeType === "parent"
        ? params.session.student.parentNumber
        : "fuck",
    message:
      params.attendeeType === "tutor"
        ? params.session.tutorReminderText()
        : params.session.studentReminderText(),
    attendeeType: params.attendeeType,
    attendee:
      params.attendeeType === "tutor"
        ? params.session.tutor.name
        : params.attendeeType === "student"
        ? params.session.student.studentName
        : params.attendeeType === "parent"
        ? params.session.student.parentName
        : "fuck",
    type: params.type,
  });
  sentReminders[params.reminderId] = 1;
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
      if (!session.student) {
        console.log("null student", session);
        throw "null student";
      }
      if (!session.tutor) {
        console.log("null tutor", session);
        throw "null tutor";
      }
      const parentReminderId = `${session.id}${session.student.parentNumber}${session.startTime}`;
      const studentReminderId =
        session.id + session.student.studentNumber + session.startTime;
      const tutorReminderId =
        session.id +
        session.tutor.number +
        session.startTime +
        session.tutor.name;
      if (!(tutorReminderId in sentReminders)) {
        sendAndRecordText({
          session: session,
          attendeeType: "tutor",
          type: type,
          reminderId: tutorReminderId,
        });
      }
      if (!(studentReminderId in sentReminders)) {
        session.student.studentNumber &&
          sendAndRecordText({
            session: session,
            attendeeType: "student",
            type: type,
            reminderId: studentReminderId,
          });
      }
      if (!(parentReminderId in sentReminders)) {
        session.student.parentNumber &&
          sendAndRecordText({
            session: session,
            attendeeType: "parent",
            type: type,
            reminderId: parentReminderId,
          });
      }
      const updatedReminders = await updateSentReminderCache(sentReminders);
      return updatedReminders;
    });
  }
};

const textParticipantsInTz = (session, tz) => {
  const type = "morning reminder";
  if (
    moment.tz(session.tutor.timezone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    sendText({
      number: session.tutor.number,
      message: session.tutorReminderText(true),
      attendeeType: "tutor",
      attendee: session.tutor.name,
      type: type,
    });
  } else {
    console.log(
      `tutor ${session.tutor.name} not texted for ${session.student.studentName}'s session. Recipient timezone: ${session.tutor.timezone} input timezone: ${tz}`
    );
  }
  if (
    moment.tz(session.student.timezone).utcOffset() == moment.tz(tz).utcOffset()
  ) {
    session.student.studentNumber &&
      sendText({
        number: session.student.studentNumber,
        message: session.studentReminderText(true),
        attendeeType: "student",
        attendee: session.student.studentName,
        type: type,
      });
    sendText({
      number: session.student.parentNumber,
      message: session.studentReminderText(true),
      attendeeType: "parent",
      attendee: session.student.parentName,
      type: type,
    });
  } else {
    console.log(
      `student ${session.student.studentName} and parent ${session.student.parentName} not texted for session with ${session.tutor.name}`
    );
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
export { sendLastReminder, updateSentRemindersFromCache };
