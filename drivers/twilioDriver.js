import twilio from "twilio";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { twilioCredentialsKey } from "../quickTests/populateCredentials.js";

let twilioCredentials = null;
let twilioClient = null;

const getTwilioCredentials = async () => {
  twilioCredentials ||= await downloadFromAWS(
    twilioCredentialsKey,
    "apicredentials"
  );
  return twilioCredentials;
};

const getTwilioClient = async () => {
  if (!twilioCredentials) {
    try {
      twilioCredentials ||= await getTwilioCredentials();
      twilioClient = new twilio(
        twilioCredentials.accountSid,
        twilioCredentials.authToken
      );
    } catch (e) {
      throw new Error(e);
    }
  }
  return twilioClient;
};

const sendText = (params) => {
  if (params.calendar === "Api tester") {
    console.log(
      `sending text to Alfred in ${process.env.NODE_ENV} mode:`,
      params
    );
    getTwilioClient()
      .then((twilioClient) => {
        return twilioClient.messages.create({
          to: "5122990497",
          from: "+17863479153",
          body: params.message,
        });
      })
      .then((message) => console.log(message));
  } else {
    console.log("sending text:", params);
    if (process.env.NODE_ENV === "production") {
      getTwilioClient()
        .then((twilioClient) => {
          return twilioClient.messages.create({
            to: params.number,
            from: "+17863479153",
            body: params.message,
          });
        })
        .then((message) => console.log(message));
    } else if (NODE_ENV === "integration") {
      console.log("no real texts: integration mode");
    }
  }
};
export default sendText;
