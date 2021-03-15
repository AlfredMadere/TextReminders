//const getDataFor = require("../drivers/googleSheetsDriver");
import getDataFor from "../drivers/googleSheetsDriver.js";

class Student {
  constructor(params) {
    this.studentName = params.studentName;
    this.studentNumber = params.studentNumber;
    this.studentEmail = params.studentEmail;
    this.parentName = params.parentName;
    this.parentNumber = params.parentNumber;
    this.parentEmail = params.parentEmail;
    this.timezone = params.timezone;
  }
}

Student.cache = {};

Student.populateCache = () => {
  return getDataFor("student")
    .then((rows) => {
      if (rows.length) {
        let newCache = {};
        rows.forEach((row) => {
          newCache[row[0]] = new Student({
            studentName: row[1],
            studentNumber: row[2],
            studentEmail: row[3],
            parentName: row[4],
            parentNumber: row[5],
            parentEmail: row[6],
            timezone: row[7],
          });
        });
        Student.cache = newCache;
        console.log("student Cache", Student.cache);
      } else {
        console.log("No data found.");
      }
    })
    .catch((err) => console.log(err));
};

Student.find = (name) => {
  return Student.cache[name];
};

export default Student;
