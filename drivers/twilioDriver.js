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
  if (process.env.TWILIO_ACTIVE === 'true') {
    getTwilioClient()
      .then((twilioClient) => {
        return twilioClient.messages.create({
          to: params.number,
          from: "+17863479153",
          body: params.message,
        });
      })
      .catch((err) => console.log(err));
  }
};
export default sendText;
