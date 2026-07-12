// Live market data (Vercel serverless). Safe fallback: no TAVILY_API_KEY → returns
// empty results and the app uses AI knowledge only. Never blocks plan generation.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return res.status(200).json({ results: [], live: false });

  const { query } = req.body || {};
  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: tavilyKey, query, search_depth: "basic", max_results: 5, include_answer: true }),
    });
    if (!r.ok) return res.status(200).json({ results: [], live: false });
    const data = await r.json();
    const results = (data.results || []).map((x) => ({ title: x.title, url: x.url, content: x.content }));
    return res.status(200).json({ answer: data.answer || "", results, live: true });
  } catch (e) {
    return res.status(200).json({ results: [], live: false });
  }
}
