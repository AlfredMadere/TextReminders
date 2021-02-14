const studentLookUp = require("../lookUpTables/students");
const tutorLookUp = require("../lookUpTables/tutors");

class CalEvent {
  constructor(googleCalEvent) {
    this.summary = googleCalEvent.summary;
    let matches = googleCalEvent.summary.match(
      /^(?<studentName>\w+)\s+(?<subject>\w+).*\s+(?<tutorName>\w+)$/
    );
    this.subject = matches.groups.subject;
    this.student = studentLookUp[matches.groups.studentName];
    this.tutor = tutorLookUp[matches.groups.tutorName];

    console.log(this);
  }
}

module.exports = CalEvent;
