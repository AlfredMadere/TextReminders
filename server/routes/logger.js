import express from "express";
const router = express.Router();
import { getSessionInfo } from "../controllers/loggerController.js";
import { postLogInfo } from "../controllers/loggerController.js";

router.get("/", getSessionInfo);
router.post("/", postLogInfo);

export default router;
