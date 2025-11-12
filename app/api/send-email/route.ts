import { type NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  const { email, subject, message } = await request.json();

  // Note: It's best practice to use a non-personal email for the 'user'
  // and to ensure the GMAIL_APP_PASSWORD is kept secret in environment variables.
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${email}" <${process.env.GMAIL_EMAIL}>`, // Use authenticated user as sender
      to: "kaioai.team@gmail.com", // The destination email
      replyTo: email, // Set the Reply-To to the user's email
      subject: `Contact Form: ${subject}`,
      html: `<p>You have a new contact form submission</p><br>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>`,
    });

    return NextResponse.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email" },
      { status: 500 }
    );
  }
}
