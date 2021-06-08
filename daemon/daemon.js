import cj from "cron";
const CronJob = cj.CronJob;
import usTimeZones from "../lookUpTables/usTimeZones.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import TutoringSession from "../models/TutoringSession.js";
import Reminder from "../models/Reminder.js";
import SessionLog from "../models/SessionLog.js"
import remindTutorsToLog from "../controllers/loggerController.js"
import { queueLogReminders } from "../controllers/reminderController.js";

const INTERVAL = {
  day: 60 * 18,
  leadTime: process.env.REMINDER_LEAD_TIME || 30,
};

const timeZone = "America/Chicago";

Promise.all([Tutor.populateCache(), Student.populateCache(), Reminder.populateSentReminderCacheFromStore(), SessionLog.populateSessionLogCacheFromStore()])
  .then(() => {
    if(!process.env.NODE_ENV === "production"){
      queueSessionReminders({
        withinPeriod: INTERVAL.leadTime,
        reminderType: "lastCall",
      });
      queueSessionReminders({
        withinPeriod: INTERVAL.day,
        reminderType: "sessionToday",
        timeZone: timeZone
      });
      queueLogReminders({
        withinPeriod: INTERVAL.logLatency,
        reminderType: "immediateLogReminder",
      });
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
  .then(Reminder.updateSentReminderCacheIfStale);
