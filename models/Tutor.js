const getDataFor = require("../drivers/googleSheetsDriver");

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
  return getDataFor("tutor")
    .then((rows) => {
      if (rows.length) {
        let newCache = {};
        rows.forEach((row) => {
          newCache[row[0]] = new Tutor({
            name: row[1],
            number: row[2],
            email: row[3],
            timezone: row[4],
          });
        });
        Tutor.cache = newCache;
      } else {
        throw "no data found";
      }
    })
    .catch((err) => console.log(err));
};

module.exports = Tutor;
