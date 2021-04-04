/*
const {
  sendMorningReminders,
  sendLastReminder,
  updateSentRemindersFromCache,
} = require("./controllers/reminderController");
*/
import sendMorningReminders from "./controllers/reminderController.js";
import {
  sendLastReminder,
  updateSentRemindersFromCache,
} from "./controllers/reminderController.js";
//const CronJob = require("cron").CronJob;
import cj from "cron";
const CronJob = cj.CronJob;
//const usTimeZones = require("./lookUpTables/usTimeZones");
import usTimeZones from "./lookUpTables/usTimeZones.js";
//const Tutor = require("./models/Tutor");
import Tutor from "./models/Tutor.js";
//const Student = require("./models/Student");
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

    const lastReminders = new CronJob(
      "*/10 * * * *",
      () => {
        sendLastReminder({ leadTime: 20 });
      },
      null,
      true,
      timeZone
    );
    lastReminders.start();
  });
