import { google } from "googleapis";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { googleSheetsCredentialsKey } from "./populateCredentials.js";
const { OAuth2 } = google.auth;

const spreadsheets = {
  tutor: {
    spreadsheetId: "15aejZCoyUjoSl83goXfejzAyAGOMbOHDPzSnVlQ8BJ4",
    range: "Sheet1!A2:E11",
  },
  student: {
    spreadsheetId: "1qG00kP86res-XgfH0fLlube8mWBsHMPS_DDHVAuKarw",
    range: "Sheet1!A3:H",
  },
  newStudent: {
    spreadsheetId: "1KLdLm1a9EExiV-LuADff8dnMX4nqIUhRJlToeFbegFk",
    range: "Students!C7:M12",
    majorDimension: "COLUMNS",
  },
};
let googleSheets = null;
let googleSheetsCredentials = null;

const getGoogleSheetsCredentials = async () => {
  googleSheetsCredentials ||= await downloadFromAWS(
    googleSheetsCredentialsKey,
    "apicredentials"
  );
  return googleSheetsCredentials;
};

const getGoogleSheets = async () => {
  if (!googleSheets) {
    try {
      googleSheetsCredentials ||= await getGoogleSheetsCredentials();
      const oAuth2Client = new OAuth2(
        googleSheetsCredentials.clientId,
        googleSheetsCredentials.clientSecret
      );
      oAuth2Client.setCredentials({
        refresh_token: googleSheetsCredentials.refreshToken,
      });
      googleSheets = google.sheets({ version: "v4", auth: oAuth2Client });
    } catch (e) {
      throw new Error(e);
    }
  }
  return googleSheets;
};

const getDataFor = (modelType) => {
  return getGoogleSheets()
    .then((gSheets) => {
      return new Promise((resolve, reject) => {
        if (!spreadsheets[modelType]) {
          throw "invalid spreadsheet modeltype " + modelType;
        }
        console.log(gSheets.spreadsheets.values);
        gSheets.spreadsheets.values.get(spreadsheets[modelType], (err, res) => {
          if (err) {
            reject("The API returned an error: " + err);
          } else {
            const data = res.data;
            const rows = res.data.values.map((row) => {
              return row.map((cell) => {
                return cell === "" ? undefined : cell;
              });
            });
            resolve(data);
          }
        });
      });
    })
    .catch((err) => console.log(err));
};

export default getDataFor;
