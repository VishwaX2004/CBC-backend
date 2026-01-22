import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendContactMessage = async (req, res) => {
  try {
    if (!req.user?.email) {
      return res
        .status(401)
        .json({ message: "Login with email to send contact message" });
    }

    const { name, message } = req.body;
    const userEmail = req.user.email;

    if (!name || !message) {
      return res.status(400).json({ message: "Name and message are required" });
    }

    await resend.emails.send({
     from: "Crystal Beauty Clear <onboarding@resend.dev>",
      to: [process.env.EMAIL_USER],
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
