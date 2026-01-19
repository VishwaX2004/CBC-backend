import express from "express";
import { sendContactMessage } from "../controllers/contactcontroller.js";


const router = express.Router();

// POST /api/contact
router.post("/", sendContactMessage);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> b82317c2b5cb2acfab7fe6cb1b1b6437d3a02eda
