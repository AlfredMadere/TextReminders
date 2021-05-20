import googleDriver from "../drivers/googleCalDriver.js";
import sendText from "../drivers/twilioDriver.js";
import TutoringSession from "../models/TutoringSession.js";
import uploadToAWS from "../drivers/awsDriver.js";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import moment from "moment-timezone";
const textReminderCacheKey =
  process.env.NODE_ENV === "production"
    ? "textReminderCache"
    : "textReminderCache_" + process.env.NODE_ENV;
const REMINDER_CACHE_UPDATE_INTERVAL = 5000;

class Reminder {
  constructor(params) {
    this.recipient = params.recipient;
    this.message = params.message;
    this.id = params.id;
    this.type = params.type;
    this.calendar = params.calendar;
  }
  sendAndRecord() {
    //check to make sure the reminder id is not already in the cache
    //call twillio send text function
    //add reminder id to cache
    if (!(this.id in Reminder.sent) && this.recipient.number) {
      sendText({
        number: this.recipient.number,
        message: this.message,
        id: this.id,
        type: this.type,
        calendar: this.calendar,
      });
    }
    Reminder.sent[this.id] = 1;
  }
}

Reminder.sent = [];
Reminder.lastCacheContent;

Reminder.updateSentReminderCacheIfStale = async () => {
  let currentCacheContent = JSON.stringify(Reminder.sent);
  if (!(Reminder.lastCacheContent === currentCacheContent)) {
    console.log("updating aws");
    const uploadedTingos = await uploadToAWS(
      currentCacheContent,
      textReminderCacheKey,
      "reminderappcache"
    );
    Reminder.lastCacheContent = currentCacheContent;
    return uploadedTingos;
  }
  setTimeout(
    Reminder.updateSentReminderCacheIfStale,
    REMINDER_CACHE_UPDATE_INTERVAL
  );
};

Reminder.updateSentRemindersFromCache = async () => {
  const sentReminderString = await downloadFromAWS(
    textReminderCacheKey,
    "reminderappcache"
  );
  Reminder.sent = JSON.parse(sentReminderString);
  Reminder.lastCacheContent = sentReminderString;
  console.log("updating sent reminders from cache", sentReminderString.length);
  return Reminder.sent;
};

export default Reminder;
