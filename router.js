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
//const Tutor = require("./models/Tutor");
import Tutor from "./models/Tutor.js";
//const Student = require("./models/Student");
import Student from "./models/Student.js";

const doTextingThings = async (params) => {
  try {
    const unncecessaryJohn = await Promise.all([
      Tutor.populateCache(),
      Student.populateCache(),
      updateSentRemindersFromCache(),
    ]);
    if (params.reminderType === "Morning") {
      await sendMorningReminders(params.timeZone);
    } else if (params.reminderType === "Last") {
      await sendLastReminder({ leadTime: params.leadTime });
    } else {
      throw new Error(
        "This is not a fucking option type: ",
        params.reminderType
      );
    }
  } catch (e) {
    throw new Error(e);
  }
};

export default doTextingThings;
