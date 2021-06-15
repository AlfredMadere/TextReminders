import Student from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import { DateTime } from "luxon";
import Reminder from "./Reminder.js";
import Alert from "./SessionAlert.js";
import googleCalDriver from "../drivers/googleCalDriver.js";
import moment from "moment-timezone";
import _ from "lodash";

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = this.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+with\s+(?<tutorName>\w+)\s*(?:-\s*(?<status>.*\S)\s*)?$/
    );
    this.status = matches.groups.status;
    this.subject = matches.groups.subject;
    this.student = Student.find(matches.groups.studentName);
    this.parent = this.student
      ? Student.find(matches.groups.studentName).parent
      : null;
    this.tutor = Tutor.find(matches.groups.tutorName);
    this.startTime = DateTime.fromISO(googleCalEvent.start.dateTime);
    this.id = googleCalEvent.id;
    this.calendar = googleCalEvent.organizer.displayName;

    // this.state = googleCalEvent.state;
  }
  sessionReminderText(params) {
    let participantType = params.participantType;
    let otherParticipantType =
      participantType === "student" ? "tutor" : "student";
    let participant = this[participantType];
    let otherParticipant = this[otherParticipantType];
    let rezonedStartTime = this.startTime.setZone(participant.timezone);
    let formattedStartTime = rezonedStartTime.toLocaleString(
      DateTime.TIME_SIMPLE
    );
    if (params.type === "sessionToday") {
      return `Morning Reminder of ${
        this.subject
      } tutoring later today at ${formattedStartTime} ${
        otherParticipant ? "with " + otherParticipant.name : ""
      }.`;
    } else {
      return `Reminder of upcomming ${
        this.subject
      } tutoring session at ${formattedStartTime}${
        otherParticipant ? " with " + otherParticipant.name : ""
      }.`;
    }
  }
  missingParticipantAlertMessage(params) {
    let rezonedStartTime = this.startTime.setZone(
      process.env.DEV_TIME_ZONE || "GMT"
    );
    let alertMessage = `Null ${params.participant} for session: ${
      this.summary
    } at ${rezonedStartTime.toLocaleString(DateTime.DATETIME_SHORT)}`;
    return alertMessage;
  }

  //rename to sendSessionReminders
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
        if (
          !params.tz ||
          moment.tz(this.student.timezone).utcOffset() ==
            moment.tz(params.tz).utcOffset()
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
            `student ${this.student.name} not texted for ${this.summary}. Recipient timezone: ${this.student.timezone}. Input timezone: ${params.tz}`
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
        if (
          !params.tz ||
          moment.tz(this.tutor.timezone).utcOffset() ==
            moment.tz(params.tz).utcOffset()
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
            `tutor ${this.tutor.name} not texted for ${this.summary}. Recipient timezone: ${this.tutor.timezone}. Input timezone: ${params.tz}`
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

//I need some fucking help with this
TutoringSession.getSessionsThat = async (interval, condition) => {
  const rawEventList = await googleCalDriver.getEvents({
    calendarNamePatterns: TutoringSession.calendarNamePatterns,
    startTime: interval.startTime,
    endTime: interval.endTime,
  });
  const sessionsBetween = rawEventList
    .filter(condition)
    .map((filteredEvent) => {
      return new TutoringSession(filteredEvent);
    });
  return Promise.resolve(sessionsBetween);
};

TutoringSession.isTutoringSession = (googleCalEvent) => {
  let summary = googleCalEvent.summary;
  let matches = summary.match(
    /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+with\s+(?<tutorName>\w+)\s*(?:-\s*(?<status>.*\S)\s*)?$/
  );
  return matches ? true : false;
};

TutoringSession.noActionStatuses = [
  "pending reschedule",
  "rescheduling",
  "cancelled",
  "meeting",
];

TutoringSession.calendarNamePatterns = [
  /^Host one/i,
  /^Host two/i,
  /^Host three/i,
  /^Ivy Advantage Corporate/i,
];

if (!(process.env.NODE_ENV === "production")) {
  TutoringSession.calendarNamePatterns.push(/^Api tester/i);
}

export default TutoringSession;
