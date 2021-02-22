const getDataFor = require("../drivers/googleSheetsDriver");
console.log(getDataFor);

class Tutor {
  constructor(params) {
    this.name = params.name;
    this.number = params.number;
    this.email = params.email;
    this.timezone = params.timezone;
  }
}

Tutor.cache = {};

Tutor.find = (name) => {
  return Tutor.cache[name];
};

Tutor.populateCache = () => {
  console.log("in tutor.pop ", getDataFor);
  getDataFor("tutor", (rows) => {
    if (rows.length) {
      let newCache = {};
      console.log("in");
      rows.forEach((row) => {
        newCache[row[0]] = new Tutor({
          name: row[1],
          number: row[2],
          email: row[3],
          timezone: row[4],
        });
      });
      Tutor.cache = newCache;
      console.log(Tutor.cache);
    } else {
      console.log("No data found.");
    }
  });
};

module.exports = Tutor;
