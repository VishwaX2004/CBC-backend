import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// ===============================
// SEND CONTACT MESSAGE
// ===============================
export const sendContactMessage = async (req, res) => {
  try {
    // ===============================
    // Check Authorization Header
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
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userEmail = decoded.email;
    const userNameFromToken = decoded.name;

    if (!userEmail) {
      return res.status(400).json({ message: "User email not found in token" });
    }

    // ===============================
    // Validate Body
    // ===============================
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    // ===============================
    // Nodemailer Transport (Gmail)
    // ===============================
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // MUST be false for Render
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Fix Render timeout issues
      },
    });

    // ===============================
    // Email Content
    // ===============================
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // You receive the message
      replyTo: userEmail, // Reply goes to user
      subject: `📩 New Contact Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr />
          <small>Sent from your website contact form</small>
        </div>
      `,
    };

    // ===============================
    // Send Email
    // ===============================
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};
