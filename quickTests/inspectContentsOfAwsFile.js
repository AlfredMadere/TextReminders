import uploadToAWS from "../drivers/awsDriver.js";
import { readLocalFile, downloadFromAWS } from "../drivers/awsDriver.js";

downloadFromAWS("textReminderCache", "reminderappcache").then((res) =>
  console.log(res)
);
