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
      "only sending texts to alfred because calendar is",
      params.calendar
    );
    console.log("sending text to Alfred:", params);
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
    getTwilioClient()
      .then((twilioClient) => {
        return twilioClient.messages.create({
          to: params.number,
          from: "+17863479153",
          body: params.message,
        });
      })
      .then((message) => console.log(message));
  }
};
export default sendText;
