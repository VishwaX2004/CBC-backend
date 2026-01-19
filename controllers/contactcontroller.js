import transporter from "./mailer.js";

/* =====================
   SEND CONTACT MESSAGE
===================== */
export const sendContactMessage = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, message } = req.body;
    const userEmail = req.user.email;

    if (!name?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "Name and message are required",
      });
    }

    await transporter.sendMail({
      from: `"Crystal Beauty Clear" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Admin inbox
      replyTo: userEmail,
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif; line-height:1.6">
          <h2>📩 New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <hr />
          <p>${message.replace(/\n/g, "<br/>")}</p>
        </div>
      `,
    });

    res.json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};
