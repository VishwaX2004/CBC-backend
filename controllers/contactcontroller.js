import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// =====================
// SEND CONTACT MESSAGE
// =====================
export const sendContactMessage = async (req, res) => {
  try {
    // ===============================
    // Check Authorization header
    // ===============================
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // ===============================
    // Verify JWT
    // ===============================
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token. Please login again." });
    }

    const userEmail = decoded.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Invalid token: email not found" });
    }

    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    // ===============================
    // Configure Nodemailer transporter
    // ===============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail account
        pass: process.env.EMAIL_PASS, // Gmail App password
      },
    });

    // ===============================
    // Prepare email
    // ===============================
    const mailOptions = {
      from: userEmail,
      to: "vishwapramuditha505@gmail.com",
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // ===============================
    // Send email
    // ===============================
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};
