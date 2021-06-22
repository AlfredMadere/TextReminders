import { google } from "googleapis";
import { downloadFromAWS } from "../drivers/awsDriver.js";
import { googleSheetsCredentialsKey } from "../quickTests/populateCredentials.js";
const { OAuth2 } = google.auth;

const spreadsheets = {
  oldTutor: {
    spreadsheetId: "15aejZCoyUjoSl83goXfejzAyAGOMbOHDPzSnVlQ8BJ4",
    range: "Sheet1!A2:E11",
  },
  oldStudent: {
    spreadsheetId: "1qG00kP86res-XgfH0fLlube8mWBsHMPS_DDHVAuKarw",
    range: "Sheet1!A3:H",
  },
  student: {
    spreadsheetId: "1KLdLm1a9EExiV-LuADff8dnMX4nqIUhRJlToeFbegFk",
    range: "Students!C4:12",
    majorDimension: "COLUMNS",
  },
  tutor: {
    spreadsheetId: "1KLdLm1a9EExiV-LuADff8dnMX4nqIUhRJlToeFbegFk",
    range: "Tutors!C4:11",
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
        gSheets.spreadsheets.values.get(spreadsheets[modelType], (err, res) => {
          if (err) {
            reject("The API returned an error: " + err);
          } else {
            const columns = res.data.values.map((column) => {
              return column.map((cell) => {
                return cell === "" ? undefined : cell;
              });
            });
            resolve(columns);
          }
        });
      });
    })
    .catch((err) => console.log(err));
};

const getDataFromSheet = async (sheetId, range) => {
  try {
    const gSheets = await getGoogleSheets();
    const request = {
      spreadsheetId: sheetId,
      range: range,
      valueRenderOption: "FORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    };
    const response = (await gSheets.spreadsheets.values.get(request)).data;
    return response.values;
  } catch (e) {
    throw new Error("Error getting data from sheet: ", e);
  }
};

const getSheetIdFromURL = (url) => {
  //https://docs.google.com/spreadsheets/d/1RM_pqGz3QN3lhbOluSP7wdPP_EkKFJByTywV_cmFaiA/edit#gid=0
  //https://docs.google.com/spreadsheets/d/1Am3uQeGI9RjRUrmN_kAmi8aV06QeDUTMFP580o4U0XE/edit#gid=0
  if (url) {
    let matches = url.match(/spreadsheets\/d\/(?<sheetId>\w+)\//);
    return matches ? matches.groups.sheetId : "";
  } else {
    return;
  }
};

export default getDataFor;
export { getDataFromSheet, getSheetIdFromURL };
