import Reminder from "./Reminder.js";
import sendText from "../drivers/twilioDriver.js";

class SessionAlert {
  constructor(params) {
    this.message = `SESSION ALERT: ${params.message}`;
    this.id = params.session.summary + params.session.startTime + params.type;
  }
  maybeSendAndRecord() {
    if (!(this.id in Reminder.sent)) {
      this.sendAndPrintAlert();
      Reminder.sent[this.id] = 1;
    }
  }
  sendAndPrintAlert() {
    console.log(
      `!!!ALERT!!! Sending to dev team in ${process.env.NODE_ENV} mode. Details:`,
      JSON.stringify(this, null, 4)
    );
    sendText({
      number: process.env.DEV_PHONE || "5122990497",
      message: this.message,
    });
  }
}

export default SessionAlert;
