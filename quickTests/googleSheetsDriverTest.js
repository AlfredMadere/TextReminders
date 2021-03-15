import { google } from "googleapis";
import { downloadCredentialsFromAWS } from "../drivers/awsDriver.js";
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
};

let googleSheets = null;
let googleSheetsCredentials = null;

const getGoogleSheetsCredentials = async () => {
  googleSheetsCredentials ||= await downloadCredentialsFromAWS(
    "testSheetCreds"
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
        gSheets.spreadsheets.values.get(spreadsheets[modelType], (err, res) => {
          if (err) {
            reject("The API returned an error: " + err);
          } else {
            const rows = res.data.values.map((row) => {
              return row.map((cell) => {
                return cell === "" ? undefined : cell;
              });
            });
            resolve(rows);
          }
        });
      });
    })
    .catch((err) => console.log(err));
};

getDataFor("tutor").then((rows) => console.log("rows", rows));
