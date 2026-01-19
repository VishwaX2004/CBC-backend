import nodemailer from "nodemailer";

// =====================
// SEND CONTACT MESSAGE
// =====================
export const sendContactMessage = async (req, res) => {
  try {
    // user already verified by middleware
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userEmail = req.user.email;
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: userEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p>${message}</p>
      `,
    });

    res.json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
