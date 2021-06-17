import getDataFor from "../drivers/googleSheetsDriver.js";
import _ from "lodash";

class Student {
  constructor(params) {
    this.name = params.studentName;
    this.number = params.studentNumber;
    this.email = params.studentEmail;
    this.parent = {
      name: params.parentName,
      number: params.parentNumber,
      email: params.parentEmail,
    };
    this.timezone = params.timezone;
    this.identifier = params.identifier;
  }
}

Student.cache = null;

Student.populateCache = () => {
  Student.cache = {};
  return getDataFor("student")
    .then((columns) => {
      if (columns.length) {
        let newCache = {};
        columns.forEach((column) => {
          console.log(column[3]);
          if (column.length > 0) {
            newCache[column[0]] = new Student({
              parentName: column[1],
              studentName: column[3],
              studentNumber: column[4],
              studentEmail: column[5],
              parentNumber: column[6],
              parentEmail: column[7],
              timezone: column[8],
              identifier: column[0],
            });
          }
        });
        Student.cache = newCache;
      } else {
        console.log("No data found.");
      }
    })
    .catch((err) => console.log(err));
};

Student.find = (name) => {
  if (Student.cache) {
    return Student.cache[name];
  } else {
    throw new Error("Student cache not initialized");
  }
};

Student.fromBareObj = (bareObj) => {
  let s = _.cloneDeep(bareObj);
  Object.setPrototypeOf(s, Student.prototype);
  return s;
};

export default Student;
