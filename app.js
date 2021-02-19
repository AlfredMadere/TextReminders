const sendMorningReminders = require("./controllers/reminderController");
const CronJob = require("cron").CronJob;
const usTimeZones = require("./lookUpTables/usTimeZones");

sendMorningReminders("America/Chicago");

const job = new CronJob(
  "0 9 * * *",
  sendMorningReminders,
  null,
  true,
  "America/Los_Angeles"
);
job.start();
/*
var CronJob = require("cron").CronJob;
var job = new CronJob(
  "* * * * * *",
  function () {
    console.log("You will see this message every second");
  },
  null,
  true,
  "America/Los_Angeles"
);
job.start();
*/
