import cj from "cron";
const CronJob = cj.CronJob;
import usTimeZones from "../lookUpTables/usTimeZones.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import TutoringSession from "../models/TutoringSession.js";
import Reminder from "../models/Reminder.js";

const INTERVAL = {
  day: 60 * 18,
  leadTime: process.env.REMINDER_LEAD_TIME || 30,
};

const timeZone = "America/Chicago";

Promise.all([Tutor.populateCache(), Student.populateCache()])
  .then(() => {
    return Reminder.updateSentRemindersFromCache();
  })
  .then(() => {
    if(!process.env.NODE_ENV === "production"){
      TutoringSession.queueReminders({
        withinPeriod: INTERVAL.leadTime,
        reminderType: "lastCall",
      });
      TutoringSession.queueReminders({
        withinPeriod: INTERVAL.day,
        reminderType: "sessionToday",
        timeZone: timeZone
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
