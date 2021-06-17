import uploadToAWS, {
  listObjects,
  downloadFromAWS,
} from "../drivers/awsDriver.js";
import SessionLog from "./SessionLog.js";
const S3_LOGGER_BUCKET = "loggerappcache";

var theOneCache = null;

class S3LogCache {
  async initCache() {
    if (!this.writeThroughCache) {
      this.writeThroughCache = {};
      let awsObjects = await listObjects({ Bucket: S3_LOGGER_BUCKET });
      awsObjects.Contents.forEach((obj) => {
        this.writeThroughCache[obj.Key] = null;
      });
    }
  }
  async getObj(key) {
    let val = this.writeThroughCache[key];
    if (val === null || val === undefined) {
      val = await downloadFromAWS(key, S3_LOGGER_BUCKET);
      this.writeThroughCache[key] = val;
    }
    return val === {} ? null : val; // Translate 404 to null so we don't check again
  }

  async putObj(key, data) {
    if (
      this.writeThroughCache[key] &&
      JSON.stringify(this.writeThroughCache[key]) === JSON.stringify(data)
    ) {
      return;
    } else {
        console.log("actually writing to s3log remote");
      return uploadToAWS(data, key, S3_LOGGER_BUCKET).then(() => {
        this.writeThroughCache[key] = data;
      });
    }
  }

  hasKey(key) {
    let val = this.writeThroughCache[key];
    return !(val === {} || val === undefined);
  }

  async getSessionLog(key) {
    let obj = await getObj(key);
    if (obj) {
      return SessionLog.fromBareObj(obj);
    } else {
      return null;
    }
  }
}

S3LogCache.initSingleton = async () => {
  if (!theOneCache) {
    theOneCache = new S3LogCache();
    await theOneCache.initCache();
  }
  return theOneCache;
};

S3LogCache.singleton = () => {
  if (!theOneCache) {
    throw new Error("singleton has not been inited");
  }
  return theOneCache;
};
export default S3LogCache;
