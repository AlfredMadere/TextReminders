import sendMorningReminders from "../controllers/reminderController.js";
import { sendLastReminder } from "../controllers/reminderController.js";
import cj from "cron";
const CronJob = cj.CronJob;
import usTimeZones from "../lookUpTables/usTimeZones.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import TutoringSession from "../models/TutoringSession.js";
import Reminder from "../models/Reminder.js";


const INTERVAL = {
  day: 60*18,
  leadTime: 20
}


Promise.all([Tutor.populateCache(), Student.populateCache()])
  .then(() => {
    return Reminder.updateSentRemindersFromCache();
  })
  .then(() => {
    TutoringSession.queueReminders({ withinPeriod: INTERVAL.leadTime,
    reminderType: 'lastCall'});

    const attendeeCacheUpdater = new CronJob(
      "0 1 * * *",
      () => {
        Tutor.populateCache();
        Student.populateCache();
      },
      null,
      true,
      "America/Chicago"
    );
    attendeeCacheUpdater.start();



    usTimeZones.forEach((tz) => {
      const sessionTodayRemindersProcess = new CronJob(
        "0 9 * * *",
        () => {
          TutoringSession.queueReminders({
            reminderType: 'sessionToday',
             timeZone: tz,
             withinPeriod: INTERVAL.day });
        },
        null,
        true,
        tz
      );
      sessionTodayRemindersProcess.start();
    });
    const lastCallRemindersProcess = new CronJob(
      "* * * * *",
      () => {
        TutoringSession.queueReminders({
          reminderType: 'lastCall', 
          withinPeriod: INTERVAL.leadTime});
      },
      null,
      true,
      timeZone
    );
    lastCallRemindersProcess.start();
  })
  .then(Reminder.updateSentReminderCacheIfStale);
