const Student = require("../models/Student");
const Tutor = require("../models/Tutor");
const { DateTime } = require("luxon");

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
      recipientTimezone: this.tutor.timeZone,
      otherParticipant: this.student.studentName,
    });
  }
  studentReminderText() {
    return this.reminderText({
      recipientTimezone: this.student.timeZone,
      otherParticipant: this.tutor.tutorName,
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

module.exports = TutoringSession;
