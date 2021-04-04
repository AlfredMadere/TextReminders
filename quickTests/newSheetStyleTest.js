import Student from "../models/Student.js";

Student.newPopulateCache().then(() => console.log(Student.cache));
