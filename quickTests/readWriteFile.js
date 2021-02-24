const fs = require("fs");

const sentReminders = require("./sentReminders.json");

const updateCache = (sR) => {
  fs.writeFile("sentReminders.json", JSON.stringify(sR), (err) => {
    if (err) throw err;

    console.log("done writing");
  });
};

sentReminders["sloop"] = 1;

updateCache(sentReminders);
