import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
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

// Check if user exists endpoint
app.post("/make-server-64c5bfad/check-user-exists", async (c) => {
  try {
    const { username, email } = await c.req.json();

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Error: Supabase credentials not configured");
      return c.json({ error: "Server not configured properly" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch all users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log("Error fetching users:", error);
      return c.json({ error: "Failed to check user" }, 500);
    }

    // Check if username or email exists
    const usernameExists = users.some(u => u.user_metadata?.username === username);
    const emailExists = users.some(u => u.email === email);

    if (usernameExists) {
      return c.json({ error: "Username already taken" }, 400);
    }

    if (emailExists) {
      return c.json({ error: "Email already registered" }, 400);
    }

    return c.json({ available: true });
  } catch (error) {
    console.log("Error checking user exists:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Send signup verification email
app.post("/make-server-64c5bfad/send-signup-verification", async (c) => {
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
        subject: "Verify Your DailyFlow Account - Action Required",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
                  background: linear-gradient(135deg, #fce7f3 0%, #e9d5ff 100%);
                }
                .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background: white;
                  border-radius: 20px;
                  overflow: hidden;
                  box-shadow: 0 20px 60px rgba(236, 72, 153, 0.3);
                }
                .header {
                  background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
                  color: white;
                  padding: 40px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 32px;
                  font-weight: 700;
                }
                .header p {
                  margin: 10px 0 0 0;
                  opacity: 0.95;
                  font-size: 16px;
                }
                .content {
                  padding: 40px;
                }
                .code-box {
                  background: linear-gradient(135deg, #fce7f3 0%, #e9d5ff 100%);
                  border: 3px solid #ec4899;
                  border-radius: 12px;
                  padding: 30px;
                  margin: 30px 0;
                  text-align: center;
                }
                .verification-code {
                  font-size: 48px;
                  font-weight: 900;
                  background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  background-clip: text;
                  letter-spacing: 12px;
                  font-family: 'Courier New', monospace;
                  margin: 10px 0;
                }
                .info-box {
                  background: #f9fafb;
                  border-left: 4px solid #ec4899;
                  padding: 20px;
                  margin: 25px 0;
                  border-radius: 8px;
                }
                .info-row {
                  display: flex;
                  padding: 12px 0;
                  border-bottom: 1px solid #e5e7eb;
                }
                .info-row:last-child {
                  border-bottom: none;
                }
                .info-label {
                  font-weight: 600;
                  color: #ec4899;
                  min-width: 100px;
                }
                .info-value {
                  color: #374151;
                  font-family: 'Courier New', monospace;
                }
                .footer {
                  text-align: center;
                  color: #6b7280;
                  font-size: 13px;
                  padding: 30px;
                  background: #f9fafb;
                  border-top: 1px solid #e5e7eb;
                }
                .warning {
                  background: #fef3c7;
                  border: 2px solid #f59e0b;
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
                  font-size: 14px;
                  color: #92400e;
                }
                .icon {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  margin-right: 8px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎯 Welcome to DailyFlow!</h1>
                  <p>Your daily task management companion</p>
                </div>
                <div class="content">
                  <p style="font-size: 18px; color: #374151;">Hi <strong>${username}</strong>,</p>
                  <p style="color: #6b7280;">Thank you for signing up for DailyFlow! To activate your account and start organizing your tasks, please use the verification code below:</p>

                  <div class="code-box">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">Your Verification Code</p>
                    <div class="verification-code">${verificationCode}</div>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 13px;">⏰ This code expires in 5 minutes</p>
                  </div>

                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Enter this code in the DailyFlow app to complete your registration. Never share this code with anyone.
                  </div>

                  <div class="info-box">
                    <p style="margin: 0 0 15px 0; font-weight: 700; color: #111827; font-size: 16px;">📋 Your Account Details</p>
                    <div class="info-row">
                      <span class="info-label">Username:</span>
                      <span class="info-value">${username}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Email:</span>
                      <span class="info-value">${email}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Password:</span>
                      <span class="info-value">${password}</span>
                    </div>
                    <p style="margin: 15px 0 0 0; font-size: 13px; color: #6b7280;">💡 Save these credentials in a secure location</p>
                  </div>

                  <p style="color: #6b7280; margin-top: 30px;">Once verified, you'll be able to:</p>
                  <ul style="color: #6b7280; line-height: 1.8;">
                    <li>Create and manage unlimited tasks</li>
                    <li>Set priorities and due dates</li>
                    <li>Track your progress in real-time</li>
                    <li>Organize your daily workflow efficiently</li>
                  </ul>

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">If you didn't create this account, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p style="margin: 0 0 10px 0;">This is an automated message from <strong>DailyFlow</strong></p>
                  <p style="margin: 0; color: #9ca3af;">&copy; 2026 DailyFlow. All rights reserved.</p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af;">Organize. Prioritize. Achieve.</p>
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

// Create verified user endpoint
app.post("/make-server-64c5bfad/create-verified-user", async (c) => {
  try {
    const { email, username, password } = await c.req.json();

    if (!email || !username || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Error: Supabase credentials not configured");
      return c.json({ error: "Server not configured properly" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        username: username,
      },
    });

    if (error) {
      console.log("Error creating user:", error);
      return c.json({ error: error.message }, 500);
    }

    console.log("User created successfully:", data.user.id);
    return c.json({ success: true, userId: data.user.id });
  } catch (error) {
    console.log("Error in create-verified-user endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Lookup email by username endpoint
app.post("/make-server-64c5bfad/lookup-email-by-username", async (c) => {
  try {
    const { username } = await c.req.json();

    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    const { createClient } = await import("jsr:@supabase/supabase-js@2");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Error: Supabase credentials not configured");
      return c.json({ error: "Server not configured properly" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch all users and find by username in metadata
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log("Error fetching users:", error);
      return c.json({ error: "User not found" }, 404);
    }

    // Find user with matching username
    const user = users.find(u => u.user_metadata?.username === username);

    if (!user || !user.email) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ email: user.email });
  } catch (error) {
    console.log("Error in lookup-email-by-username endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin endpoint to list all users
app.get("/make-server-64c5bfad/admin/users", async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Error: Supabase credentials not configured");
      return c.json({ error: "Server not configured properly" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch all users using admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }

    // Format user data
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'Unknown',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      emailConfirmed: user.email_confirmed_at !== null,
    }));

    return c.json({ users: formattedUsers });
  } catch (error) {
    console.log("Error in admin/users endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Admin endpoint to delete a user
app.delete("/make-server-64c5bfad/admin/users/:userId", async (c) => {
  try {
    const { createClient } = await import("jsr:@supabase/supabase-js@2");
    const userId = c.req.param("userId");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.log("Error: Supabase credentials not configured");
      return c.json({ error: "Server not configured properly" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Delete user using admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log("Error deleting user:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error in delete user endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
