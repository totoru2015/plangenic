import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPilotAccess(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return "Please log in to generate a plan.";

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.email) return "Your session has expired. Please log in again.";

  const email = data.user.email.toLowerCase();
  const { data: allowed } = await supabaseAdmin
    .from("allowed_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!allowed) return "This account isn't on the pilot access list yet.";
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accessError = await checkPilotAccess(req);
  if (accessError) {
    return res.status(403).json({ error: accessError });
  }

  const { system, userContent } = req.body;

  if (!system || !userContent) {
    return res.status(400).json({ error: "Missing system or userContent" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured on server." });
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: userContent }],
      }),
    });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Anthropic API." });
  }

  if (!anthropicRes.ok) {
    let detail = "";
    try {
      const j = await anthropicRes.json();
      detail = j?.error?.message || j?.error?.type || "";
    } catch (_) {}
    return res.status(anthropicRes.status).json({
      error: `Anthropic error ${anthropicRes.status}${detail ? ": " + detail : ""}`,
    });
  }

  const data = await anthropicRes.json();
  const text = (data.content || [])
    .map((b) => (b.type === "text" ? b.text : ""))
    .filter(Boolean)
    .join("\n");

  return res.status(200).json({ text });
}
