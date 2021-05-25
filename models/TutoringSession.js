import Student from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import { DateTime } from "luxon";
import Reminder from "./Reminder.js";
import Alert from "./Alert.js";
import googleCalDriver from "../drivers/googleCalDriver.js";
import moment from "moment-timezone";
const 

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+with\s+(?<tutorName>\w+)\s*(?:-\s*(?<status>.*\S)\s*)?$/
    );
    this.status = matches.groups.status;
    this.subject = matches.groups.subject;
    this.student = Student.find(matches.groups.studentName);
    this.parent = Student.find(matches.groups.studentName).parent;
    this.tutor = Tutor.find(matches.groups.tutorName);
    this.startTime = DateTime.fromISO(googleCalEvent.start.dateTime);
    this.id = googleCalEvent.id;
    this.calendar = googleCalEvent.organizer.displayName;
    this.state = params.state;
    if (!(process.env.NODE_ENV === "production")) {
      TutoringSession.calendarNamePatterns.push(/^Api tester/i);
    }
  }
  sessionReminderText(params) {
    let participantType = params.participantType;
    let otherParticipantType =
      participantType === "student" ? "tutor" : "student";
    let participant = this[participantType];
    let otherParticipant = this[otherParticipantType];
    let rezonedStartTime = this.startTime.setZone(participant.timeZone);
    let formattedStartTime = rezonedStartTime.toLocaleString(
      DateTime.TIME_SIMPLE
    );
    if (params.type === "sessionToday") {
      return `Morning Reminder of ${
        this.subject
      } tutoring later today at ${formattedStartTime} ${
        otherParticipant ? "with " + otherParticipant.name : ""
      }. You may reply STOP at anytime to turn off reminders.`;
    } else {
      return `Reminder of upcomming ${
        this.subject
      } tutoring session at ${formattedStartTime}${
        otherParticipant ? " with " + otherParticipant.name : ""
      }. You may reply STOP at anytime to turn off reminders.`;
    }
  }
  missingParticipantAlertMessage(params) {
    let alertMessage = `Null ${params.participant} for session: ${
      this.summary
    } at ${this.startTime.toLocaleString(DateTime.DATETIME_SHORT)}`;
    return alertMessage;
  }
  
  sendRemindersToParticipants(params) {
    //checks to make sure the session status doesn't prevent sending reminder
    //creates reminder objects for participants in the time zone
    //creates alert objects for any missing participants
    //sends reminders and alerts using thier respective sendAndRecord methods
    const reminders = [];
    const alerts = [];
    if (TutoringSession.noActionStatuses.includes(this.status)) {
      console.log(`No Action status for ${this.summary}: ${this.status}`);
    } else {
      if (this.student) {
        if ((  !(params.reminderType === 'sessionToday')   ) ||
          (moment.tz(this.student.timezone).utcOffset() ==
          moment.tz(params.tz).utcOffset())
        ) {
          reminders.push(
            new Reminder({
              session: this,
              recipient: this.student,
              type: params.type,
              recipientRole: "student",
              message: this.sessionReminderText({
                type: params.type,
                participantType: "student",
              }),
            })
          );
          reminders.push(
            new Reminder({
              session: this,
              recipient: this.student.parent,
              type: params.type,
              recipientRole: "parent",
              message: this.sessionReminderText({
                type: params.type,
                participantType: "student",
              }),
            })
          );
        } else {
          console.log(
            `student ${this.student.name} not texted for ${this.summary}. Recipient timezone: ${this.student.timezone}. Input timezone: ${tz}`
          );
        }
      } else {
        alerts.push(
          new Alert({
            type: "nullStudent",
            session: this,
            message: this.missingParticipantAlertMessage({
              participant: "student",
            }),
          })
        );
      }
      if (this.tutor) {
        if ((   !(params.reminderType === 'sessionToday')      ) ||
          (moment.tz(this.tutor.timezone).utcOffset() ==
          moment.tz(params.tz).utcOffset())
        ) {
          reminders.push(
            new Reminder({
              session: this,
              recipient: this.tutor,
              type: params.type,
              recipientRole: "tutor",
              message: this.sessionReminderText({
                type: params.type,
                participantType: "tutor",
              }),
            })
          );
        } else {
          console.log(
            `tutor ${this.tutor.name} not texted for ${this.summary}. Recipient timezone: ${this.tutor.timezone}. Input timezone: ${tz}`
          );
        }
      } else {
        alerts.push(
          new Alert({
            type: "nullTutor",
            session: this,
            message: this.missingParticipantAlertMessage({
              participant: "tutor",
            }),
          })
        );
      }
      reminders.forEach((reminder) => reminder.maybeSendAndRecord());
      alerts.forEach((alert) => alert.maybeSendAndRecord());
    }
  }
}

TutoringSession.getSessionsStartingBetween = async (startTime, endTime) => {
  const rawEventList = await googleCalDriver.getEvents({
    calendarNamePatterns: TutoringSession.calendarNamePatterns,
    startTime: startTime,
    endTime: endTime,
  });
  const sessionsBetween = rawEventList
    .filter((x) => {
      return Date.parse(x.start.dateTime) > startTime.getTime();
    })
    .map((event) => {
      return new TutoringSession(event);
    });
  return Promise.resolve(sessionsBetween);
};

// WARN: generic name not specific enough might change late with more session loggin capability
TutoringSession.getSessions = (interval) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 60*1000*interval);
  return TutoringSession.getSessionsStartingBetween(startTime, endTime);
  
};


// WARN: generic name not specific enough might change late with more session loggin capability 
TutoringSession.queueReminders = (params) => {

  const sessionList = await TutoringSession.getSessions(params.withinPeriod);
  if (sessionList.length) {
    sessionList.forEach(async (session) => {
      session.sendRemindersToParticipants({ reminderType: params.reminderType, tz: params.timeZone });
    });
  }
  
}
/* dep
TutoringSession.getTodaysSessions = () => {
  const startTime = new Date();
  let endTime = new Date(startTime.getTime() + 60 * 60 * 18 * 1000);
  return TutoringSession.getSessionsStartingBetween(startTime, endTime);
};
*/



TutoringSession.noActionStatuses = [
  "pending reschedule",
  "cancelled",
  "meeting",
];

TutoringSession.calendarNamePatterns = [
  /^Host one/i,
  /^Host two/i,
  /^Host three/i,
  /^Ivy Advantage Corporate/i,
];

export default TutoringSession;
