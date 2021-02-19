const studentLookUp = require("../lookUpTables/students");
const tutorLookUp = require("../lookUpTables/tutors");
const { DateTime } = require("luxon");

class TutoringSession {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+(?<tutorName>\w+)$/
    );
    this.subject = matches.groups.subject;
    this.student = studentLookUp[matches.groups.studentName];
    this.tutor = tutorLookUp[matches.groups.tutorName];
    this.startTime = DateTime.fromISO(googleCalEvent.start.dateTime);
  }
  tutorTextReminder() {
    let rezonedStartTime = this.startTime.setZone(this.tutor.timeZone);
    let formattedStartTime = rezonedStartTime.toLocaleString(
      DateTime.TIME_SIMPLE
    );
    let message = `Reminder of ${this.subject} tutoring today at ${formattedStartTime} with ${this.student.studentName}`;
    return message;
  }
  studentTextReminder() {
    let message = "";
    message = `Reminder of ${
      this.subject
    } tutoring today at ${this.startTime.toLocaleString(
      DateTime.TIME_SIMPLE
    )} CST with ${this.tutor.tutorName}`;
    return message;
  }
}

module.exports = TutoringSession;
