import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-64c5bfad/health", (c) => {
  return c.json({ status: "ok" });
});

// Send verification email endpoint
app.post("/make-server-64c5bfad/send-verification-email", async (c) => {
  try {
    const { email, username, password, verificationCode } = await c.req.json();

    if (!email || !username || !password || !verificationCode) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("Error: RESEND_API_KEY environment variable not set");
      return c.json({ error: "Email service not configured" }, 500);
    }

    // Send email using Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "DailyFlow <onboarding@resend.dev>",
        to: [email],
        subject: "Verify Your DailyFlow Account",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .code-box { background: white; border: 2px solid #ec4899; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .verification-code { font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 8px; font-family: monospace; }
                .info-box { background: white; border-left: 4px solid #ec4899; padding: 15px; margin: 20px 0; }
                .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">Welcome to DailyFlow!</h1>
                  <p style="margin: 10px 0 0 0;">Verify your email to get started</p>
                </div>
                <div class="content">
                  <p>Hi <strong>${username}</strong>,</p>
                  <p>Thank you for signing up for DailyFlow! To activate your account, please use the verification code below:</p>

                  <div class="code-box">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
                    <div class="verification-code">${verificationCode}</div>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">This code expires in 5 minutes</p>
                  </div>

                  <div class="info-box">
                    <p style="margin: 0 0 10px 0;"><strong>Your Account Details:</strong></p>
                    <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                  </div>

                  <p style="margin-top: 20px;">If you didn't create this account, you can safely ignore this email.</p>

                  <div class="footer">
                    <p>This is an automated message from DailyFlow.</p>
                    <p>&copy; 2026 DailyFlow. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Resend API error:", result);
      return c.json({ error: result.message || "Failed to send email" }, 500);
    }

    console.log("Email sent successfully:", result);
    return c.json({ success: true, emailId: result.id });
  } catch (error) {
    console.log("Error sending verification email:", error);
    return c.json({ error: "Failed to send verification email" }, 500);
  }
});

Deno.serve(app.fetch);