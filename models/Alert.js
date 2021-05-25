import Reminder from "./Reminder.js";

class Alert extends Reminder {
  constructor(params) {
    super(params);
    this.message = `ALERT: ${this.message}`
  }
  maybeSendAndRecord() {
    if (!(this.id in Super.sent)) {
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

export default Alert;
