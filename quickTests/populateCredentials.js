import uploadToAWS from "../drivers/awsDriver.js";
import { readLocalFile, downloadFromAWS } from "../drivers/awsDriver.js";

const googleCalCredentialsKey = "googleCalInstalledCreds";
const googleSheetsCredentialsKey = "googleSheetsInstalledCreds";
const twilioCredentialsKey = "twilioInstalledCreds";
const textReminderCacheKey = "textReminderCache";
const credentialsBucket = "apicredentials";
const textCacheBucket = "reminderappcache";

const chung = "this is stupid to satisfy default export";

const populateShit = () => {
  readLocalFile("../credentials/googleCalendar/googleCalendarCredentials.json")
    .then((json) =>
      uploadToAWS(json, googleCalCredentialsKey, credentialsBucket)
    )
    .then(() => downloadFromAWS(googleCalCredentialsKey, credentialsBucket))
    .then((res) => console.log(res));

  readLocalFile("../credentials/googleSheets/googleSheetsCredentials.json")
    .then((json) =>
      uploadToAWS(json, googleSheetsCredentialsKey, credentialsBucket)
    )
    .then(() => downloadFromAWS(googleSheetsCredentialsKey, credentialsBucket))
    .then((res) => console.log(res));

  readLocalFile("../credentials/twilio/twilioCredentials.json")
    .then((json) => uploadToAWS(json, twilioCredentialsKey, credentialsBucket))
    .then(() => downloadFromAWS(twilioCredentialsKey, credentialsBucket))
    .then((res) => console.log(res));

  readLocalFile("../lookUpTables/sentReminders.json")
    .then((json) => uploadToAWS(json, textReminderCacheKey, textCacheBucket))
    .then(() => downloadFromAWS(textReminderCacheKey, textCacheBucket))
    .then((res) => console.log(res));
};

export default chung;
export {
  googleCalCredentialsKey,
  googleSheetsCredentialsKey,
  twilioCredentialsKey,
  textReminderCacheKey,
};
