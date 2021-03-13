import googleCalDriver from "../drivers/googleCalDriver.js";
const startTime = new Date();
let endTime = new Date(startTime.getTime() + 60 * 60 * 24 * 1000);

const getSessionsStartingBetween = async (startTime, endTime) => {
  const rawEventList = await googleCalDriver.getEvents({
    calendarNamePatterns: [
      /^Host one/i,
      /^Host two/i,
      /^Host three/i,
      /^Ivy Advantage Corporate/i,
      /^Api tester/i,
    ],
    startTime: startTime,
    endTime: endTime,
  });
  const sessionsBetween = rawEventList;
  return Promise.resolve(sessionsBetween);
};

getSessionsStartingBetween(startTime, endTime).then((res) => console.log(res));
