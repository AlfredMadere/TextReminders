const { sendMorningReminders } = require("./controllers/reminderController");
const { sendLastReminder } = require("./controllers/reminderController");
const CronJob = require("cron").CronJob;
const usTimeZones = require("./lookUpTables/usTimeZones");
const Tutor = require("./models/Tutor");
const Student = require("./models/Student");

let timeZone = "America/Chicago";

Tutor.populateCache();
Student.populateCache();
//sendLastReminder({ leadTime: 20 });
/*
usTimeZones.forEach((tz) => {
  const job = new CronJob(
    "0 9 * * *",
    () => {
      sendMorningReminders(tz);
    },
    null,
    true,
    tz
  );
  job.start();
});

const job = new CronJob(
  "* * * * *",
  () => {
    sendLastReminder({ leadTime: 20 });
  },
  null,
  true,
  timeZone
);
job.start();
*/
