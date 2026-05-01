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

    // Send email using Resend API - [TRUNCATED DUE TO LENGTH]
