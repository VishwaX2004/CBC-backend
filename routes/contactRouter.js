import express from "express";
import { sendContactMessage } from "../controllers/contactcontroller.js";


const router = express.Router();

// POST /api/contact
router.post("/", sendContactMessage);

export default router;
