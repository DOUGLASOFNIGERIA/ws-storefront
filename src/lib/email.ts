import nodemailer from "nodemailer";

export interface EmailDeliveryResult {
  ok: boolean;
}

function otpTemplate(name: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; background: #171210; color: #f6f0e7; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto;">
        <p style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #c8a66b;">WS · Lagos</p>
        <h1 style="font-size: 34px; margin: 12px 0 24px;">Verify your email</h1>
        <p style="line-height: 1.7; color: #d8cdc2;">Hello ${name}, use this one-time code to confirm your WS account.</p>
        <p style="margin: 32px 0; font-family: Georgia, serif; font-size: 42px; letter-spacing: 0.18em; color: #c8a66b;">${otp}</p>
        <p style="font-size: 12px; color: #9b8f85;">This code expires in 10 minutes. If you did not create a WS account, you can ignore this email.</p>
      </div>
    </div>
  `;
}

export async function sendVerificationOtp(
  email: string,
  name: string,
  otp: string,
): Promise<EmailDeliveryResult> {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT?.trim() || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return { ok: false };

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM?.trim() || `WS Storefront <${user}>`,
      to: email,
      subject: "Your WS verification code",
      text: `Hello ${name}, your WS verification code is ${otp}. It expires in 10 minutes.`,
      html: otpTemplate(name, otp),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  } finally {
    transporter.close();
  }
}
