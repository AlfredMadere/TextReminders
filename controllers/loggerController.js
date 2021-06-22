//remindTutorsToLog
import TutoringSession from "../models/TutoringSession.js";
import SessionLog from "../models/SessionLog.js";
import S3LogCache from "../models/S3LogCache.js";

const getLogInfo = async (id) => {
  if (S3LogCache.singleton().hasKey(id)) {
    console.log("Things are good and we can start the logging process");
    const sessionLog = await S3LogCache.singleton().getSessionLog(id);

    if (await sessionLog.recorded()) {
      await sessionLog.mergeWithPreviousRecord();
      console.log("need to get data and edit the session log");
    } else {
      console.log("The student sheet on this tutor has not seen this Id");
    }
    console.log("server this log to client: ", sessionLog);
  } else {
    console.log("something is majorly fucked up, or you fucked the link");
  }
};
export default getLogInfo;
