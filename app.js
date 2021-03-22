import doTextingThings from "./router.js";
import cj from "cron";
const CronJob = cj.CronJob;

const lastMinInstructions = {
  reminderType: "Last",
  timeZone: "America/Chicago",
  leadTime: 30,
};

const morningRemindersEast = new CronJob(
  "0 1 * * *",
  () => {
    doTextingThings({
      reminderType: "Morning",
      timeZone: "America/New_York",
      leadTime: 30,
    });
  },
  null,
  true,
  "UTC"
);
morningRemindersEast.start();

const morningRemindersCentral = new CronJob(
  "0 2 * * *",
  () => {
    doTextingThings({
      reminderType: "Morning",
      timeZone: "America/Chicago",
      leadTime: 30,
    });
  },
  null,
  true,
  "UTC"
);
morningRemindersCentral.start();

const morningRemindersMountain = new CronJob(
  "0 3 * * *",
  () => {
    doTextingThings({
      reminderType: "Morning",
      timeZone: "America/Denver",
      leadTime: 30,
    });
  },
  null,
  true,
  "UTC"
);
morningRemindersMountain.start();

const morningRemindersWest = new CronJob(
  "0 4 * * *",
  () => {
    doTextingThings({
      reminderType: "Morning",
      timeZone: "America/Los_Angeles",
      leadTime: 30,
    });
  },
  null,
  true,
  "UTC"
);
morningRemindersWest.start();

doTextingThings(lastMinInstructions);
const lastReminders = new CronJob(
  "0/10 * * * *",
  () => {
    doTextingThings(lastMinInstructions);
  },
  null,
  true,
  "UTC"
);
lastReminders.start();
