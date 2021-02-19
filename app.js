const { sendMorningReminders } = require("./controllers/reminderController");
const { sendLastReminder } = require("./controllers/reminderController");
const CronJob = require("cron").CronJob;
const usTimeZones = require("./lookUpTables/usTimeZones");

let timeZone = "America/Chicago";
sendMorningReminders(timeZone);

usTimeZones.forEach((tz) => {
  const job = new CronJob(
    "30 20 * * *",
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
  "0,10,20,30,40,50 * * * *",
  () => {
    sendLastReminder({ leadTime: 15 });
  },
  null,
  true,
  timeZone
);
job.start();
