import { promises as fs } from "fs";
import AWS from "aws-sdk";
// Set the region
AWS.config.update({ region: "us-east-2" });

// Create S3 service object
var s3 = new AWS.S3({ apiVersion: "2006-03-01", region: "us-west-2" });

const readLocalFile = async (path) => {
  console.log("path", path);
  try {
    const jsonFileContents = await fs.readFile(path);
    return JSON.parse(jsonFileContents);
  } catch (e) {
    throw new Error(`had an issue reading json file: ${e.message}`);
  }
};
const writeS3File = async (params) => {
  try {
    const data = await s3.putObject(params).promise();
    return data;
  } catch (e) {
    throw new Error(`Could not write file to s3: ${e.message}`);
  }
};

const readS3File = async (params) => {
  try {
    const data = s3.getObject(params).promise();
    return data;
  } catch (e) {
    throw new Error(`Could not read file from s3: ${e.message}`);
  }
};

//expereimentWithPromiseFs().then((res) => console.log(res));
const uploadToAWS = async (content, key, bucket) => {
  try {
    await writeS3File({
      Key: key,
      Body: JSON.stringify(content),
      Bucket: bucket,
    });
  } catch (e) {
    throw new Error(`Had an issue uploading Creds to AWS: ${e.message}`);
  }
};

const downloadFromAWS = async (key, bucket) => {
  try {
    const jsonCreds = await readS3File({ Key: key, Bucket: bucket });
    return JSON.parse(jsonCreds.Body.toString("utf-8"));
  } catch (e) {
    console.log(e);
    if (e.statusCode === 404) {
      console.log(
        `In "downloadFromAWS()": Didn't find specified key ${key}, returned {}`
      );
      return {};
    } else {
      throw new Error(`Had an issue dowloading Creds from AWS: ${e.message}`);
    }
  }
};

export default uploadToAWS;

export { downloadFromAWS, readLocalFile, writeS3File };
