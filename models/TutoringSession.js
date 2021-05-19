import Student from "../models/Student.js";
import Tutor from "../models/Tutor.js";
import { DateTime } from "luxon";
import Reminder from "./Reminder.js";
import Alert from "./Alert.js";

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+with\s+(?<tutorName>\w+)\s*(?:-\s*(?<status>.*\S)\s*)?$/
    );
    this.status = matches.groups.status;
    this.subject = matches.groups.subject;
    this.student = Student.find(matches.groups.studentName);
    this.tutor = Tutor.find(matches.groups.tutorName);
    this.startTime = DateTime.fromISO(googleCalEvent.start.dateTime);
    this.id = googleCalEvent.id;
    this.calendar = googleCalEvent.organizer.displayName;
  }
  tutorReminderText(isMorning) {
    return this.reminderText({
      recipientTimezone: this.tutor.timezone,
      otherParticipant: this.student ? this.student.studentName : null,
      isMorning: isMorning,
    });
  }
  studentReminderText(isMorning) {
    return this.reminderText({
      recipientTimezone: this.student.timezone,
      otherParticipant: this.tutor ? this.tutor.name : null,
      isMorning: isMorning,
    });
  }

  reminderText(params) {
    //returns a string of text to be sent as a reminder depending on timezone and participant
    let rezonedStartTime = this.startTime.setZone(params.recipientTimezone);
    let formattedStartTime = rezonedStartTime.toLocaleString(
      DateTime.TIME_SIMPLE
    );
    let morningMessage = `Morning Reminder of ${
      this.subject
    } tutoring later today at ${formattedStartTime}${
      params.otherParticipant ? " with " + params.otherParticipant : ""
    }. You may reply STOP at anytime to turn off reminders.`;
    let lastMessage = `Reminder of upcomming ${
      this.subject
    } tutoring session at ${formattedStartTime}${
      params.otherParticipant ? " with " + params.otherParticipant : ""
    }. You may reply STOP at anytime to turn off reminders.`;
    return params.isMorning ? morningMessage : lastMessage;
  }

  sendMorningRemindersToParticipantsInTz(tz) {
    //checks to make sure the session status doesn't prevent sending reminder
    //creates reminder objects for participants in the time zone
    //creates alert objects for any missing participants
    //sends reminders and alerts using thier respective sendAndRecord methods

    const morningReminders = [];
    const alerts = [];
    if (TutoringSession.noTextStatuses.includes(this.status)) {
      console.log(`Untextable status for ${this.summary}: ${this.status}`);
    } else {
      if (this.student) {
        studentReminderId =
          this.id + this.student.studentNumber + this.startTime + type;
        parentReminderId = `${this.id}${this.student.parentNumber}${this.startTime}${type}`;
        if (
          moment.tz(this.student.timezone).utcOffset() ==
          moment.tz(tz).utcOffset()
        ) {
          morningReminders.push(
            new Reminder({
              recipient: this.student,
              message: this.studentReminderText(true),
              id: studentReminderId,
              type: "morning",
            })
          );
          morningReminders.push(
            new Reminder({
              recipient: this.student.parent,
              message: this.studentReminderText(true),
              id: parentReminderId,
              type: "morning",
            })
          );
        } else {
          console.log(
            `student ${this.student.name} not texted for ${this.session.summary}. Recipient timezone: ${this.student.timezone}. Input timezone: ${tz}`
          );
        }
      } else {
        studentReminderId = this.id + this.startTime + "NULL_STUDENT";
        parentReminderId = this.id + this.startTime + "NULL_STUDENT";
        const alertMessage = `null student for ${this.session.summary}`;
        alerts.push(
          new Alert({ message: alertMessage, id: studentReminderId })
        );
      }
      if (this.tutor) {
        tutorReminderId =
          this.id + this.tutor.number + this.startTime + this.tutor.name + type;
        if (
          moment.tz(this.tutor.timezone).utcOffset() ==
          moment.tz(tz).utcOffset()
        ) {
          morningReminders.push(
            new Reminder({
              recipient: this.tutor,
              message: this.tutorReminderText(true),
              id: tutorReminderId,
              type: "morning",
            })
          );
        } else {
          console.log(
            `tutor ${this.tutor.name} not texted for ${this.session.message}. Recipient timezone: ${this.tutor.timezone}. Input timezone: ${tz}`
          );
        }
      } else {
        tutorReminderId = this.id + this.startTime + "NULL_TUTOR";
        const alertMessage = `null student for ${this.session.summary}`;
        alerts.push(
          new Alert({ message: alertMessage, id: studentReminderId })
        );
      }
      morningReminders.forEach((reminder) => reminder.sendAndRecord());
      alerts.forEach((alert) => alert.sendAndRecord());
    }
  }
}

TutoringSession.getSessionsStartingBetween = async (startTime, endTime) => {
  const rawEventList = await googleDriver.getEvents({
    calendarNamePatterns: [
      /^Host one/i,
      /^Host two/i,
      /^Host three/i,
      /^Ivy Advantage Corporate/i,
      /^Api tester/i,
    ],
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

TutoringSession.getTodaysSessions = () => {
  const startTime = new Date();
  let endTime = new Date(startTime.getTime() + 60 * 60 * 18 * 1000);
  return TutoringSession.getSessionsStartingBetween(startTime, endTime);
};

TutoringSession.noTextStatuses = ["pending reschedule", "cancelled", "meeting"];

export default TutoringSession;
