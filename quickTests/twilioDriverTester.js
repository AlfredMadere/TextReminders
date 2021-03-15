import twilio from "twilio";
const twilioClient = new twilio(
  "ACb39decff641bf7d83d496220966c5d9c",
  "96bec47ee7b42b7a8f68d7daa33bb46a"
);
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { twilioCredentialsKey } from "../quickTests/populateCredentials.js";

let twilioCredentials = null;

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
      console.log(twilioCredentials);
      twilioClient = twilio(twilioCredentials.accountSid)(
        twilioCredentials.authToken
      );
    } catch (e) {
      throw new Error(e);
    }
  }
  return twilioClient;
};

const sendText = (params) => {
  return twilioClient.messages
    .create({
      to: params.number,
      from: "+17863479153",
      body: params.message,
    })
    .then((message) => console.log(message));
};

sendText({
  number: 5122990497,
  message: "this is chump test",
  attendeeType: "parent",
  attendee: "Alfred Madere",
});

export default sendText;
