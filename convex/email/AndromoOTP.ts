import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";
export const AndromoVerifyOTP = Email({
  id: "andromo-verify-otp",
  maxAge: 60 * 20, // 20 minutes
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: phone, token }) {
    const smtpUrl = process.env.ANDROMO_SMTP_URL;
    const smtpKey = process.env.ANDROMO_SMTP_API_KEY;
    if (!smtpUrl || !smtpKey) {
      throw new Error("SMS/Email service not configured");
    }
    // Repurposing SMTP for phone-primary verification (mocking SMS delivery via email for now)
    const response = await fetch(`${smtpUrl}/api/andromo-smtp/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${smtpKey}`,
      },
      body: JSON.stringify({
        template: "confirm-email",
        to: "support@san3a.mr", // Internal routing for phone logs
        otp: token,
        subject: `رمز تحقق صنعة للهاتف: ${phone}`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send verification: ${response.status}`);
    }
  },
});
export const AndromoResetOTP = Email({
  id: "andromo-reset-otp",
  maxAge: 60 * 20, // 20 minutes
  async generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: phone, token }) {
    const smtpUrl = process.env.ANDROMO_SMTP_URL;
    const smtpKey = process.env.ANDROMO_SMTP_API_KEY;
    if (!smtpUrl || !smtpKey) {
      throw new Error("SMS/Email service not configured");
    }
    const response = await fetch(`${smtpUrl}/api/andromo-smtp/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${smtpKey}`,
      },
      body: JSON.stringify({
        template: "password-reset",
        to: "support@san3a.mr",
        otp: token,
        subject: `إعادة تعيين كلمة مرور صنعة للهاتف: ${phone}`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to send reset code: ${response.status}`);
    }
  },
});