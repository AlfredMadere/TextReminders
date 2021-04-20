import sendMorningReminders from "./controllers/reminderController.js";
import {
  sendLastReminder,
  updateSentRemindersFromCache,
  updateSentReminderCacheIfStale,
} from "./controllers/reminderController.js";
import cj from "cron";
const CronJob = cj.CronJob;
import usTimeZones from "./lookUpTables/usTimeZones.js";
import Tutor from "./models/Tutor.js";
import Student from "./models/Student.js";

let timeZone = "America/Los_Angeles";

Promise.all([Tutor.populateCache(), Student.populateCache()])
  .then(() => {
    return updateSentRemindersFromCache();
  })
  .then(() => {
    sendLastReminder({ leadTime: 30 });

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

    sendLastReminder({ leadTime: 20 });

    usTimeZones.forEach((tz) => {
      const morningReminders = new CronJob(
        "0 9 * * *",
        () => {
          sendMorningReminders(tz);
        },
        null,
        true,
        tz
      );
      morningReminders.start();
    });
    sendMorningReminders('America/Chicago');
    const lastReminders = new CronJob(
      "* * * * *",
      () => {
        sendLastReminder({ leadTime: 20 });
      },
      null,
      true,
      timeZone
    );
    lastReminders.start();
  }).then(updateSentReminderCacheIfStale);
