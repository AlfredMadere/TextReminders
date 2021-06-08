import { listObjects } from "../drivers/awsDriver.js";
import TutoringSession from "../models/TutoringSession.js";
const chong = "I need to figure out how to not export a random default";
import _ from "lodash";

const queueSessionReminders = async (params) => {
  const bound1 = new Date();
  const bound2 = new Date(startTime.getTime() + 60 * 1000 * params.interval);
  const startTime = bound1 > bound2 ? bound2 : bound1;
  const endTime = bound1 > bound2 ? bound1 : bound2;
  const sessionList = await TutoringSession.getSessionsThat({startTime, endTime}, (event) => {
    return _.inRange(Date.parse(event.start.dateTime), startTime, endTime) && TutoringSession.isTutoringSession(event);
  });
  if (sessionList.length) {
    sessionList.forEach(async (session) => {
      session.sendRemindersToParticipants({
        type: params.reminderType,
        tz: params.timeZone,
      });
    });
  }
};

const queueLogReminders = async (params) => {
  const bound1 = new Date();
  const bound2 = new Date(startTime.getTime() + 60 * 1000 * params.interval);
  const startTime = bound1 > bound2 ? bound2 : bound1;
  const endTime = bound1 > bound2 ? bound1 : bound2;
  const sessionList = await TutoringSession.getSessionsThat({startTime, endTime}, (event) => {
    return _.inRange(Date.parse(event.end.dateTime), startTime, endTime) && TutoringSession.isTutoringSession(event);
  });
  if (sessionList.length) {
    sessionList.forEach(async (session) => {
      let sessionLog = new SessionLog({ session: session });
      sessionLog.remindTutor({type: params.reminderType});
    });
  }
};

export default chong;
export {queueSessionReminders, queueLogReminders};

