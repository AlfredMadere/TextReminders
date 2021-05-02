import sendText from "../drivers/twilioDriver.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import _ from "lodash";

const textAllTutors = async (message) => {
  await Tutor.populateCache();
  const tutors = _.values(Tutor.cache);
  tutors.forEach((tutor) => {
    console.log("tutor", tutor);
    sendText({
      number: tutor.number,
      message: message,
    });
  });
};

const textAllParents = async (message) => {
  await Student.populateCache();
  const students = _.values(Student.cache);
  students.forEach((student) => {
    console.log("parent", student);
    sendText({
      number: student.parentNumber,
      message: message,
    });
  });
};

const textAllStudents = async (message) => {
  await Student.populateCache();
  const students = _.values(Student.cache);
  students.forEach((student) => {
    console.log("parent", student);

    sendText({
      number: student.studentNumber,
      message: message,
    });
  });
};

const textAllContacts = (message) => {
  textAllParents(message);
  textAllStudents(message);
  textAllTutors(message);
};

/*
textAllContacts(
  "Hello, this is the Ivy Advantage text reminder service. Please save this number in your phone as you will recieve a text shortly before each session"
);
*/
