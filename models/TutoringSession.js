//const Student = require("../models/Student");
import Student from "../models/Student.js";
//const Tutor = require("../models/Tutor");
import Tutor from "../models/Tutor.js";
//const { DateTime } = require("luxon");
import { DateTime } from "luxon";

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+(?<tutorName>\w+)$/
    );
    this.subject = matches.groups.subject;
    this.student = Student.find(matches.groups.studentName);
    this.tutor = Tutor.find(matches.groups.tutorName);
    this.startTime = DateTime.fromISO(googleCalEvent.start.dateTime);
    this.id = googleCalEvent.id;
  }
  tutorReminderText() {
    return this.reminderText({
      recipientTimezone: this.tutor.timezone,
      otherParticipant: this.student.studentName,
    });
  }
  studentReminderText() {
    return this.reminderText({
      recipientTimezone: this.student.timezone,
      otherParticipant: this.tutor.name,
    });
  }
  //write reminder text function
  reminderText(params) {
    let rezonedStartTime = this.startTime.setZone(params.recipientTimezone);
    let formattedStartTime = rezonedStartTime.toLocaleString(
      DateTime.TIME_SIMPLE
    );
    let message = `Reminder of ${this.subject} tutoring today at ${formattedStartTime} with ${params.otherParticipant}`;
    return message;
  }
}

export default TutoringSession;
