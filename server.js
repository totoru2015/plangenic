import { createServer } from "http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
try {
  const env = readFileSync(join(__dirname, ".env"), "utf8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
} catch (_) {}

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

const PORT = 3001;
let requestCounter = 0;

const server = createServer(async (req, res) => {
  const reqId = ++requestCounter;

  // Force connection close on every response — eliminates any
  // keep-alive socket reuse hangs between sequential requests.
  res.setHeader("Connection", "close");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/generate") {
    const startedAt = Date.now();
    console.log(`[req ${reqId}] received POST /api/generate`);

    let body = "";
    req.on("data", (c) => (body += c));

    req.on("error", (err) => {
      console.error(`[req ${reqId}] request stream error:`, err.message);
    });

    req.on("end", async () => {
      console.log(`[req ${reqId}] body received, length=${body.length}`);
      try {
        const accessError = await checkPilotAccess(req);
        if (accessError) {
          console.warn(`[req ${reqId}] access denied: ${accessError}`);
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: accessError }));
          return;
        }

        const { system, userContent, maxTokens } = JSON.parse(body);
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          console.error(`[req ${reqId}] no API key configured`);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No API key" }));
          return;
        }
        if (!system || !userContent) {
          console.error(`[req ${reqId}] missing system or userContent`);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing system or userContent" }));
          return;
        }

        console.log(`[req ${reqId}] calling Anthropic, maxTokens=${maxTokens || 8000}, promptLen=${userContent.length}`);

        const anthropicController = new AbortController();
        const anthropicTimer = setTimeout(() => anthropicController.abort(), 240000);

        let r;
        try {
          r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-5",
              max_tokens: maxTokens || 8000,
              system,
              messages: [{ role: "user", content: userContent }],
            }),
            signal: anthropicController.signal,
          });
        } catch (fetchErr) {
          clearTimeout(anthropicTimer);
          console.error(`[req ${reqId}] fetch to Anthropic failed after ${Date.now() - startedAt}ms:`, fetchErr.message);
          res.writeHead(502, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Could not reach Anthropic API: " + fetchErr.message }));
          return;
        }
        clearTimeout(anthropicTimer);

        console.log(`[req ${reqId}] Anthropic responded with status ${r.status} after ${Date.now() - startedAt}ms`);

        const data = await r.json();
        if (!r.ok) {
          console.error(`[req ${reqId}] Anthropic error:`, JSON.stringify(data?.error || data));
          res.writeHead(r.status, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: data?.error?.message || "Anthropic error" }));
          return;
        }

        const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n");
        console.log(`[req ${reqId}] success — response length=${text.length}, total time=${Date.now() - startedAt}ms`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ text }));
      } catch (e) {
        console.error(`[req ${reqId}] unhandled error after ${Date.now() - startedAt}ms:`, e.message, e.stack);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: e.message }));
        }
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

// Explicit generous timeouts so Node's own defaults can never cut a
// long-running request off underneath us.
server.timeout = 0; // disable Node's socket inactivity timeout entirely
server.headersTimeout = 300000; // 5 min to receive headers
server.requestTimeout = 300000; // 5 min total per request
server.keepAliveTimeout = 1000; // close idle keep-alive sockets fast

server.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
