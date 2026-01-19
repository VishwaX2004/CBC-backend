import express from "express";
import { sendContactMessage } from "../controllers/contactcontroller.js";

const Contactrouter = express.Router();

Contactrouter.post("/", sendContactMessage);

export default Contactrouter;
