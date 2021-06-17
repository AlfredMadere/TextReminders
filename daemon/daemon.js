import cj from "cron";
const CronJob = cj.CronJob;
import usTimeZones from "../lookUpTables/usTimeZones.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import TutoringSession from "../models/TutoringSession.js";
import Reminder from "../models/Reminder.js";
import SessionLog from "../models/SessionLog.js";
import getSessionInfo from "../controllers/loggerController.js";
import {
  queueLogReminders,
  queueSessionReminders,
} from "../controllers/reminderController.js";
import S3LogCache from "../models/S3LogCache.js";
import getLogInfo from "../controllers/loggerController.js";

const INTERVAL = {
  day: 60 * 18,
  leadTime: process.env.REMINDER_LEAD_TIME || 30,
  logLatency: -50,
};

const timeZone = "America/Chicago";
Promise.all([
  Tutor.populateCache(),
  Student.populateCache(),
  Reminder.populateSentReminderCacheFromStore(),
  S3LogCache.initSingleton(),
])
  .then(() => {
    if (!(process.env.NODE_ENV === "production")) {
      queueLogReminders({
        withinPeriod: INTERVAL.logLatency,
        reminderType: "immediateLogReminder",
      });
      queueSessionReminders({
        withinPeriod: INTERVAL.leadTime,
        reminderType: "lastCall",
      });
      queueSessionReminders({
        withinPeriod: INTERVAL.day,
        reminderType: "sessionToday",
        timeZone: timeZone,
      });
      getLogInfo("3vt83p6vho51dq0t5coqmcs413");
    }

    const attendeeCacheUpdater = new CronJob(
      "0 1 * * *",
      () => {
        Tutor.populateCache();
        Student.populateCache();
      },
      null,
      true,
      timeZone
    );
    attendeeCacheUpdater.start();

    usTimeZones.forEach((tz) => {
      const sessionTodayRemindersProcess = new CronJob(
        "0 9 * * *",
        () => {
          TutoringSession.queueReminders({
            reminderType: "sessionToday",
            timeZone: tz,
            withinPeriod: INTERVAL.day,
          });
        },
        null,
        true,
        tz
      );
      sessionTodayRemindersProcess.start();
    });

    const lastCallRemindersProcess = new CronJob(
      "*/10 * * * *",
      () => {
        TutoringSession.queueReminders({
          reminderType: "lastCall",
          withinPeriod: INTERVAL.leadTime,
        });
      },
      null,
      true,
      timeZone
    );
    lastCallRemindersProcess.start();
    //--------------------------------------------------------
    /*

log reminder Cron job
call queue reminders
 reminder type = logReminder
 withinPeriod = retractionTime
 


 















*/
    //session log reminder process
    //TutoringSession.queueReminders({reminderType: "logReminder", withinPeriod: INTERVAL.leadTime})
  })
  .then(Reminder.updateSentReminderStoreIfStale);
