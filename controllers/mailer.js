import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Gmail SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD, // ✅ FIXED (MATCH .env)
  },
});

export default transporter;
