import express from "express";
import { sendContactMessage } from "../controllers/contactcontroller.js";


const Contactrouter = express.Router();

// POST /api/contact
Contactrouter.post("/", sendContactMessage);

export default Contactrouter


