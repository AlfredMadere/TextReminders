import _ from "lodash";
import S3LogCache from "./S3LogCache.js";
import Alert from "./SessionAlert.js";
import Reminder from "./Reminder.js";

class SessionLog {
  constructor(params) {
    this.session = params.session;
    this.id = params.session.id;
    console.log("session log id", this.id);
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
};

SessionLog.cache = [];
SessionLog.noActionStatuses = ["unloggable"];

export default SessionLog;
