import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    // ✅ Ensure user is logged in with email
    if (!req.user?.email) {
      return res
        .status(401)
        .json({ message: "Login with email to send contact message" });
    }

    const userEmail = req.user.email; // ✅ FIX
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    // ✅ Gmail transporter (clean & stable)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    });

    // (Optional) Verify connection
    await transporter.verify();

    await transporter.sendMail({
      from: `"Crystal Beauty Clear" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: userEmail,
      subject: `📩 Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr />
        <small>Sent from your website</small>
      `,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
