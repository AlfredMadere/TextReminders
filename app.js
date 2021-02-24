const {
  sendMorningReminders,
  sendLastReminder,
  updateSentRemindersFromCache,
} = require("./controllers/reminderController");
const CronJob = require("cron").CronJob;
const usTimeZones = require("./lookUpTables/usTimeZones");
const Tutor = require("./models/Tutor");
const Student = require("./models/Student");

let timeZone = "America/Chicago";

Promise.all([Tutor.populateCache(), Student.populateCache()]).then(() => {
  console.log("student cache", Student.cache);
  console.log("tutor cache", Tutor.cache);

  updateSentRemindersFromCache();
  sendLastReminder({ leadTime: 20 });

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
    "* * * * *",
    () => {
      sendLastReminder({ leadTime: 20 });
    },
    null,
    true,
    timeZone
  );
  lastReminders.start();
});
