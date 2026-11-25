export interface EmailDeliveryResult {
  ok: boolean;
  url: string;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<EmailDeliveryResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") || "http://localhost:3000";
  const url = `${appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "WS Storefront <onboarding@resend.dev>";

  if (!apiKey) return { ok: false, url };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Verify your WS account",
        html: `
          <div style="font-family: Arial, sans-serif; background: #171210; color: #f6f0e7; padding: 40px 20px;">
            <div style="max-width: 560px; margin: 0 auto;">
              <p style="font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: #c8a66b;">WS · Lagos</p>
              <h1 style="font-size: 34px; margin: 12px 0 24px;">Verify your email</h1>
              <p style="line-height: 1.7; color: #d8cdc2;">Hello ${name}, confirm your address to finish setting up your WS account and start leaving product reviews.</p>
              <p style="margin: 28px 0;"><a href="${url}" style="background: #c8a66b; color: #171210; padding: 14px 22px; text-decoration: none; font-weight: 700;">Verify email</a></p>
              <p style="font-size: 12px; color: #9b8f85;">This link expires in 24 hours. If you did not create a WS account, you can ignore this email.</p>
            </div>
          </div>
        `,
      }),
      cache: "no-store",
    });

    return { ok: response.ok, url };
  } catch {
    return { ok: false, url };
  }
}
