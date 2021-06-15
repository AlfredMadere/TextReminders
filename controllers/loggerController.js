//remindTutorsToLog
import TutoringSession from "../models/TutoringSession.js";
import SessionLog from "../models/SessionLog.js";
import S3LogCache from "../models/SessionLog.js";

const getLogInfo = async (id) => {
    if(S3LogCache.singleton().hasKey(id)){
        console.log("Things are good and we can start the logging process");
    }else{
        console.log("something is majorly fucked up, or you fucked the link");
    }
}

