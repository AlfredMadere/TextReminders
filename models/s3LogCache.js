import uploadToAWS, {listObjects, downloadFromAWS} from "../drivers/awsDriver.js"
import SessionLog from "./SessionLog.js";
const S3_LOGGER_BUCKET = "loggerappcache";
class s3LogCache {
    constructor () {
        this.writeThroughCache = {};
        listObjects({Bucket: S3_LOGGER_BUCKET}).Contents.forEach((obj) => {
            this.writeThroughCache[obj.Key] = null;
        })
    }
    async getObj (key) {
        let val = this.writeThroughCache[key];
        if (val === null) {
            val = await downloadFromAWS(key, S3_LOGGER_BUCKET);
            this.writeThroughCache[key] = val;
        }
        return val === {} ? null : val; // Translate 404 to null so we don't check again
    }
    async putObj (key, data) {
        return uploadToAWS(data, key, S3_LOGGER_BUCKET).then(() => {
            this.writeThroughCache[key] = data;
        });
    }
    hasKey(key){
        let val = this.writeThroughCache[key];
        return !(val === {} || val === null || val === undefined);
    }
    async getSessionLog (key) {
        let obj = await getObj(key);
        if(obj) {
            return SessionLog.fromBareObj(obj);
        }else{
            return null;
        }
    }
}