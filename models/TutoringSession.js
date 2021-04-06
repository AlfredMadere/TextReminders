//const Student = require("../models/Student");
import Student from "../models/Student.js";
//const Tutor = require("../models/Tutor");
import Tutor from "../models/Tutor.js";
//const { DateTime } = require("luxon");
import { DateTime } from "luxon";
import { googleCalCredentialsKey } from "../quickTests/populateCredentials.js";

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+(?<tutorName>\w+)\s*$/
    );
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
  //write reminder text function
  reminderText(params) {
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
}

export default TutoringSession;
