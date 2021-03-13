import fs from "fs";
import myDefaultFunc from "./exportMulti.js";
import { myFunc, mySecondFunc } from "./exportMulti.js";

myDefaultFunc();
myFunc();
mySecondFunc();
//cannot import json as module in es6 without babel
//use readFileSync to load in json files - this will later be replaced by async s3 actions anywas... so maybe actually use readFile and just deal with the callback bs
