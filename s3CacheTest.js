import _ from "lodash";
import SessionLog from "./models/SessionLog.js";
import TutoringSession from "./models/TutoringSession.js";
import Tutor from "./models/Tutor.js";
import Student from "./models/Student.js";
import Reminder from "./models/Reminder.js";
import S3LogCache from "./models/S3LogCache.js";

const queueLogReminders = async (params) => {
  const bound1 = new Date();
  const bound2 = new Date(bound1.getTime() + 60 * 1000 * params.interval);
  const startTime = bound1 > bound2 ? bound2 : bound1;
  const endTime = bound1 > bound2 ? bound1 : bound2;
  const sessionList = await TutoringSession.getSessionsThat(
    { startTime, endTime },
    (event) => {
      return (
        _.inRange(Date.parse(event.end.dateTime), startTime, endTime) &&
        TutoringSession.isTutoringSession(event)
      );
    }
  );
  if (sessionList.length) {
    sessionList.forEach(async (session) => {
      let sessionLog = new SessionLog({ session: session });
      await sessionLog.addToS3Cache();
      sessionLog.remindTutor({ type: params.reminderType });
    });
  }
};
Promise.all([
  Tutor.populateCache(),
  Student.populateCache(),
  Reminder.populateSentReminderCacheFromStore(),
  S3LogCache.initSingleton(),
]).then(() => {
  queueLogReminders({ reminderType: "log", interval: 50 });
});
