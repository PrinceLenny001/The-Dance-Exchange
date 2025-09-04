import { Resend } from "resend";
import { WelcomeEmail } from "./templates/WelcomeEmail";
import { PasswordResetEmail } from "./templates/PasswordResetEmail";
import { createElement } from "react";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.log("Resend API key not configured, skipping email send");
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
      to,
      subject: "Welcome to Second Act!",
      react: createElement(WelcomeEmail, { name }),
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  if (!resend) {
    console.log("Resend API key not configured, skipping email send");
    return;
  }

  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password/${resetToken}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
      to,
      subject: "Reset Your Password - Second Act",
      react: createElement(PasswordResetEmail, { name, resetLink }),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}
