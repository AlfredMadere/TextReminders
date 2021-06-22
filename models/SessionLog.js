import _ from "lodash";
import S3LogCache from "./S3LogCache.js";
import Alert from "./SessionAlert.js";
import Reminder from "./Reminder.js";
import { getDataFromSheet } from "../drivers/googleSheetsDriver.js";
import TutoringSession from "./TutoringSession.js";
const SHEET_LOG_INFO_RANGE = "A4:F";
class SessionLog {
  constructor(params) {
    this.session = params.session;
    this.id = params.session.id;
    this.notes = "";
    this.subject = this.session.subject;
    this.startTime = this.session.startTime;
    this.length =
      Date.parse(this.session.endTime) - Date.parse(this.session.startTime);
    console.log("session log id", this.id);
  }
  async getLoggedDataFromSheet() {
    try {
      let tutor = this.session.tutor;
      let student = this.session.student;
      let sheetId = tutor.sheetId;
      let sheetRange = `${student.identifier}!${SHEET_LOG_INFO_RANGE}`;
      console.log("sheetRange", sheetRange);
      const response = await getDataFromSheet(sheetId, sheetRange);
      return response;
    } catch (e) {
      console.log(e);
    }
  }
  async mergeWithPreviousRecord() {
    try {
      const sheetLog = await this.getLoggedDataFromSheet();
      const sessionLogInformation = sheetLog.find((row) => {
        return row[0] === this.id;
      });
      if (sessionLogInformation) {
        console.log("should be some data", sessionLogInformation);
        this.notes = sessionLogInformation[3];
        this.subject = sessionLogInformation[2];
        //is there a way to have a date object in the google sheets? ASK COOS
        this.startTime = Date.now(); // this is obvously a place holder
        this.length = sessionLogInformation[5] * 60;
      }

      console.log("this.notes is ", this.notes);
    } catch (e) {
      console.log(e);
    }
  }
  async recorded() {
    try {
      const sheetLog = await this.getLoggedDataFromSheet();
      return sheetLog.some((row) => {
        let id = row[0];
        return id === this.id;
      });
    } catch (e) {
      //get a list of all sheets on given spreadsheet
      //get data from all of those sheets, see if the idea is included in any of that data
      console.log(e);
    }
  }
  async addToS3Cache() {
    try {
      await S3LogCache.singleton().putObj(this.id, this);
    } catch (e) {
      throw new Error(e);
    }
  }
  missingTutorMessage() {
    let message = `Null tutor for ${this.session.summary}, you should log this by hand`;
    return message;
  }
  logReminderMessage(params) {
    let message = `Log your ${
      params.type === "immediateLogReminder" ? "recent" : "past"
    } session with title "${
      this.session.summary
    }" by clicking: service.ivy-advantage.com/logger/${this.id}`;
    return message;
  }
  remindTutor(params) {
    const reminders = [];
    const alerts = [];
    if (SessionLog.noActionStatuses.includes(this.session.status)) {
      console.log(
        `No Action status for log ${this.session.summary}: ${this.session.status}`
      );
    } else {
      if (this.session.tutor) {
        reminders.push(
          new Reminder({
            session: this.session,
            recipient: this.session.tutor,
            type: params.type,
            recipientRole: "tutor",
            message: this.logReminderMessage({
              type: params.type,
            }),
          })
        );
      } else {
        alerts.push(
          new Alert({
            type: "nullTutorLog",
            session: this.session,
            message: this.missingTutorMessage(),
          })
        );
      }

      reminders.forEach((reminder) => reminder.maybeSendAndRecord());
      alerts.forEach((alert) => alert.maybeSendAndRecord());
    }
  }
}

SessionLog.populateSessionLogCacheFromStore = async () => {
  const logObjects = await listObjects({ Bucket: "loggerappcache" });
  const logIds = logObjects.map((obj) => {
    return obj.key;
  });
  SessionLog.cache = logIds;
  console.log("updating log cache from store", logIds.length);
  return SessionLog.cache;
};
SessionLog.fromBareObj = (bareObj) => {
  let sl = _.cloneDeep(bareObj);
  Object.setPrototypeOf(sl, SessionLog.prototype);
  sl.session = TutoringSession.fromBareObj(sl.session);
  return sl;
};

SessionLog.cache = [];
SessionLog.noActionStatuses = ["unloggable"];

export default SessionLog;
