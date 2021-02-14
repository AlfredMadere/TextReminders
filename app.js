const googleDriver = require("./drivers/googleCalDriver");
const CalEvent = require("./models/CalEvent");

googleDriver
  .getEvents([
    /^Host one/i,
    /^Host two/i,
    /^Host three/i,
    /^Ivy Advantage Corporate/i,
  ])
  .then((res) => {
    new CalEvent(res[0]);
  });
