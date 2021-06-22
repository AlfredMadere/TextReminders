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
    this.session = params.session;
    this.type = params.type;
    this.id =
      this.recipient.number +
      this.recipient.name +
      this.session.startTime +
      this.session.id +
      this.type;
    this.message = params.message;
    this.recipientRole = params.recipientRole;
    if (!(process.env.NODE_ENV === "production")) {
      this.message = `${this.message} [${process.env.NODE_ENV}]`;
    }
  }
  sendAndPrintReminder() {
    //set message to print based on whether or not NODE_ENV is production
    let modeIsProduction = process.env.NODE_ENV === "production" ? true : false;
    console.log(
      `Sending reminder ${
        modeIsProduction ? "to live number" : "to dev team"
      } from calendar ${this.session.calendar} in ${
        process.env.NODE_ENV
      } mode:`,
      JSON.stringify(this, null, 4)
    );
    sendText({
      number: modeIsProduction
        ? this.recipient.number
        : process.env.DEV_PHONE || "5122990497",
      message: this.message,
    });
  }
  maybeSendAndRecord() {
    //check to make sure the reminder id is not already in the cache
    //send and print reminder
    //add reminder id to cache
    if (!(this.id in Reminder.sent)) {
      if (this.recipient.number) {
        this.sendAndPrintReminder();
      } else {
        console.log("No number available for: ", this.recipient);
      }
      Reminder.sent[this.id] = 1;
    }
  }
}

Reminder.sent = {};
Reminder.lastCacheContent;

Reminder.updateSentReminderStoreIfStale = async () => {
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
    Reminder.updateSentReminderStoreIfStale,
    REMINDER_CACHE_UPDATE_INTERVAL
  );
};

Reminder.populateSentReminderCacheFromStore = async () => {
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
