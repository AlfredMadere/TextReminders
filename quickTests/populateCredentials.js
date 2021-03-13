import uploadToAWS from "../drivers/awsDriver.js";
import {
  readLocalFile,
  downloadCredentialsFromAWS,
} from "../drivers/awsDriver.js";

readLocalFile("../credentials/googleCalendar/googleCalendarCredentials.json")
  .then((json) => uploadToAWS(json, "googleCalInstalledCreds"))
  .then(() => downloadCredentialsFromAWS("googleCalInstalledCreds"))
  .then((res) => console.log(res));

readLocalFile("../credentials/googleSheets/googleSheetsCredentials.json")
  .then((json) => uploadToAWS(json, "googleSheetsInstalledCreds"))
  .then(() => downloadCredentialsFromAWS("googleSheetsInstalledCreds"))
  .then((res) => console.log(res));
