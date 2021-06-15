//const getDataFor = require("../drivers/googleSheetsDriver");
import getDataFor from "../drivers/googleSheetsDriver.js";

class Tutor {
  constructor(params) {
    this.name = params.name;
    this.number = params.number;
    this.email = params.email;
    this.timezone = params.timezone;
  }
}

Tutor.cache = null;

Tutor.find = (name) => {
  if (Tutor.cache) {
    return Tutor.cache[name];
  } else {
    throw new Error("Tutor cache not initialized");
  }
};

Tutor.populateCache = () => {
  Tutor.cache = {};
  return getDataFor("tutor")
    .then((columns) => {
      if (columns.length) {
        let newCache = {};
        columns.forEach((column) => {
          if (column.length > 0) {
            newCache[column[0]] = new Tutor({
              name: column[2],
              number: column[3],
              email: column[4],
              timezone: column[5],
            });
          }
        });
        Tutor.cache = newCache;
      } else {
        console.log("No data found.");
      }
    })
    .catch((err) => console.log(err));
};

Tutor.fromBareObj = (bareObj) => {
  let t = _.cloneDeep(bareObj);
  Object.setPrototypeOf(t, Tutor.prototype);
};

export default Tutor;
