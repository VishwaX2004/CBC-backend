import express from "express";
import { sendContactMessage } from "../controllers/contactcontroller.js";

const contactRouter = express.Router();

contactRouter.post("/", sendContactMessage);

export default contactRouter;
