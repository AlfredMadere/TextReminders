import { response } from "express";
import _ from "lodash";

const fakeS3 = {
  totallyRandomID: {
    student: "Billy Bob Student",
    tutor: "Alfred Madere",
    duration: 1.5,
    startTime: "4:30pm",
    date: "5/6/21",
    subject: "Math",
    notes: "ayo",
    id: "totallyRandomID",
  },
  totallyRandomID2: {
    student: "Ally Sapire",
    tutor: "Alfred Madere",
    duration: 1.5,
    startTime: "7:30pm",
    date: "5/24/21",
    subject: "Pre Cal",
    notes: "",
    id: "totallyRandomID2",
  },
  totallyRandomID3: {
    student: "Ally Sapire",
    tutor: "Alfred Madere",
    duration: 1.5,
    startTime: "7:30pm",
    date: "5/24/21",
    subject: "Pre Cal",
    notes: "",
    id: "totallyRandomID2",
  },
};

const fakeGoogleSheetsLog = {
  totallyRandomID2: 1,
  anotherFuckingID: 1,
};

export const getSessionInfo = (req, res, next) => {
  let sessionId = req.query.id;
  console.log("sessionid", sessionId);
  if (sessionId in fakeS3) {
    const session = _.cloneDeep(fakeS3[sessionId]);
    if (sessionId in fakeGoogleSheetsLog) {
      session.status = "logged";
    } else {
      session.status = "unlogged";
    }
    res.json(session);
  } else {
    console.log("sending 404 status");
    res.sendStatus(404);
  }
};

export const postLogInfo = (req, res, next) => {
  const responseData = req.body;
  console.log("stringified req body " + JSON.stringify(responseData));
  if (responseData.logValid === "true") {
    console.log("log is valid");
    if (responseData.status === "logged") {
      console.log(
        "editing previously logged session to include these notes and things"
      );
      //go to google sheets and find session with this id, edit it to match this data
      //
    } else {
      console.log("logging session for the first time");
      //go to google sheets and add session with this id and this info
      fakeGoogleSheetsLog[responseData.id] = 1;
      //will need to decide if it's a reimbursement fee or normal session based on logType
    }
  } else {
    console.log(
      "log is not valid, not going to log this and going to get in contact with DEVS"
    );
  }
  res.json({ message: "wow this is cool" });
};
// https:localHost3001/logger/?=totallyRandomID

export default getSessionInfo;
