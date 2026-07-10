import React, { useState, useRef, useEffect } from "react";
import {
  Compass, FileText, Users, Briefcase, Loader2, Sparkles, AlertCircle,
  Target, Layers, ChevronRight, ChevronDown, Check, Wand2, Flag, Globe,
  Rocket, Gauge, Landmark, Heart, Building2, TrendingUp, Package,
  Megaphone, Settings, DollarSign, Paperclip, BarChart3, Trophy, Map,
  Download, FileType, Upload, Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  LogIn, LogOut, User, Save, BookOpen, Presentation
} from "lucide-react";
import { supabase } from "./supabase";
import AuthModal from "./AuthModal";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap');
@keyframes rise { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform:none;} }
.rise { animation: rise .5s cubic-bezier(.2,.7,.3,1) both; }
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
@keyframes floatOrb { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-18px,22px) scale(1.06); } }
@keyframes floatOrb2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-16px) scale(1.08); } }
.orb1 { animation: floatOrb 11s ease-in-out infinite; }
.orb2 { animation: floatOrb2 13s ease-in-out infinite; }
.glass-card { backdrop-filter: blur(6px); }
.hover-lift { transition: transform .18s ease, box-shadow .18s ease; }
.hover-lift:hover { transform: translateY(-2px); }
@keyframes pulseDot { 0%,100% { opacity:.35; r:2.2; } 50% { opacity:1; r:3.4; } }
@keyframes drift { 0% { transform: translate(0,0); } 100% { transform: translate(-60px,-40px); } }
.net-dot { animation: pulseDot 3.6s ease-in-out infinite; }
.net-wrap { animation: drift 30s linear infinite alternate; }
@keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
@keyframes glow { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
@keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
.landing-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
.landing-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px -12px rgba(37,99,235,0.35) !important; border-color: rgba(37,99,235,0.4) !important; }
.cta-btn { transition: transform .2s ease, box-shadow .2s ease; }
.cta-btn:hover { transform: scale(1.04); box-shadow: 0 16px 36px -8px rgba(37,99,235,0.75) !important; }
`;

/* Animated neural-network style background used in dark hero panels */
function NeuralNet({ width = 960, height = 240, density = 18, color = "#60a5fa" }) {
  const seedRand = (i) => { const x = Math.sin(i * 999) * 10000; return x - Math.floor(x); };
  const pts = Array.from({ length: density }, (_, i) => ({
    x: seedRand(i * 3 + 1) * width,
    y: seedRand(i * 7 + 2) * height,
    r: 1.8 + seedRand(i * 5 + 3) * 1.8,
    delay: seedRand(i * 11 + 4) * 3,
  }));
  const lines = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.22) lines.push([pts[i], pts[j], 1 - dist / (width * 0.22)]);
    }
  }
  const gid = `netglow-${color.replace("#", "")}`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <filter id={gid} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g className="net-wrap" filter={`url(#${gid})`}>
        {lines.map(([a, b, op], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#7dd3fc" strokeWidth={0.8} opacity={op * 0.65} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} className="net-dot" cx={p.x} cy={p.y} r={p.r} fill="#7dd3fc" style={{ animationDelay: `${p.delay}s` }} />
        ))}
      </g>
    </svg>
  );
}

const HORIZONS = ["3–6 months", "1 year", "3 years", "5 years", "10 years", "25 years", "50 years", "100 years"];
const STAGES = ["Idea / pre-launch", "Startup", "Growth", "Established / mature", "Turnaround / restructure"];

const FRAMEWORK_GROUPS = [
  { cat: "Strategy & competitive", items: [
    { n: "SWOT Analysis", d: "Strengths, Weaknesses, Opportunities, Threats." },
    { n: "TOWS Matrix", d: "Turns SWOT into action by pairing factors into strategies." },
    { n: "PESTLE Analysis", d: "Macro scan (incl. PEST / STEEPLE / DESTEP / SLEPIT)." },
    { n: "Porter's Five Forces", d: "Industry attractiveness and competitive pressure." },
    { n: "Value Chain Analysis", d: "Where value is created across activities." },
    { n: "VRIO Framework", d: "Valuable, Rare, Inimitable, Organized resources?" },
    { n: "Porter's Generic Strategies", d: "Cost leadership, differentiation, or focus." },
    { n: "Ansoff Matrix", d: "Growth via market and product expansion." },
    { n: "BCG Growth-Share Matrix", d: "Stars, cash cows, question marks, dogs." },
    { n: "GE/McKinsey Matrix", d: "Market attractiveness vs. business strength." },
    { n: "McKinsey 7S Model", d: "Align strategy, structure, systems, staff, skills, style, shared values." },
    { n: "Business Model Canvas", d: "Nine building blocks of the business model." },
    { n: "Strategy Diamond", d: "Arenas, vehicles, differentiators, staging, economic logic." },
    { n: "Value Net Model", d: "Customers, suppliers, competitors, complementors." },
  ]},
  { cat: "Leadership & change", items: [
    { n: "Blake & Mouton's Managerial Grid", d: "Concern for people vs. production." },
    { n: "Fiedler's Contingency Model", d: "Leader effectiveness depends on the situation." },
    { n: "Hersey & Blanchard's Situational Leadership", d: "Adapt style to follower readiness." },
    { n: "Kotter's 8-Step Change Model", d: "Eight steps to lead change." },
    { n: "Lewin's 3-Step Change Model", d: "Unfreeze, change, refreeze." },
  ]},
  { cat: "Market & product", items: [
    { n: "AIDA Model", d: "Attention, Interest, Desire, Action." },
    { n: "Marketing Funnel", d: "Awareness → consideration → conversion → loyalty." },
    { n: "Product Life Cycle", d: "Introduction, growth, maturity, decline." },
    { n: "Technology Adoption Life Cycle", d: "Innovators to laggards; crossing the chasm." },
    { n: "Price Elasticity", d: "How demand responds to price changes." },
  ]},
  { cat: "International & macro", items: [
    { n: "Hofstede's Cultural Dimensions", d: "Compare national cultures." },
    { n: "Porter's Diamond of National Advantage", d: "Why nations/industries gain advantage." },
    { n: "Bartlett & Ghoshal's Matrix", d: "Global / international / multidomestic / transnational." },
    { n: "OLI / Eclectic Paradigm", d: "Ownership, Location, Internalisation advantages." },
    { n: "Industry Life Cycle", d: "Stage of the industry's evolution." },
  ]},
  { cat: "Analysis methods in use", items: [
    { n: "Competitive analysis", d: "Map and benchmark rivals." },
    { n: "Gap analysis", d: "Where you are vs. where you want to be." },
    { n: "Scenario analysis", d: "Plan across multiple plausible futures." },
    { n: "Portfolio analysis", d: "Evaluate the mix of products/units/investments." },
    { n: "Strategic group analysis", d: "Cluster rivals by similar strategy." },
    { n: "Market segmentation analysis", d: "Define and prioritise customer segments." },
    { n: "Cultural analysis", d: "Assess internal/organisational culture." },
    { n: "Historical analysis", d: "Lessons from the organisation's past." },
    { n: "Profit tree analysis", d: "Decompose profit drivers to find levers." },
    { n: "Acquisition integration approaches", d: "How to integrate after M&A." },
  ]},
];
const ALL_FW = FRAMEWORK_GROUPS.flatMap((g) => g.items.map((i) => i.n));

const VERSION_META = {
  business: { label: "The Business", icon: FileText, hint: "Full internal working document — detailed and operational." },
  stakeholders: { label: "Stakeholders", icon: Users, hint: "Board / investor facing — vision, returns, milestones." },
  management: { label: "Management", icon: Briefcase, hint: "Execution-focused — responsibilities, timelines, KPIs." },
};

const STRAT_STEPS = [
  { key: "foundations", label: "Foundations & priorities" },
  { key: "environment", label: "Environmental scan" },
  { key: "plan", label: "Goals & initiatives" },
  { key: "execution", label: "KPIs, milestones & review" },
  { key: "financials", label: "Financial goals" },
  { key: "governance", label: "Budget, roles & governance" },
];
const BIZ_STEPS = [
  { key: "boverview", label: "Summary & business overview" },
  { key: "bmarket", label: "Market analysis" },
  { key: "boffering", label: "Products, marketing & sales" },
  { key: "bops", label: "Operations & team" },
  { key: "bfin", label: "Financial plan & appendices" },
];
const HEALTH_STEPS = [
  { key: "hassess", label: "Assessing your plan" },
  { key: "hrecommend", label: "Building recommendations" },
];

// Daily usage limit — 5 plans per user per day
const DAILY_LIMIT = 5;
function getUsage() {
  const today = new Date().toDateString();
  const stored = JSON.parse(localStorage.getItem("plangenic_usage") || "{}");
  if (stored.date !== today) return { date: today, count: 0 };
  return stored;
}
function incrementUsage() {
  const usage = getUsage();
  localStorage.setItem("plangenic_usage", JSON.stringify({ date: usage.date, count: usage.count + 1 }));
}
function getRemainingGenerations() {
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

// Read uploaded file and extract text
async function readFileAsText(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return text;
  }
  throw new Error("Unsupported file type. Please upload a PDF, Word (.docx), or text (.txt) file.");
}

const API_URL = "/api/generate";
let callCounter = 0;

async function callClaude(system, userContent, maxTokens = 8000) {
  const callId = ++callCounter;
  const startedAt = Date.now();
  console.log(`[call ${callId}] starting, promptLen=${userContent.length}, maxTokens=${maxTokens}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 240000);
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connection": "close",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({ system, userContent, maxTokens }),
    });
  } catch (e) {
    clearTimeout(timer);
    console.error(`[call ${callId}] fetch failed after ${Date.now() - startedAt}ms:`, e.name, e.message);
    throw new Error(e.name === "AbortError" ? "The request timed out after 4 minutes." : "Couldn't reach the AI service (network/connection): " + e.message);
  }
  clearTimeout(timer);
  console.log(`[call ${callId}] response status ${res.status} after ${Date.now() - startedAt}ms`);
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = j?.error || ""; } catch (_) {}
    throw new Error(`AI service error ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  console.log(`[call ${callId}] success, responseLen=${data.text ? data.text.length : 0}, total time=${Date.now() - startedAt}ms`);
  if (!data.text) throw new Error("The AI returned an empty response.");
  return data.text;
}

function extractJson(text) {
  let t = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e !== -1) {
    try { return JSON.parse(t.slice(s, e + 1)); } catch (e2) {}
  }
  throw new Error("parse");
}

const CONSULTANT = `You are a senior management and business-planning consultant with 25 years of experience across industries. You produce rigorous, specific, realistic documents.

STRICT INTEGRITY RULES — these override everything else:

1. ONLY USE PROVIDED INFORMATION: Base all content strictly on what the user has provided. Do not invent, assume, or extrapolate specific facts about the organisation that were not given.

2. NO FABRICATED NAMES: Never invent names of people (founders, board members, advisors, executives, staff). If not provided, refer only to roles/titles (e.g. 'CEO', 'Board Chair'). This is non-negotiable.

3. STATISTICS & MARKET DATA: When citing statistics, market sizes, growth rates, industry trends, or benchmarks, only use knowledge grounded in real published sources — government departments, industry regulators, national statistics bodies (e.g. ABS, ONS, BLS, Eurostat), reputable industry associations, academic research, or well-known market research firms (e.g. IBISWorld, Statista). Do not fabricate statistics. If precise figures are unavailable, state ranges or qualitative assessments and flag them as estimates (e.g. 'estimated', 'approximate', 'source: industry consensus').

4. COMPETITOR NAMES: Only name real, verifiable competitors. Do not invent competitor names.

5. FINANCIAL FIGURES: All financial projections are illustrative estimates based on user-provided context. Always make this clear — do not present invented figures as facts.

6. TRANSPARENCY: Where the app has made an informed assumption due to limited information, briefly note it so the user knows what to verify.

Never use placeholder or filler text. Return only the requested JSON.`;
// Blue / white / black palette with depth
const C = {
  paper: "#f3f6fb",      // page background — cool white-blue
  ink: "#0b1220",        // near-black navy for primary text/dark surfaces
  accent: "#2563eb",     // primary vivid blue
  accent2: "#0ea5e9",    // secondary sky blue
  muted: "#5b6478",      // slate gray-blue for secondary text
  line: "#dde3ee",       // light blue-gray borders
  card: "#ffffff",       // pure white cards
};
const TODAY = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

function planToSections(plan, planType, org) {
  const S = [];
  const push = (h, lines) => { const arr = (lines || []).filter(Boolean); if (arr.length) S.push([h, arr]); };
  const bullets = (a, fmt) => (a || []).map(fmt);
  if (planType === "strategic") {
    push("Executive Summary", [plan.executiveSummary]);
    push("Summary for All Stakeholders", [plan.stakeholderSummary]);
    if (plan.mission || plan.vision || plan.values) push("Mission, Vision & Values", [plan.mission && `Mission: ${plan.mission}`, plan.vision && `Vision: ${plan.vision}`, plan.values && `Values: ${(plan.values || []).join(", ")}`]);
    if (plan.environmentalScan) push("Environmental Scan", plan.environmentalScan.flatMap((a) => [`${a.area}:`, ...bullets(a.insights, (x) => `  • ${x}`)]));
    if (plan.strategicPriorities) push("Strategic Priorities", bullets(plan.strategicPriorities, (p) => `• ${p.title}${p.rationale ? ` — ${p.rationale}` : ""}`));
    if (plan.goals) push("Goals & Objectives", plan.goals.flatMap((g) => [`• ${g.goal}`, ...bullets(g.objectives, (o) => `    – ${o}`)]));
    if (plan.initiatives) push("Strategies & Initiatives", bullets(plan.initiatives, (it) => `• ${it.initiative}${it.owner ? ` [${it.owner}]` : ""}${it.timeframe ? ` (${it.timeframe})` : ""}${it.dependencies ? ` — watch: ${it.dependencies}` : ""}`));
    if (plan.roadmap) push("Roadmap", plan.roadmap.flatMap((r, i) => [`Phase ${i + 1}: ${r.phase}${r.timeframe ? ` (${r.timeframe})` : ""}`, r.focus && `  ${r.focus}`, ...bullets(r.milestones, (m) => `  • ${m}`)].filter(Boolean)));
    if (plan.financialGoals) push("Financial Goals", [plan.financialGoals.overview, ...(plan.financialGoals.targets ? bullets(plan.financialGoals.targets, (t) => `• ${t.goal}: ${t.target}${t.timeframe ? ` by ${t.timeframe}` : ""}`) : [])]);
    if (plan.kpis) push("KPIs", bullets(plan.kpis, (k) => `• ${k.kpi}: ${k.target}${k.frequency ? ` (${k.frequency})` : ""}`));
    if (plan.milestones) push("Milestones", bullets(plan.milestones, (m) => `• ${m.milestone} — ${m.when}`));
    push("Review Cycle", [plan.reviewCycle]);
    if (plan.budget) push("Budget", bullets(plan.budget, (b) => `• ${b.area}: ${b.allocation}${b.note ? ` — ${b.note}` : ""}`));
    if (plan.roles) push("Roles & Responsibilities", bullets(plan.roles, (r) => `• ${r.role} — ${r.responsibility}`));
    push("Governance", [plan.governance]);
    if (plan.culturalConsiderations) { const cc = plan.culturalConsiderations; push("Cultural Considerations", [cc.overview, ...(cc.factors ? cc.factors.flatMap((fac) => [`${fac.area}:`, `  ${fac.insight}`]) : []), cc.implications && `Strategic implication: ${cc.implications}`]); }
    if (plan.complianceRequirements) { const cr = plan.complianceRequirements; push("Compliance Requirements", [cr.overview, ...(cr.areas ? cr.areas.flatMap((a) => [`${a.level}:`, ...bullets(a.requirements, (r) => `  • ${r}`)]) : []), cr.disclaimer && `Disclaimer: ${cr.disclaimer}`]); }
  } else {
    push("Executive Summary", [plan.executiveSummary]);
    if (plan.businessOverview) { const b = plan.businessOverview; push("Business Overview", [b.description, b.mission && `Mission: ${b.mission}`, b.legalStructure && `Legal structure: ${b.legalStructure}`, b.stage && `Stage: ${b.stage}`, b.location && `Location: ${b.location}`]); }
    if (plan.marketAnalysis) { const m = plan.marketAnalysis; push("Market Analysis", [m.industryOverview, m.marketSize && `Market size: ${m.marketSize}`, ...(m.targetSegments ? ["Target segments:", ...bullets(m.targetSegments, (s) => `  • ${s.segment}${s.need ? ` — ${s.need}` : ""}`)] : []), ...(m.trends ? ["Trends:", ...bullets(m.trends, (t) => `  • ${t}`)] : []), ...(m.competitors ? ["Competitors:", ...bullets(m.competitors, (c) => `  • ${c.name}${c.note ? ` — ${c.note}` : ""}`)] : []), m.positioning && `Positioning: ${m.positioning}`]); }
    if (plan.productsServices) push("Products & Services", bullets(plan.productsServices, (p) => `• ${p.name}${p.pricing ? ` (${p.pricing})` : ""} — ${p.description || ""}${p.usp ? ` Edge: ${p.usp}` : ""}`));
    if (plan.marketingSales) { const m = plan.marketingSales; push("Marketing & Sales", [m.positioning && `Positioning: ${m.positioning}`, m.channels && `Channels: ${(m.channels || []).join(", ")}`, m.acquisition && `Acquisition: ${m.acquisition}`, m.salesProcess && `Sales process: ${m.salesProcess}`, m.pricingStrategy && `Pricing strategy: ${m.pricingStrategy}`]); }
    if (plan.operations) { const o = plan.operations; push("Operations", [o.model, ...(o.keyProcesses ? ["Key processes:", ...bullets(o.keyProcesses, (x) => `  • ${x}`)] : []), o.resources && `Resources: ${(o.resources || []).join(", ")}`, o.technology && `Technology: ${o.technology}`, o.facilities && `Facilities: ${o.facilities}`]); }
    if (plan.management) { const m = plan.management; push("Management & Staffing", [m.structure, ...(m.team ? ["Team:", ...bullets(m.team, (t) => `  • ${t.role} — ${t.responsibility}`)] : []), ...(m.hiringPlan ? ["Hiring plan:", ...bullets(m.hiringPlan, (h) => `  • ${h}`)] : []), m.advisors && `Advisors: ${m.advisors}`]); }
    if (plan.financialPlan) { const fp = plan.financialPlan; push("Financial Plan", [fp.revenueModel && `Revenue model: ${fp.revenueModel}`, ...(fp.projections ? ["Projections:", ...bullets(fp.projections, (r) => `  • ${r.period}: revenue ${r.revenue}, costs ${r.costs}, profit ${r.profit}`)] : []), ...(fp.assumptions ? ["Assumptions:", ...bullets(fp.assumptions, (a) => `  • ${a}`)] : []), fp.fundingRequirement && `Funding: ${fp.fundingRequirement}`, fp.breakEven && `Break-even: ${fp.breakEven}`, "(Figures are illustrative — validate with real data and a qualified advisor.)"]); }
    if (plan.appendices) push("Appendices", bullets(plan.appendices, (a) => `• ${a}`));
    if (plan.culturalConsiderations) { const cc = plan.culturalConsiderations; push("Cultural Considerations", [cc.overview, ...(cc.factors ? cc.factors.flatMap((fac) => [`${fac.area}:`, `  ${fac.insight}`]) : []), cc.implications && `Strategic implication: ${cc.implications}`]); }
    if (plan.complianceRequirements) { const cr = plan.complianceRequirements; push("Compliance Requirements", [cr.overview, ...(cr.areas ? cr.areas.flatMap((a) => [`${a.level}:`, ...bullets(a.requirements, (r) => `  • ${r}`)]) : []), cr.disclaimer && `Disclaimer: ${cr.disclaimer}`]); }
  }
  return S;
}

const inputStyle = { width: "100%", border: `1px solid ${C.line}`, background: C.card, color: C.ink, borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "'Hanken Grotesk',sans-serif", outline: "none", boxSizing: "border-box" };
const Field = ({ label, children }) => (<label style={{ display: "block" }}><span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>{label}</span><div style={{ marginTop: 6 }}>{children}</div></label>);

export default function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setUserProfile(data);
  }

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setUserProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  }

  async function savePlan() {
    if (!user) { setShowAuth(true); return; }
    if (!plan) return;
    setSaving(true); setSaveMsg("");
    const title = `${f.org || "Untitled"} — ${planType === "strategic" ? "Strategic Plan" : "Business Plan"}`;
    const { error } = await supabase.from("plans").insert({
      user_id: user.id,
      title,
      doc_type: planType,
      content: plan,
    });
    setSaving(false);
    if (error) { setSaveMsg("❌ Could not save — " + error.message); }
    else { setSaveMsg("✓ Plan saved to your account."); setTimeout(() => setSaveMsg(""), 4000); }
  }

  const [docType, setDocType] = useState("strategic");
  const [role, setRole] = useState("owner");
  const [f, setF] = useState({ org: "", industry: "", stage: STAGES[1], goals: "", objectives: "", horizon: HORIZONS[2], constraints: "", includeCultural: false, compliance: [], auStates: [], jurisdiction: "" });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleCompliance = (level) => setF((p) => ({ ...p, compliance: p.compliance.includes(level) ? p.compliance.filter((x) => x !== level) : [...p.compliance, level] }));
  const toggleAuState = (s) => setF((p) => ({ ...p, auStates: p.auStates.includes(s) ? p.auStates.filter((x) => x !== s) : [...p.auStates, s] }));

  function resetAll() {
    setF({ org: "", industry: "", stage: STAGES[1], goals: "", objectives: "", horizon: HORIZONS[2], constraints: "", includeCultural: false, compliance: [], auStates: [], jurisdiction: "" });
    setSelFw([]); setOpenCats({ "Strategy & competitive": true });
    setPlan(null); setPlanFw([]); setFwReasons({}); setFwRationale("");
    setFwData({}); setFwOpen({}); setVersions({}); setSteps({});
    setError(""); setGenErr("");
    setHealthResult(null); setHealthActionResult(""); setUploadedFile(null); setUploadedText("");
    setDocType("strategic"); setRole("owner");
  }

  const chooseRole = (r) => { setRole(r); };
  const [selFw, setSelFw] = useState([]);
  const [openCats, setOpenCats] = useState({ "Strategy & competitive": true });
  const toggleFw = (n) => setSelFw((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const selectCat = (g) => setSelFw((p) => Array.from(new Set([...p, ...g.items.map((i) => i.n)])));
  const clearCat = (g) => setSelFw((p) => p.filter((x) => !g.items.some((i) => i.n === x)));

  const [plan, setPlan] = useState(null);
  const [planType, setPlanType] = useState("strategic");
  const [planFw, setPlanFw] = useState([]);
  const [fwReasons, setFwReasons] = useState({});
  const [fwRationale, setFwRationale] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState({});
  const [genErr, setGenErr] = useState("");

  const [fwData, setFwData] = useState({});
  const [fwOpen, setFwOpen] = useState({});
  const [fwLoading, setFwLoading] = useState({});

  const [active, setActive] = useState("business");
  const [versions, setVersions] = useState({});
  const [vLoading, setVLoading] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  // Health check state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedText, setUploadedText] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [healthResult, setHealthResult] = useState(null);
  const [healthAction, setHealthAction] = useState(null); // 'assessment' | 'regenerate'
  const [healthActionResult, setHealthActionResult] = useState("");
  const [healthActionLoading, setHealthActionLoading] = useState(false);
  const fileInputRef = useRef(null);

  const jurisdictionLabel = () => {
    const parts = [];
    if (f.jurisdiction) parts.push(f.jurisdiction);
    if (f.auStates.length) parts.push(`Australian states: ${f.auStates.join(", ")}`);
    return parts.length ? parts.join(" — ") : "not specified";
  };

  const ctx = () => `Organization: ${f.org}
Industry / sector: ${f.industry || "not specified"}
Current stage: ${f.stage}
${docType === "strategic" ? "Planning" : "Projection"} horizon: ${f.horizon}
Jurisdiction / location: ${jurisdictionLabel()}
Goals: ${f.goals}
Key objectives: ${f.objectives || "infer from the goals"}
Known constraints / anticipated delays: ${f.constraints || "none stated"}
Cultural considerations requested: ${f.includeCultural ? "Yes — include a cultural considerations section relevant to this business's market, workforce and community" : "No"}
Compliance focus: ${f.compliance.length ? f.compliance.map((c) => c === "local" ? "Local Council" : c === "state" ? "State" : "Federal").join(", ") : "None requested"}`;

  function containsMalicious(text) {
    return /<script[\s\S]*?>[\s\S]*?<\/script>|<script|javascript\s*:|on\w+\s*=\s*["'`]?[^"'`>]|<iframe|<object|<embed|<link\s+rel\s*=\s*["']?stylesheet/i.test(text);
  }

  async function runStep(key, prompt) {
    setSteps((p) => ({ ...p, [key]: "doing" }));
    try {
      const out = extractJson(await callClaude(CONSULTANT, prompt));
      setSteps((p) => ({ ...p, [key]: "done" }));
      return out;
    } catch (e) {
      setSteps((p) => ({ ...p, [key]: "error" }));
      setGenErr((e && e.message) ? e.message : "Generation failed.");
      return null;
    }
  }

  async function generate() {
    if (!user) { setShowAuth(true); return; }
    if (!f.org.trim() || !f.goals.trim()) { setError("Please add at least the organization name and its goals."); return; }
    const allInputs = Object.values(f).filter(v => typeof v === "string").join(" ");
    if (containsMalicious(allInputs)) { setError("Invalid input detected. Please remove any HTML or script content from your entries and try again."); return; }
    if (getRemainingGenerations() <= 0) { setError("You've reached today's limit of 5 plans. Come back tomorrow to generate more."); return; }
    incrementUsage();
    setError(""); setGenErr(""); setLoading(true); setPlan(null); setPlanFw([]); setFwReasons({}); setFwRationale(""); setFwData({}); setFwOpen({}); setVersions({}); setSteps({});
    setPlanType(docType);
    if (docType === "strategic") await generateStrategic(); else await generateBusiness();
    setLoading(false);
  }

  async function generateStrategic() {
    let acc = {};
    const consultantPicked = role === "consultant" && selFw.length > 0;
    const fwInstruction = consultantPicked
      ? `The consultant has chosen these frameworks; echo them in "recommendedFrameworks". In "frameworkReasons" give a fuller 2-3 sentence professional reasoning for EACH chosen framework — why it specifically fits this business's stage and goals, what it will reveal, and how it connects to the other chosen frameworks. In "frameworkRationale" give 2-3 sentences on the overall approach and how the frameworks work together: ${selFw.join("; ")}.`
      : role === "consultant"
      ? `Act as the consultant. Based specifically on the business's STAGE (${f.stage}) and its GOALS, choose the 4-6 MOST suitable frameworks from this list and return their exact names in "recommendedFrameworks". In "frameworkReasons" give a fuller 2-3 sentence professional reasoning for EACH chosen framework — why it fits this stage/goal, what it will reveal, and how it connects to the other chosen frameworks. In "frameworkRationale" give 2-3 sentences on the overall approach. List: ${ALL_FW.join("; ")}.`
      : `Act as the consultant. Based specifically on the business's STAGE (${f.stage}) and its GOALS, choose the 4-6 MOST suitable frameworks from this list and return their exact names in "recommendedFrameworks". In "frameworkReasons" give a ONE-SENTENCE plain-language reason for EACH chosen framework (why it fits this stage/goal) — keep it short and jargon-free. In "frameworkRationale" give one sentence on the overall approach. List: ${ALL_FW.join("; ")}.`;

    const fnd = await runStep("foundations", `Create the foundation of a strategic plan.\n\n${ctx()}\n\n${fwInstruction}\n\nReturn ONLY JSON:\n{ "executiveSummary":"3-5 sentence overview", "mission":"one sentence", "vision":"one sentence", "values":["4-6 short values"], "strategicPriorities":[{"title":"...","rationale":"1 sentence"}], "recommendedFrameworks":["..."], "frameworkRationale":"one sentence", "frameworkReasons":{"Framework name":"why it fits"} }\n3-5 priorities. Tailor to the ${f.horizon} horizon.`);
    if (fnd) {
      acc = { ...acc, ...fnd }; setPlan({ ...acc });
      setPlanFw(fnd.recommendedFrameworks && fnd.recommendedFrameworks.length ? fnd.recommendedFrameworks : (consultantPicked ? selFw : ["SWOT Analysis", "PESTLE Analysis", "Porter's Five Forces"]));
      setFwReasons(fnd.frameworkReasons || {});
      setFwRationale(fnd.frameworkRationale || "");
    }

    const env = await runStep("environment", `Produce an environmental scan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "environmentalScan":[ {"area":"Macro (PESTLE)","insights":["..."]}, {"area":"Industry & competition","insights":["..."]}, {"area":"Market & customers","insights":["..."]}, {"area":"Internal capabilities","insights":["..."]} ] }\n2-4 insights per area, specific to them. Only cite statistics or trends grounded in real government, regulatory, academic or reputable industry sources. If a figure is an estimate, flag it as such. Do not invent data.`);
    if (env) { acc = { ...acc, ...env }; setPlan({ ...acc }); }

    const pl = await runStep("plan", `Define goals, objectives and initiatives.\n\n${ctx()}\nPriorities: ${JSON.stringify(acc.strategicPriorities || [])}\n\nReturn ONLY JSON:\n{ "goals":[{"goal":"...","objectives":["..."]}], "initiatives":[{"initiative":"...","linkedGoal":"...","owner":"function/role","timeframe":"e.g. Q1-Q2 Yr1","dependencies":"key dependencies or likely delays"}] }\n3-5 goals; 4-8 initiatives. Tailor timeframes to the ${f.horizon} horizon.`);
    if (pl) { acc = { ...acc, ...pl }; setPlan({ ...acc }); }

    const ex = await runStep("execution", `Define measurement, review, a phased roadmap, and a plain-language stakeholder summary.\n\n${ctx()}\nGoals: ${JSON.stringify(acc.goals || [])}\n\nReturn ONLY JSON:\n{ "kpis":[{"kpi":"...","target":"...","frequency":"e.g. Monthly"}], "milestones":[{"milestone":"...","when":"e.g. End of Yr1"}], "reviewCycle":"2-3 sentences", "roadmap":[{"phase":"Phase 1: name","timeframe":"e.g. Months 0-6","focus":"one line on the focus of this phase","milestones":["key deliverable","key deliverable"]}], "stakeholderSummary":"3-5 sentences in plain, jargon-free language that any stakeholder — staff, investor, partner — can understand: what we're doing, why, and what success looks like." }\n5-8 KPIs; 4-6 milestones; 3-6 roadmap phases aligned to the ${f.horizon} horizon.`);
    if (ex) { acc = { ...acc, ...ex }; setPlan({ ...acc }); }

    const fin = await runStep("financials", `Define the financial goals for this strategic plan.\n\n${ctx()}\nGoals: ${JSON.stringify(acc.goals || [])}\n\nReturn ONLY JSON:\n{ "financialGoals":{ "overview":"2-3 sentences on the overall financial direction", "targets":[{"goal":"e.g. Revenue growth","target":"specific figure or % target","timeframe":"e.g. End of Year 2"}], "costReduction":"specific cost reduction goals if relevant, or null", "fundingNeeds":"any funding required to achieve the strategy, or 'self-funded'", "profitabilityGoal":"target margin or profit goal", "financialRisks":["key financial risks to the plan"] } }\n4-6 specific financial targets. Be realistic for a ${f.stage} organisation over the ${f.horizon} horizon. Base targets strictly on user-provided financial context and realistic industry benchmarks — do not invent precise figures as fact. Flag estimates clearly.`);
    if (fin) { acc = { ...acc, ...fin }; setPlan({ ...acc }); }

    const gov = await runStep("governance", `Define budget, roles and governance.\n\n${ctx()}\nInitiatives: ${JSON.stringify(acc.initiatives || [])}\n\nReturn ONLY JSON:\n{ "budget":[{"area":"...","allocation":"% or $ band","note":"..."}], "roles":[{"role":"...","responsibility":"..."}], "governance":"2-4 sentences" }\nRealistic for a ${f.stage} organization. IMPORTANT: In "roles" and "governance", refer only to titles/functions — never invent names of individuals that were not provided by the user.`);
    if (gov) { acc = { ...acc, ...gov }; setPlan({ ...acc }); }

    if (f.includeCultural) {
      const cult = await runStep("cultural", `Generate a cultural considerations section for this strategic plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "culturalConsiderations": { "overview": "2-3 sentences on the cultural context relevant to this business's market, workforce and community", "factors": [{"area": "e.g. Community engagement", "insight": "specific, actionable observation for this business"}], "implications": "1-2 sentences on how these cultural factors should shape the strategy" } }\n3-5 factors specific to this industry, jurisdiction and business.`);
      if (cult) { acc = { ...acc, ...cult }; setPlan({ ...acc }); }
    }

    if (f.compliance.length > 0) {
      const levels = f.compliance.map((c) => c === "local" ? "Local Council" : c === "state" ? "State" : "Federal").join(", ");
      const stateNote = f.auStates.length ? ` Australian states: ${f.auStates.join(", ")}.` : "";
      const comp = await runStep("compliance", `Generate a compliance requirements section for these levels: ${levels}.${stateNote}\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "complianceRequirements": { "overview": "2-3 sentences on the compliance landscape for this business", "areas": [{"level": "Local Council / State / Federal", "requirements": ["specific requirement relevant to this industry and jurisdiction"]}], "disclaimer": "one sentence advising the reader to seek qualified legal and regulatory advice" } }\nBe specific to the industry, jurisdiction and business stage. Include only the levels requested: ${levels}.`);
      if (comp) { acc = { ...acc, ...comp }; setPlan({ ...acc }); }
    }
  }

  async function generateBusiness() {
    let acc = {};
    const o = await runStep("boverview", `Create the opening of a business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "tagline":"short evocative tagline", "preparedFor":"likely audience e.g. Prospective investors", "executiveSummary":"4-6 sentences", "businessOverview":{"description":"what the business does","mission":"one sentence","legalStructure":"suggest a sensible structure if unknown","stage":"...","location":"infer or 'to be confirmed'"} }`);
    if (o) { acc = { ...acc, ...o }; setPlan({ ...acc }); }

    const m = await runStep("bmarket", `Write the market analysis for this business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "marketAnalysis":{ "industryOverview":"2-3 sentences", "targetSegments":[{"segment":"...","need":"..."}], "marketSize":"TAM/SAM/SOM note, qualitative if figures unknown", "trends":["..."], "competitors":[{"name":"...","note":"how this business differs"}], "positioning":"one sentence" } }\nBe specific to the industry. Only use statistics and market data grounded in real published sources (government bodies, industry associations, academic research, established market research firms). Only name real verifiable competitors — do not invent competitor names. If market size figures are estimates, label them as such.`);
    if (m) { acc = { ...acc, ...m }; setPlan({ ...acc }); }

    const off = await runStep("boffering", `Define products/services and the marketing & sales approach.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "productsServices":[{"name":"...","description":"...","pricing":"price or model","usp":"why it wins"}], "marketingSales":{"positioning":"...","channels":["..."],"acquisition":"how customers are won","salesProcess":"...","pricingStrategy":"..."} }\n2-5 products/services.`);
    if (off) { acc = { ...acc, ...off }; setPlan({ ...acc }); }

    const ops = await runStep("bops", `Define operations and the management & staffing plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "operations":{"model":"how it runs day to day","keyProcesses":["..."],"resources":["key resources/suppliers"],"technology":"...","facilities":"location/facilities"}, "management":{"structure":"...","team":[{"role":"...","responsibility":"..."}],"hiringPlan":["roles to add & when"],"advisors":"optional advisors/board"} }\nIMPORTANT: In "team" and "advisors", use ONLY roles/titles — never invent or assume specific people's names. If specific names were provided by the user, you may include them; otherwise refer only to the role (e.g. "Chief Executive Officer", "Board Chair"). Do not fabricate names of board members, advisors, or any individuals.`);
    if (ops) { acc = { ...acc, ...ops }; setPlan({ ...acc }); }

    const fin = await runStep("bfin", `Build the financial plan and appendices.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "financialPlan":{"revenueModel":"how money is made","assumptions":["key assumptions behind the numbers"],"projections":[{"period":"Year 1","revenue":"$ figure or band","costs":"$ figure or band","profit":"$ figure or band"}],"fundingRequirement":"how much is needed and for what (or 'self-funded')","breakEven":"when/how break-even is reached"}, "appendices":["suggested supporting documents to attach"] }\nProvide 3 years of projections. All figures are illustrative estimates grounded in the stated assumptions and the user-provided context only — do not invent precise figures presented as fact. Base cost and revenue assumptions on realistic industry benchmarks where known, and flag estimates clearly.`);
    if (fin) { acc = { ...acc, ...fin }; setPlan({ ...acc }); }

    if (f.includeCultural) {
      const cult = await runStep("cultural", `Generate a cultural considerations section for this business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "culturalConsiderations": { "overview": "2-3 sentences on the cultural context relevant to this business's market, workforce and community", "factors": [{"area": "e.g. Customer communication norms", "insight": "specific, actionable observation for this business"}], "implications": "1-2 sentences on how these cultural factors should shape the business model or operations" } }\n3-5 factors specific to this industry, jurisdiction and business.`);
      if (cult) { acc = { ...acc, ...cult }; setPlan({ ...acc }); }
    }

    if (f.compliance.length > 0) {
      const levels = f.compliance.map((c) => c === "local" ? "Local Council" : c === "state" ? "State" : "Federal").join(", ");
      const stateNote = f.auStates.length ? ` Australian states: ${f.auStates.join(", ")}.` : "";
      const comp = await runStep("compliance", `Generate a compliance requirements section for these levels: ${levels}.${stateNote}\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "complianceRequirements": { "overview": "2-3 sentences on the compliance landscape for this business", "areas": [{"level": "Local Council / State / Federal", "requirements": ["specific requirement relevant to this industry and jurisdiction"]}], "disclaimer": "one sentence advising the reader to seek qualified legal and regulatory advice" } }\nBe specific to the industry, jurisdiction and business stage. Include only the levels requested: ${levels}.`);
      if (comp) { acc = { ...acc, ...comp }; setPlan({ ...acc }); }
    }
  }

  // Health check file upload
  async function handleFileUpload(file) {
    if (!file) return;
    setUploadError(""); setUploadedFile(null); setUploadedText(""); setHealthResult(null); setHealthAction(null); setHealthActionResult("");
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File is too large (max 10 MB). Please upload a smaller file — most plans are well under 2 MB.");
      return;
    }
    setUploadedFile(file);
    setUploadLoading(true);
    try {
      const text = await readFileAsText(file);
      if (!text || text.trim().length < 100) throw new Error("The file appears to be empty or couldn't be read. Please try a different file.");
      if (containsMalicious(text)) throw new Error("This file contains invalid content and cannot be processed. Please upload a standard business plan document.");
      setUploadedText(text);
    } catch (e) {
      setUploadError(e.message || "Couldn't read the file.");
      setUploadedFile(null);
    } finally {
      setUploadLoading(false);
    }
  }

  async function runHealthCheck() {
    if (!user) { setShowAuth(true); return; }
    if (!uploadedText) return;
    if (getRemainingGenerations() <= 0) { setUploadError("You've reached today's limit of 5 plans. Come back tomorrow."); return; }
    incrementUsage();
    setGenErr(""); setHealthResult(null); setHealthAction(null); setHealthActionResult(""); setLoading(true); setSteps({});

    const assess = await runStep("hassess", `You are reviewing an existing business or strategic plan. Assess it thoroughly and honestly.\n\nPLAN CONTENT:\n${uploadedText.slice(0, 8000)}\n\nReturn ONLY JSON:\n{ "planType":"strategic or business", "planSummary":"2-3 sentence summary of what this plan is about", "overallHealth":"Strong / Moderate / Needs attention", "strengths":["what the plan does well — be specific"], "weaknesses":["gaps, missing sections, or weak areas"], "outdatedElements":["things that appear outdated or no longer relevant"], "goalAssessment":"2-3 sentences on whether the goals are still realistic and relevant today", "financialAssessment":"2-3 sentences assessing the financial goals or projections in the plan", "recommendation":"Revise key sections / Full renewal recommended / On track — keep monitoring", "recommendationReason":"2-3 sentences explaining the recommendation", "priorityActions":[{"action":"...","urgency":"High / Medium / Low","reason":"one sentence"}] }`);
    if (assess) {
      setHealthResult(assess);
      setSteps((p) => ({ ...p, hrecommend: "done" }));
    }
    setLoading(false);
  }

  async function runHealthAction(action) {
    setHealthAction(action); setHealthActionResult(""); setHealthActionLoading(true);
    try {
      if (action === "assessment") {
        const out = await callClaude(CONSULTANT, `Here is an assessment of an existing plan:\n${JSON.stringify(healthResult)}\n\nWrite a polished, detailed written assessment a business consultant would present to a client. Cover: what is working, what needs to change, financial observations, and a clear recommendation on whether to revise sections or do a full renewal. Use clear SECTION HEADINGS. Plain text only, no markdown symbols.`);
        setHealthActionResult(out.trim());
      } else {
        const out = await callClaude(CONSULTANT, `Based on this health check assessment of an existing ${healthResult.planType} plan:\n\nSummary: ${healthResult.planSummary}\nStrengths: ${(healthResult.strengths || []).slice(0,3).join("; ")}\nWeaknesses: ${(healthResult.weaknesses || []).slice(0,4).join("; ")}\nRecommendation: ${healthResult.recommendation} — ${healthResult.recommendationReason}\n\nWrite an improved ${healthResult.planType} plan that fixes the weaknesses and preserves the strengths. Use clear SECTION HEADINGS on their own lines. Plain text only, no markdown symbols.`);
        setHealthActionResult(out.trim());
      }
    } catch (e) {
      console.error("Health action error:", e.message, e);
      setHealthActionResult("Could not generate — " + (e.message || "please try again."));
    } finally {
      setHealthActionLoading(false);
    }
  }

  async function loadFramework(name) {
    if (fwData[name] || fwLoading[name]) return;
    setFwLoading((p) => ({ ...p, [name]: true }));
    try {
      const out = extractJson(await callClaude(CONSULTANT, `Apply the "${name}" framework to the organization below; be specific.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "summary":"1-2 sentences", "sections":[{"heading":"a standard component of ${name}","points":["..."]}], "implication":"1-2 sentences" }\nUse the recognised components of ${name} as headings.`));
      setFwData((p) => ({ ...p, [name]: out }));
    } catch (e) {
      setFwData((p) => ({ ...p, [name]: { error: true } }));
    } finally {
      setFwLoading((p) => ({ ...p, [name]: false }));
    }
  }

  function toggleFwCard(name) { setFwOpen((p) => ({ ...p, [name]: !p[name] })); if (!fwOpen[name]) loadFramework(name); }

  async function loadVersion(key) {
    setActive(key);
    if (versions[key] || !plan) return;
    setVLoading(true);
    const docName = planType === "strategic" ? "strategic plan" : "business plan";
    const guidance = {
      business: "the full internal working document: detailed, operational, candid about trade-offs and resourcing.",
      stakeholders: "a board/investor-facing document: vision, market opportunity, returns and headline milestones; lighter on internal mechanics.",
      management: "an execution document for managers: responsibilities, sequencing, timelines, KPIs and what each function must deliver.",
    }[key];
    try {
      const out = await callClaude(CONSULTANT, `Here is the ${docName} for ${f.org} (JSON):\n${JSON.stringify(plan)}\n\nWrite the "${VERSION_META[key].label}" version as a polished narrative document — ${guidance}\nUse clear SECTION HEADINGS on their own lines, then content. Plain text only, no markdown symbols.`);
      setVersions((p) => ({ ...p, [key]: out.trim() }));
    } catch (e) {
      setVersions((p) => ({ ...p, [key]: "Could not generate this version — try again." }));
    } finally {
      setVLoading(false);
    }
  }

  const done = plan && !loading;

  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function buildPlanHTML(plan, planType, org) {
    const title = planType === "strategic" ? "Strategic Plan" : "Business Plan";
    const sections = planToSections(plan, planType, org);
    const body = sections.map(([h, lines]) => {
      const paras = lines.map((ln) => {
        const t = String(ln);
        const indent = t.startsWith("  ") ? ' style="margin-left:18px"' : "";
        return `<p${indent}>${escapeHtml(t.trim())}</p>`;
      }).join("");
      return `<h2>${escapeHtml(h)}</h2>${paras}`;
    }).join("");
    const css = `body{font-family:Georgia,'Times New Roman',serif;color:#191e2b;line-height:1.5;max-width:780px;margin:0 auto;padding:40px}
h1{font-size:30px;margin:0 0 2px} h2{font-size:17px;border-bottom:1px solid #dcd5c6;padding-bottom:5px;margin:26px 0 10px;color:#191e2b}
p{margin:5px 0;font-size:13.5px} .meta{color:#6b6f7a;font-size:12px;margin-bottom:8px}
.cover{border-left:5px solid #b07d33;padding-left:14px;margin-bottom:18px}`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(org || title)}</title><style>${css}</style></head>
<body><div class="cover"><div class="meta">${escapeHtml(title.toUpperCase())}</div><h1>${escapeHtml(org || "Untitled")}</h1><div class="meta">${TODAY}</div></div>${body}</body></html>`;
  }

  function exportDOCX(plan, planType, org) {
    setExporting(true); setExportMsg("");
    try {
      const html = buildPlanHTML(plan, planType, org);
      const blob = new Blob(["﻿", html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${(org || "plan").replace(/[^a-z0-9]+/gi, "_")}_${planType}_plan.doc`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setExportMsg("✓ Word document downloaded — open it in Word to edit.");
    } catch (e) { setExportMsg("Couldn't create the Word file: " + (e.message || e)); }
    finally { setExporting(false); }
  }

  function exportPDF(plan, planType, org) {
    setExporting(true); setExportMsg("");
    try {
      const html = buildPlanHTML(plan, planType, org);
      const w = window.open("", "_blank");
      if (!w) { setExportMsg("Please allow pop-ups for this site, then tap PDF again."); setExporting(false); return; }
      w.document.open(); w.document.write(html + `<script>window.onload=function(){setTimeout(function(){window.print();},300);}<\/script>`); w.document.close();
      setExportMsg('✓ A print window opened — choose "Save as PDF" as the destination.');
    } catch (e) { setExportMsg("Couldn't open the PDF view: " + (e.message || e)); }
    finally { setExporting(false); }
  }

  async function exportDeck(plan, planType, org) {
    setExporting(true); setExportMsg("");
    try {
      const { exportPitchDeck } = await import("./pitchDeck");
      await exportPitchDeck(plan, planType, org);
      setExportMsg("✓ Pitch deck downloaded — open it in PowerPoint to present or edit.");
    } catch (e) { setExportMsg("Couldn't create the pitch deck: " + (e.message || e)); }
    finally { setExporting(false); }
  }

  const activeSteps = docType === "strategic" ? STRAT_STEPS : docType === "healthcheck" ? HEALTH_STEPS : BIZ_STEPS;

  // ── Login gate — pilot access only ──
  if (authReady && !user) {
    return (
      <div style={{ background: "#060a16", minHeight: "100vh", fontFamily: "'Hanken Grotesk',sans-serif", position: "relative", overflow: "hidden" }}>
        <style>{FONTS}</style>

        {/* Deep space background layers */}
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% -10%, #0d2060 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 50% 40% at 80% 80%, #0a1a40 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.5 }}>
          <NeuralNet width={1400} height={900} density={35} color="#2563eb" />
        </div>

        {/* Floating orbs */}
        <div style={{ position: "fixed", top: "12%", left: "8%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", animation: "float 7s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "15%", right: "6%", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 2s", pointerEvents: "none" }} />
        <div style={{ position: "fixed", top: "55%", left: "3%", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", animation: "float 11s ease-in-out infinite 4s", pointerEvents: "none" }} />

        {/* Nav bar */}
        <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, boxShadow: "0 6px 18px -4px rgba(37,99,235,0.7)" }}>
              <Compass size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 26, color: "#fff", letterSpacing: "-.01em" }}>Plangenic</span>
          </div>
          <button onClick={() => setShowAuth(true)} style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#c9d8f0", borderRadius: 9, padding: "9px 22px", fontSize: 14, fontWeight: 600, backdropFilter: "blur(8px)" }}>
            Log in
          </button>
        </nav>

        {/* Hero */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "80px 32px 0", textAlign: "center", animation: "fadeUp .8s ease both" }}>

          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 99, padding: "6px 16px", marginBottom: 32 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent2, animation: "glow 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.accent2, letterSpacing: ".04em" }}>AI-POWERED BUSINESS PLANNING</span>
          </div>

          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: "clamp(42px, 7vw, 72px)", color: "#fff", margin: "0 0 10px", lineHeight: 1.05, letterSpacing: "-.02em" }}>
            Plans that mean
          </h1>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: "clamp(42px, 7vw, 72px)", margin: "0 0 28px", lineHeight: 1.05, letterSpacing: "-.02em", background: `linear-gradient(90deg, ${C.accent2}, ${C.accent}, #818cf8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            business.
          </h1>

          <p style={{ color: "#8aa4c8", fontSize: "clamp(15px, 2.2vw, 18px)", margin: "0 auto 48px", lineHeight: 1.75, maxWidth: 580 }}>
            Board-ready strategic plans and investor-grade business plans — generated by AI, shaped by 39 proven frameworks, built for owners and professional consultants.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 70 }}>
            <button className="cta-btn" onClick={() => setShowAuth(true)} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: `linear-gradient(135deg, ${C.accent2} 0%, ${C.accent} 100%)`, color: "#fff", borderRadius: 12, padding: "16px 36px", fontSize: 16, fontWeight: 700, boxShadow: "0 12px 28px -6px rgba(37,99,235,0.65)", letterSpacing: ".01em" }}>
              <LogIn size={18} /> Register Now
            </button>
            <button onClick={() => setShowAuth(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", color: "#c9d8f0", borderRadius: 12, padding: "16px 28px", fontSize: 15, fontWeight: 600, backdropFilter: "blur(8px)" }}>
              Already a member? Log in
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap", marginBottom: 80, borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "28px 0" }}>
            {[["39", "Strategic Frameworks"], ["100yr", "Max Plan Horizon"], ["2", "Plan Types"], ["Minutes", "Not days"]].map(([stat, label], i, arr) => (
              <div key={label} style={{ flex: "1 1 140px", textAlign: "center", padding: "0 24px", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 32, color: "#fff", letterSpacing: "-.02em" }}>{stat}</div>
                <div style={{ fontSize: 12.5, color: "#5b7099", marginTop: 4, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 80, textAlign: "left" }}>
            {[
              { icon: Flag, color: "#2563eb", label: "Strategic Plans", desc: "From 3-month sprints to 100-year visions — built around your goals, horizon and priorities." },
              { icon: Briefcase, color: "#0ea5e9", label: "Business Plans", desc: "Investor-ready documents covering market analysis, financials, operations and more." },
              { icon: Activity, color: "#10b981", label: "Plan Health Checks", desc: "Upload any existing plan and get an AI-powered assessment with a clear action list." },
              { icon: BarChart3, color: "#818cf8", label: "39 Frameworks", desc: "From SWOT to Blue Ocean Strategy — applied automatically to your specific context." },
              { icon: Globe, color: "#f59e0b", label: "Cultural Considerations", desc: "Indigenous, multicultural and international cultural context woven into your plan." },
              { icon: BookOpen, color: "#ec4899", label: "Compliance Ready", desc: "Local, state and federal compliance requirements built in — for consultant accounts." },
            ].map(({ icon: Icon, color, label, desc }) => (
              <div key={label} className="landing-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 20px" }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e2eaf6", marginBottom: 7 }}>{label}</div>
                <div style={{ fontSize: 13.5, color: "#5b7099", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* Who is it for */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 80 }}>
            {[
              { icon: User, color: C.accent, title: "Business Owners", points: ["Generate your own strategic or business plan", "Health check your current plan", "Cultural considerations for your market", "Download as Word or PDF"] },
              { icon: Briefcase, color: C.accent2, title: "Business Consultants", points: ["Everything in Business Owner", "Compliance requirements (Local, State, Federal)", "39 framework comparisons", "Multi-stakeholder outputs", "Requires professional credential verification"] },
            ].map(({ icon: Icon, color, title, points }) => (
              <div key={title} className="landing-card" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${color}30`, borderRadius: 16, padding: "26px 22px", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={19} color={color} />
                  </div>
                  <span style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 18, color: "#e2eaf6" }}>{title}</span>
                </div>
                {points.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 9 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                      <Check size={11} color={color} />
                    </div>
                    <span style={{ fontSize: 13.5, color: "#8aa4c8", lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ paddingBottom: 80 }}>
            <p style={{ color: "#5b7099", fontSize: 13.5, marginBottom: 20 }}>Registration required · Consultant access requires professional credential verification</p>
            <button className="cta-btn" onClick={() => setShowAuth(true)} style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", border: "none", background: `linear-gradient(135deg, ${C.accent2} 0%, ${C.accent} 100%)`, color: "#fff", borderRadius: 12, padding: "16px 40px", fontSize: 16, fontWeight: 700, boxShadow: "0 12px 28px -6px rgba(37,99,235,0.65)" }}>
              <LogIn size={18} /> Create Your Account
            </button>
          </div>
        </div>

        {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuthSuccess={(u) => { setUser(u); loadProfile(u.id); setShowAuth(false); }} />}
      </div>
    );
  }

  if (!authReady) {
    return (
      <div style={{ background: "#060a16", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color={C.accent} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ background: `linear-gradient(160deg, #060a16 0%, #081428 45%, #0a1a36 100%)`, color: C.ink, minHeight: "100%", fontFamily: "'Hanken Grotesk',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{FONTS}</style>

      {/* Page-wide neural net wash */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.7 }}>
        <NeuralNet width={1400} height={900} density={30} color="#2563eb" />
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 22px 64px", position: "relative", zIndex: 1 }}>

        <header className="rise" style={{
          borderRadius: 18,
          padding: "30px 26px 34px",
          marginBottom: 24,
          background: `linear-gradient(135deg, #050810 0%, #060d1f 45%, #081735 100%)`,
          boxShadow: "0 22px 50px -16px rgba(2,6,16,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 }}>
            <NeuralNet width={960} height={210} density={20} color="#2563eb" />
          </div>
          <div style={{ position: "absolute", top: -60, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #3b82f6, transparent 70%)", opacity: 0.5, pointerEvents: "none" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`,
                boxShadow: "0 6px 14px -4px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}>
                <Compass size={19} color="#fff" />
              </div>
              <span style={{ fontSize: 12, letterSpacing: ".32em", textTransform: "uppercase", color: "#9fb0d0", fontWeight: 600 }}>Strategy & business planning</span>
            </div>
            {/* Auth controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={resetAll} title="Clear everything and start a new business" style={{ cursor: "pointer", border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#b9c6e0", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                ↺ New business
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {userProfile && (
                  <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: userProfile.role === "consultant" ? C.accent2 : "#9fb0d0", background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 10px" }}>
                    {userProfile.role === "consultant" ? "Consultant" : "Business Owner"}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#b9c6e0" }}>
                  <User size={14} color={C.accent2} />
                  <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", border: "1px solid rgba(255,255,255,0.18)", background: "transparent", color: "#b9c6e0", borderRadius: 8, padding: "7px 12px", fontSize: 13 }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 38, lineHeight: 1.05, margin: "14px 0 4px", color: "#fff", position: "relative" }}>Plangenic</h1>
          <p style={{ color: "#b9c6e0", fontSize: 15, margin: 0, position: "relative" }}>Board-ready strategic plans and full business plans — drafted in minutes.</p>
        </header>

        {/* Auth modal */}
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuthSuccess={(u) => { setUser(u); setShowAuth(false); }}
          />
        )}

        {/* Role selector */}
        {docType !== "healthcheck" && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#9fb0d0", fontWeight: 600 }}>I am a…</span>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {[["owner", "Business owner", "The app chooses the right analysis methods for your business stage and goals."], ["consultant", "Business consultant", "Full access — choose any model, framework or method yourself."]].map(([k, lbl, desc]) => {
                const on = role === k;
                return (
                  <button key={k} onClick={() => chooseRole(k)} style={{ flex: 1, textAlign: "left", cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>{lbl}</div>
                    <div style={{ fontSize: 12, color: on ? "#aebbd6" : C.muted, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Doc type switch — 3 modes */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["strategic", "Strategic plan"], ["business", "Business plan"], ["healthcheck", "Plan health check"]].map(([k, lbl]) => {
            const on = docType === k;
            return <button key={k} onClick={() => { setDocType(k); setPlan(null); setHealthResult(null); setUploadedFile(null); setUploadedText(""); setError(""); setGenErr(""); }} style={{ flex: 1, cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>{lbl}</button>;
          })}
        </div>

        {/* Health check mode */}
        {docType === "healthcheck" ? (
          <section className="rise" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Plan health check</div>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 0, marginBottom: 20 }}>Upload your existing strategic or business plan and we'll assess its strengths, flag what's outdated, and tell you whether to revise or fully renew it.</p>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f); }}
              style={{ border: `2px dashed ${uploadedFile ? C.accent2 : C.line}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: uploadedFile ? "#f0f6f4" : C.paper, transition: "all .2s" }}
            >
              {uploadLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: C.muted }}><Loader2 size={20} className="animate-spin" /> Reading file…</div>
              ) : uploadedFile ? (
                <div>
                  <CheckCircle size={28} color={C.accent2} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{uploadedFile.name}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>File ready — click to change</div>
                </div>
              ) : (
                <div>
                  <Upload size={28} color={C.muted} style={{ marginBottom: 8 }} />
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Drop your plan here, or click to browse</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>Accepts PDF, Word (.docx), or plain text (.txt) · Max file size 10 MB</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) handleFileUpload(e.target.files[0]); }} />

            {uploadError && <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, color: "#9a3412", fontSize: 13 }}><AlertCircle size={16} /> {uploadError}</div>}

            {uploadedText && !healthResult && (
              <button onClick={runHealthCheck} disabled={loading} style={{ marginTop: 20, width: "100%", border: "none", cursor: loading ? "wait" : "pointer", background: C.ink, color: C.paper, padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
                {loading ? <><Loader2 size={17} className="animate-spin" /> Analysing your plan…</> : <><Activity size={17} color={C.accent} /> Run health check</>}
              </button>
            )}
          </section>
        ) : (
          /* Standard plan inputs */
          <section className="rise" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Organization"><input style={inputStyle} value={f.org} onChange={set("org")} placeholder="e.g. Northwind Logistics" /></Field>
              <Field label="Industry / sector"><input style={inputStyle} value={f.industry} onChange={set("industry")} placeholder="e.g. Freight & supply chain" /></Field>
              <Field label="Current stage"><select style={inputStyle} value={f.stage} onChange={set("stage")}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label={docType === "strategic" ? "Planning horizon" : "Projection horizon"}><select style={inputStyle} value={f.horizon} onChange={set("horizon")}>{HORIZONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
              <Field label="Goals"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={f.goals} onChange={set("goals")} placeholder="What does this business want to achieve?" /></Field>
              <Field label="Key objectives"><textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={f.objectives} onChange={set("objectives")} placeholder="Specific, measurable objectives (optional)" /></Field>
            </div>
            <div style={{ marginTop: 16 }}><Field label="Anticipated delays / constraints"><input style={inputStyle} value={f.constraints} onChange={set("constraints")} placeholder="e.g. tight budget, permit timelines, hiring lead times" /></Field></div>

            {/* ── Optional sections ── */}
            <div style={{ marginTop: 22, borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
              <span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Optional sections</span>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Jurisdiction */}
                <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", background: C.paper }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 8 }}>📍 Jurisdiction</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 12, lineHeight: 1.4 }}>Select your country so the plan uses the correct legal, regulatory and compliance context.</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    {["Australia", "New Zealand", "USA", "Other"].map((j) => {
                      const on = f.jurisdiction === j;
                      return (
                        <button key={j} onClick={() => setF((p) => ({ ...p, jurisdiction: on ? "" : j, auStates: on ? [] : p.auStates }))} style={{ cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 8, padding: "7px 14px", fontSize: 13.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                          {on && <Check size={13} color={C.accent} />}{j}
                        </button>
                      );
                    })}
                  </div>
                  {/* Australian states */}
                  {f.jurisdiction === "Australia" && (
                    <div>
                      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>Select state(s)</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((s) => {
                          const on = f.auStates.includes(s);
                          return (
                            <button key={s} onClick={() => toggleAuState(s)} style={{ cursor: "pointer", border: `1px solid ${on ? C.accent2 : C.line}`, background: on ? C.accent2 : C.card, color: on ? "#fff" : C.ink, borderRadius: 8, padding: "7px 13px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                              {on && <Check size={12} color="#fff" />}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compliance requirements — consultant only */}
                {role === "consultant" && (
                <div style={{ border: `1px solid ${f.compliance.length ? C.accent2 : C.line}`, borderRadius: 10, padding: "12px 14px", background: f.compliance.length ? "#eef4f2" : C.paper }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>🛡️ Compliance requirements</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>Select the levels of compliance to include. The AI will outline key obligations relevant to your industry and jurisdiction.</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {[["local", "Local Council"], ["state", "State"], ["federal", "Federal"]].map(([val, lbl]) => {
                      const on = f.compliance.includes(val);
                      return (
                        <label key={val} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 8, padding: "7px 13px", fontSize: 13.5, fontWeight: 500, userSelect: "none" }}>
                          <input type="checkbox" checked={on} onChange={() => toggleCompliance(val)} style={{ display: "none" }} />
                          {on && <Check size={13} color={C.accent} />}{lbl}
                        </label>
                      );
                    })}
                  </div>
                </div>
                )}

                {/* Cultural considerations */}
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: f.includeCultural ? "#eef4f2" : C.paper, border: `1px solid ${f.includeCultural ? C.accent2 : C.line}`, borderRadius: 10, padding: "12px 14px" }}>
                  <input type="checkbox" checked={f.includeCultural} onChange={(e) => setF((p) => ({ ...p, includeCultural: e.target.checked }))} style={{ marginTop: 2, accentColor: C.accent2, width: 16, height: 16, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>🌏 Cultural considerations</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>Adds a section analysing cultural factors relevant to your market, workforce and community — including Indigenous, multicultural and international contexts.</div>
                  </div>
                </label>

              </div>
            </div>

            {docType === "strategic" && (
              <div style={{ marginTop: 22, borderTop: `1px solid ${C.line}`, paddingTop: 18 }}>
                <span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Analysis frameworks</span>
                {role === "owner" ? (
                  <p style={{ color: C.muted, fontSize: 13.5, margin: "10px 0 0", display: "flex", alignItems: "center", gap: 7 }}><Wand2 size={15} color={C.accent} /> The app will select the methods best suited to your stage and goals — and explain why.</p>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10 }}>{selFw.length} selected · pick any from all {ALL_FW.length}, or leave empty to let the app choose</div>
                    {FRAMEWORK_GROUPS.map((g) => {
                      const open = openCats[g.cat]; const selCount = g.items.filter((i) => selFw.includes(i.n)).length;
                      return (
                        <div key={g.cat} style={{ border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 10, overflow: "hidden" }}>
                          <button onClick={() => setOpenCats((p) => ({ ...p, [g.cat]: !p[g.cat] }))} style={{ width: "100%", cursor: "pointer", border: "none", background: C.paper, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: "'Hanken Grotesk',sans-serif" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><ChevronDown size={16} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s" }} /> {g.cat}</span>
                            <span style={{ fontSize: 12, color: selCount ? C.accent : C.muted, fontWeight: 600 }}>{selCount}/{g.items.length}</span>
                          </button>
                          {open && (
                            <div style={{ padding: "12px 14px", background: C.card }}>
                              <div style={{ display: "flex", gap: 14, marginBottom: 10 }}>
                                <button onClick={() => selectCat(g)} style={{ cursor: "pointer", border: "none", background: "transparent", color: C.accent2, fontSize: 12.5, fontWeight: 600 }}>Select all</button>
                                <button onClick={() => clearCat(g)} style={{ cursor: "pointer", border: "none", background: "transparent", color: C.muted, fontSize: 12.5, fontWeight: 600 }}>Clear</button>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {g.items.map((it) => { const on = selFw.includes(it.n); return (<button key={it.n} onClick={() => toggleFw(it.n)} title={it.d} style={{ cursor: "pointer", textAlign: "left", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 8, padding: "7px 11px", fontSize: 12.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>{on && <Check size={13} color={C.accent} />} {it.n}</button>); })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {error && <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, color: "#9a3412", fontSize: 13 }}><AlertCircle size={16} /> {error}</div>}
            <button onClick={generate} disabled={loading || getRemainingGenerations() <= 0} style={{ marginTop: 10, width: "100%", border: "none", cursor: loading ? "wait" : "pointer", background: C.ink, color: C.paper, padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
              {loading ? <><Loader2 size={17} className="animate-spin" /> Building your {docType === "strategic" ? "strategic plan" : "business plan"}…</> : <><Sparkles size={17} color={C.accent} /> Generate {docType === "strategic" ? "strategic plan" : "business plan"}</>}
            </button>
          </section>
        )}

        {/* Progress indicator */}
        {loading && (
          <section className="rise" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 24 }}>
            {activeSteps.map((s) => {
              const st = steps[s.key];
              return (<div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", color: st === "done" ? C.ink : C.muted, fontSize: 14 }}>
                {st === "done" ? <Check size={16} color={C.accent2} /> : st === "doing" ? <Loader2 size={16} className="animate-spin" color={C.accent} /> : st === "error" ? <AlertCircle size={16} color="#9a3412" /> : <span style={{ width: 16, textAlign: "center" }}>·</span>}
                {s.label}
              </div>);
            })}
            {genErr && <div style={{ marginTop: 10, padding: "10px 12px", background: "#fdecec", border: "1px solid #f3c2c2", borderRadius: 8, color: "#9a3412", fontSize: 13 }}><strong>Problem:</strong> {genErr}</div>}
          </section>
        )}

        {!loading && genErr && !plan && !healthResult && (
          <section className="rise" style={{ background: "#fdecec", border: "1px solid #f3c2c2", borderRadius: 14, padding: 18, marginBottom: 24, color: "#9a3412", fontSize: 13.5 }}>
            <strong>Couldn't generate the plan.</strong> {genErr}
            <div style={{ marginTop: 6, color: "#7a3010" }}>Check that your API key is set correctly, then try again.</div>
          </section>
        )}

        {/* Health check results */}
        {healthResult && !loading && (
          <div className="rise">
            <HealthCheckView result={healthResult} onAction={runHealthAction} actionLoading={healthActionLoading} actionResult={healthActionResult} currentAction={healthAction} />
          </div>
        )}

        {/* Plan output */}
        {plan && (
          <div className="rise">
            {done && (
              <section style={{ background: C.ink, color: C.paper, borderRadius: 14, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 600 }}>Your {planType === "strategic" ? "strategic plan" : "business plan"} is ready</div>
                  <div style={{ fontSize: 12.5, color: "#aebbd6", marginTop: 2 }}>Download as PDF to share, or Word to keep editing.</div>
                </div>
                <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                  <button
                    onClick={savePlan}
                    disabled={saving}
                    title={user ? "Save to your account" : "Log in to save plans"}
                    style={{ cursor: saving ? "wait" : "pointer", border: `1px solid ${C.accent2}`, background: "transparent", color: C.accent2 === "#3a5a52" ? "#7dd3fc" : C.accent2, borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <Save size={15} /> {saving ? "Saving…" : user ? "Save plan" : "Save plan"}
                  </button>
                  <button onClick={() => exportPDF(plan, planType, f.org)} disabled={exporting} style={{ cursor: exporting ? "wait" : "pointer", border: "none", background: C.accent, color: "#fff", borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Download size={15} /> PDF</button>
                  <button onClick={() => exportDOCX(plan, planType, f.org)} disabled={exporting} style={{ cursor: exporting ? "wait" : "pointer", border: "none", background: C.paper, color: C.ink, borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><FileType size={15} /> Word (.doc)</button>
                  <button onClick={() => exportDeck(plan, planType, f.org)} disabled={exporting} style={{ cursor: exporting ? "wait" : "pointer", border: "none", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, color: "#fff", borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 6px 14px -4px rgba(37,99,235,0.5)" }}><Presentation size={15} /> Pitch deck</button>
                </div>
              </section>
            )}
            {saveMsg && <div style={{ fontSize: 13, color: saveMsg.startsWith("✓") ? C.accent2 : "#9a3412", marginBottom: 12 }}>{saveMsg}</div>}
            {exportMsg && <div style={{ fontSize: 13, color: exportMsg.startsWith("✓") ? C.accent2 : "#9a3412", marginBottom: 12 }}>{exportMsg}</div>}
            {planType === "strategic" ? <StrategicView plan={plan} planFw={planFw} fwReasons={fwReasons} fwRationale={fwRationale} fwOpen={fwOpen} fwData={fwData} fwLoading={fwLoading} toggleFwCard={toggleFwCard} bizCtx={ctx()} role={role} /> : <BusinessView plan={plan} org={f.org} />}

            {done && (
              <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginTop: 8 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Tailored versions</div>
                <p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>The same document, written for {role === "consultant" ? "three" : "two"} different audiences.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {Object.keys(VERSION_META).filter((k) => role === "consultant" || k !== "management").map((k) => { const M = VERSION_META[k]; const Ic = M.icon; const on = active === k; return <button key={k} onClick={() => loadVersion(k)} style={{ cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Ic size={15} /> {M.label}</button>; })}
                </div>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 0, marginBottom: 14 }}>{VERSION_META[active].hint}</p>
                <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18, minHeight: 110 }}>
                  {vLoading && !versions[active] ? <div style={{ display: "flex", gap: 9, alignItems: "center", color: C.muted, fontSize: 14 }}><Loader2 size={16} className="animate-spin" /> Writing the {VERSION_META[active].label} version…</div>
                    : versions[active] ? (
                      <>
                        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>{versions[active]}</pre>
                        <DownloadBar text={versions[active]} title={`${f.org} — ${VERSION_META[active].label}`} />
                      </>
                    ) : <button onClick={() => loadVersion(active)} style={{ cursor: "pointer", border: "none", background: "transparent", color: C.accent, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>Generate the {VERSION_META[active].label} version <ChevronRight size={16} /></button>}
                </div>
              </section>
            )}
          </div>
        )}

        {!plan && !loading && !healthResult && docType !== "healthcheck" && (
          <div style={{ textAlign: "center", color: "#9fb0d0", fontSize: 13.5, marginTop: 8 }}>
            <p style={{ margin: "0 0 8px" }}>Pick a document type, fill in the brief, and generate.</p>
            {!user && authReady && (
              <p style={{ margin: 0, fontSize: 12.5 }}>
                This is a private pilot —{" "}
                <button onClick={() => setShowAuth(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent2, fontWeight: 600, fontSize: 12.5, padding: 0 }}>log in</button>
                {" "}with an approved email to generate a plan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Health check view ---------- */
function DownloadBar({ text, title }) {
  const [copied, setCopied] = useState(false);

  function downloadDocx() {
    const html = `<html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;max-width:700px;margin:40px auto;padding:0 20px"><h1>${title}</h1><pre style="font-family:Arial,sans-serif;white-space:pre-wrap">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, "_")}.doc`;
    a.click();
  }

  function downloadPdf() {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;max-width:700px;margin:40px auto;padding:0 20px}pre{white-space:pre-wrap;font-family:Arial,sans-serif}</style></head><body><h1>${title}</h1><pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  const btnStyle = { cursor: "pointer", border: `1px solid ${C.line}`, background: C.ink, color: C.paper, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 };

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
      <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Download or share</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={downloadDocx} style={btnStyle}><FileText size={14} /> Word doc (.doc)</button>
        <button onClick={downloadPdf} style={btnStyle}><Download size={14} /> PDF (print dialog)</button>
        <button onClick={copyToClipboard} style={{ ...btnStyle, border: `1px solid ${copied ? C.accent2 : C.line}`, background: copied ? C.accent2 : C.ink }}>
          {copied ? <><CheckCircle size={14} /> Copied!</> : <><FileType size={14} /> Copy to clipboard</>}
        </button>
      </div>
      {copied && <p style={{ fontSize: 12, color: C.accent2, marginTop: 8 }}>✓ Plan text copied — open your email, paste it in and send.</p>}
    </div>
  );
}

function HealthCheckView({ result, onAction, actionLoading, actionResult, currentAction }) {
  const healthColor = result.overallHealth === "Strong" ? C.accent2 : result.overallHealth === "Moderate" ? C.accent : "#9a3412";
  const HealthIcon = result.overallHealth === "Strong" ? CheckCircle : result.overallHealth === "Moderate" ? AlertTriangle : XCircle;

  return (
    <>
      {/* Overall verdict */}
      <Block icon={Activity} accent={C.accent} title="Health check results">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "12px 14px", background: C.paper, borderRadius: 10, border: `1px solid ${C.line}` }}>
          <HealthIcon size={28} color={healthColor} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: healthColor }}>{result.overallHealth}</div>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{result.planType === "strategic" ? "Strategic plan" : "Business plan"} · {result.planSummary}</div>
          </div>
        </div>
        <Line label="Recommendation" text={result.recommendation} />
        <p style={{ fontSize: 14, lineHeight: 1.55, color: C.muted, margin: "8px 0 0" }}>{result.recommendationReason}</p>
      </Block>

      {/* Goal & financial assessment */}
      <Block num={1} icon={Target} accent={C.accent2} title="Goals & financial assessment">
        {result.goalAssessment && <div style={{ marginBottom: 12 }}><Sub>Goals</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{result.goalAssessment}</p></div>}
        {result.financialAssessment && <div><Sub>Financials</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{result.financialAssessment}</p></div>}
      </Block>

      {/* Strengths & weaknesses */}
      <Block num={2} icon={BarChart3} accent={C.accent} title="Strengths & weaknesses">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <Sub>What's working</Sub>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{(result.strengths || []).map((s, i) => <li key={i} style={{ color: C.accent2 }}><span style={{ color: C.ink }}>{s}</span></li>)}</ul>
          </div>
          <div>
            <Sub>Gaps & weaknesses</Sub>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{(result.weaknesses || []).map((w, i) => <li key={i} style={{ color: "#9a3412" }}><span style={{ color: C.ink }}>{w}</span></li>)}</ul>
          </div>
        </div>
        {result.outdatedElements && result.outdatedElements.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Sub>Outdated elements</Sub>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: C.muted }}>{result.outdatedElements.map((o, i) => <li key={i}>{o}</li>)}</ul>
          </div>
        )}
      </Block>

      {/* Priority actions */}
      {result.priorityActions && result.priorityActions.length > 0 && (
        <Block num={3} icon={Flag} accent={C.accent2} title="Priority actions">
          {result.priorityActions.map((a, i) => {
            const urgencyColor = a.urgency === "High" ? "#9a3412" : a.urgency === "Medium" ? C.accent : C.accent2;
            return (
              <div key={i} style={{ paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5 }}>{a.action}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor, border: `1px solid ${urgencyColor}`, borderRadius: 5, padding: "2px 8px", whiteSpace: "nowrap" }}>{a.urgency}</span>
                </div>
                {a.reason && <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{a.reason}</div>}
              </div>
            );
          })}
        </Block>
      )}

      {/* Action choice */}
      <section style={{ background: C.ink, color: C.paper, borderRadius: 14, padding: 22, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>What would you like to do next?</div>
        <p style={{ fontSize: 13.5, color: "#aebbd6", margin: "0 0 16px" }}>Choose how you'd like to act on this health check.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => onAction("assessment")} disabled={actionLoading} style={{ flex: 1, cursor: actionLoading ? "wait" : "pointer", border: `1px solid ${currentAction === "assessment" ? C.accent : "#444"}`, background: currentAction === "assessment" ? C.accent : "transparent", color: C.paper, borderRadius: 9, padding: "12px 16px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            {actionLoading && currentAction === "assessment" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Written assessment
          </button>
          <button onClick={() => onAction("regenerate")} disabled={actionLoading} style={{ flex: 1, cursor: actionLoading ? "wait" : "pointer", border: `1px solid ${currentAction === "regenerate" ? C.accent2 : "#444"}`, background: currentAction === "regenerate" ? C.accent2 : "transparent", color: C.paper, borderRadius: 9, padding: "12px 16px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            {actionLoading && currentAction === "regenerate" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Regenerate improved plan
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: "#9aa6c0", marginTop: 10 }}>
          <strong style={{ color: "#aebbd6" }}>Written assessment</strong> — a consultant-style narrative report you can share.<br />
          <strong style={{ color: "#aebbd6" }}>Regenerate improved plan</strong> — a new version of your plan with the issues fixed.
        </div>
      </section>

      {actionLoading && (
        <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", color: C.muted, fontSize: 14 }}><Loader2 size={16} className="animate-spin" color={C.accent} /> {currentAction === "assessment" ? "Writing your assessment…" : "Regenerating your improved plan…"}</div>
        </section>
      )}

      {actionResult && (
        <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 600, marginBottom: 14 }}>{currentAction === "assessment" ? "Written assessment" : "Improved plan"}</div>
          {actionResult.startsWith("Could not generate") ? (
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#9a3412", fontSize: 14, marginBottom: 14 }}>
                <AlertCircle size={16} /> {actionResult}
              </div>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 14px" }}>This can happen if the network dropped or the screen locked during the request. Click below to try again.</p>
              <button onClick={() => onAction(currentAction)} disabled={actionLoading} style={{ cursor: "pointer", border: "none", background: C.ink, color: C.paper, borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                {actionLoading ? <><Loader2 size={15} className="animate-spin" /> Trying again…</> : <>↺ Try again</>}
              </button>
            </div>
          ) : (
            <>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 20px" }}>{actionResult}</pre>
              <DownloadBar text={actionResult} title={currentAction === "assessment" ? "Written Assessment" : "Improved Plan"} />
            </>
          )}
        </section>
      )}
    </>
  );
}

/* ---------- Strategic plan view ---------- */
function StrategicView({ plan, planFw, fwReasons, fwRationale, fwOpen, fwData, fwLoading, toggleFwCard, bizCtx, role }) {
  const [cmpOpen, setCmpOpen] = useState({});
  const [cmpData, setCmpData] = useState({});
  const [cmpLoading, setCmpLoading] = useState({});

  async function loadComparison(cat, items) {
    if (cmpData[cat] || cmpLoading[cat]) return;
    setCmpLoading((p) => ({ ...p, [cat]: true }));
    const names = items.map((i) => i.n).join("; ");
    try {
      const out = extractJson(await callClaude(CONSULTANT, `Compare these "${cat}" methods for the specific business below, to decide which ONE best serves its strategic plan.\n\n${bizCtx}\n\nCandidates: ${names}\n\nScore each candidate 0-100 for how well it fits THIS business's stage and goals — be discriminating and spread the scores, do not bunch them. Then name the single best.\nReturn ONLY JSON:\n{ "rankings":[{"name":"exact name","score":75,"reason":"≤12 words why"}], "winner":"exact name of the best one", "winnerReason":"1-2 sentences on why it wins for this business" }\nRank from highest to lowest score.`));
      setCmpData((p) => ({ ...p, [cat]: out }));
    } catch (e) { setCmpData((p) => ({ ...p, [cat]: { error: true } })); }
    finally { setCmpLoading((p) => ({ ...p, [cat]: false })); }
  }
  function toggleCmp(cat, items) { setCmpOpen((p) => ({ ...p, [cat]: !p[cat] })); if (!cmpOpen[cat]) loadComparison(cat, items); }

  return (
    <>
      <Block icon={Sparkles} accent={C.accent} title="Executive summary"><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}>{plan.executiveSummary}</p></Block>

      {plan.stakeholderSummary && (
        <Block icon={Users} accent={C.accent2} title="Summary for all stakeholders">
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 0, marginBottom: 10 }}>Plain-language overview anyone can follow — staff, investors, partners.</p>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.65 }}>{plan.stakeholderSummary}</p>
        </Block>
      )}

      {(plan.mission || plan.values) && (
        <Block num={1} icon={Heart} accent={C.accent2} title="Mission, vision & values">
          {plan.mission && <Line label="Mission" text={plan.mission} />}
          {plan.vision && <Line label="Vision" text={plan.vision} />}
          {plan.values && (<div style={{ marginTop: 12 }}><Sub>Values</Sub><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{plan.values.map((v, i) => <Tag key={i}>{v}</Tag>)}</div></div>)}
        </Block>
      )}

      {plan.environmentalScan && (
        <Block num={2} icon={Globe} accent={C.accent} title="Environmental scan">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {plan.environmentalScan.map((a, i) => (<div key={i}><div style={{ fontFamily: "'Fraunces',serif", fontSize: 15.5, fontWeight: 600, marginBottom: 5 }}>{a.area}</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.5, color: C.muted }}>{(a.insights || []).map((p, j) => <li key={j}>{p}</li>)}</ul></div>))}
          </div>
        </Block>
      )}

      {planFw.length > 0 && (
        <Block num={3} icon={Layers} accent={C.accent2} title={`Strategic analysis · ${planFw.length} framework${planFw.length > 1 ? "s" : ""}`}>
          {fwRationale ? (
            <div style={{ fontSize: 13.5, lineHeight: 1.55, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent2}`, borderRadius: 4, marginBottom: 14 }}><strong>Why these methods:</strong> {fwRationale}</div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>Tap a framework to apply it to your business.</p>
          )}
          {planFw.map((name) => {
            const open = fwOpen[name]; const data = fwData[name]; const ld = fwLoading[name];
            const why = fwReasons && fwReasons[name];
            return (
              <div key={name} style={{ border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 9, overflow: "hidden" }}>
                <button onClick={() => toggleFwCard(name)} style={{ width: "100%", cursor: "pointer", border: "none", background: C.paper, padding: "12px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, textAlign: "left", color: C.ink }}>
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "'Fraunces',serif", display: "block" }}>{name}</span>
                    {why && <span style={{ fontSize: 12.5, color: C.muted, display: "block", marginTop: 3, lineHeight: 1.4 }}>{why}</span>}
                  </span>
                  <ChevronDown size={17} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s", color: C.muted, marginTop: 3, flexShrink: 0 }} />
                </button>
                {open && (
                  <div style={{ padding: "4px 16px 16px", background: C.card }}>
                    {ld && !data ? <div style={{ display: "flex", gap: 8, alignItems: "center", color: C.muted, fontSize: 13.5, padding: "8px 0" }}><Loader2 size={15} className="animate-spin" /> Applying {name}…</div>
                      : data && data.error ? <div style={{ color: "#9a3412", fontSize: 13.5 }}>Couldn't generate — tap to retry.</div>
                        : data ? (<div>{data.summary && <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 8 }}>{data.summary}</p>}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>{(data.sections || []).map((s, i) => (<div key={i}><div style={{ fontWeight: 600, fontSize: 13.5, color: C.accent2, marginBottom: 4 }}>{s.heading}</div><ul style={{ margin: 0, paddingLeft: 16, fontSize: 13.5, lineHeight: 1.5 }}>{(s.points || []).map((pt, j) => <li key={j}>{pt}</li>)}</ul></div>))}</div>{data.implication && <div style={{ fontSize: 13.5, marginTop: 12, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent}`, borderRadius: 4 }}><strong>So what:</strong> {data.implication}</div>}</div>) : null}
                  </div>
                )}
              </div>
            );
          })}
        </Block>
      )}

      {role === "consultant" && (
      <Block num={"⋆"} icon={BarChart3} accent={C.accent2} title="Framework comparison — best per category">
        <p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>For each category, the app scores every method against this business and names the single best fit. Tap a category to compare.</p>
        {FRAMEWORK_GROUPS.map((g) => {
          const open = cmpOpen[g.cat]; const data = cmpData[g.cat]; const ld = cmpLoading[g.cat];
          return (
            <div key={g.cat} style={{ border: `1px solid ${C.line}`, borderRadius: 10, marginBottom: 9, overflow: "hidden" }}>
              <button onClick={() => toggleCmp(g.cat, g.items)} style={{ width: "100%", cursor: "pointer", border: "none", background: C.paper, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left", color: C.ink }}>
                <span style={{ flex: 1 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "'Fraunces',serif", display: "block" }}>{g.cat}</span>
                  {data && !data.error && data.winner && <span style={{ fontSize: 12.5, color: C.accent2, display: "block", marginTop: 3 }}>Best fit: <strong>{data.winner}</strong></span>}
                </span>
                <ChevronDown size={17} style={{ transform: open ? "none" : "rotate(-90deg)", transition: "transform .2s", color: C.muted, flexShrink: 0 }} />
              </button>
              {open && (
                <div style={{ padding: "8px 16px 16px", background: C.card }}>
                  {ld && !data ? <div style={{ display: "flex", gap: 8, alignItems: "center", color: C.muted, fontSize: 13.5, padding: "8px 0" }}><Loader2 size={15} className="animate-spin" /> Scoring {g.items.length} methods for this business…</div>
                    : data && data.error ? <div style={{ color: "#9a3412", fontSize: 13.5 }}>Couldn't compare — tap to retry.</div>
                      : data ? (
                        <div>
                          {(data.rankings || []).map((r, i) => {
                            const win = r.name === data.winner;
                            const score = Math.max(0, Math.min(100, Number(r.score) || 0));
                            return (
                              <div key={i} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13.5, marginBottom: 3 }}>
                                  <span style={{ fontWeight: win ? 700 : 500, color: win ? C.ink : C.muted, display: "flex", alignItems: "center", gap: 6 }}>{win && <Trophy size={13} color={C.accent} />}{r.name}</span>
                                  <span style={{ fontWeight: 600, color: win ? C.accent2 : C.muted }}>{score}</span>
                                </div>
                                <div style={{ height: 8, background: C.paper, borderRadius: 99, overflow: "hidden", border: `1px solid ${C.line}` }}>
                                  <div style={{ width: `${score}%`, height: "100%", background: win ? C.accent2 : C.line, transition: "width .5s" }} />
                                </div>
                                {r.reason && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{r.reason}</div>}
                              </div>
                            );
                          })}
                          {data.winnerReason && <div style={{ fontSize: 13.5, marginTop: 10, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent}`, borderRadius: 4 }}><strong>{data.winner} wins:</strong> {data.winnerReason}</div>}
                        </div>
                      ) : null}
                </div>
              )}
            </div>
          );
        })}
      </Block>
      )}

      {plan.strategicPriorities && (<Block num={4} icon={Flag} accent={C.accent} title="Strategic priorities">{plan.strategicPriorities.map((p, i) => (<div key={i} style={{ paddingTop: i ? 12 : 0, marginTop: i ? 12 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}><div style={{ fontWeight: 600, fontSize: 15 }}>{p.title}</div>{p.rationale && <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3 }}>{p.rationale}</div>}</div>))}</Block>)}
      {plan.goals && (<Block num={5} icon={Target} accent={C.accent2} title="Goals & objectives">{plan.goals.map((g, i) => (<div key={i} style={{ paddingTop: i ? 14 : 0, marginTop: i ? 14 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}><div style={{ fontWeight: 600, fontSize: 15 }}>{g.goal}</div>{g.objectives && <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{g.objectives.map((o, j) => <li key={j}>{o}</li>)}</ul>}</div>))}</Block>)}
      {plan.initiatives && (<Block num={6} icon={Rocket} accent={C.accent} title="Strategies & initiatives">{plan.initiatives.map((it, i) => (<div key={i} style={{ paddingTop: i ? 13 : 0, marginTop: i ? 13 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}><div style={{ fontWeight: 600, fontSize: 14.5 }}>{it.initiative}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>{it.owner && <Tag>{it.owner}</Tag>}{it.timeframe && <Tag accent>{it.timeframe}</Tag>}{it.linkedGoal && <Tag muted>↳ {it.linkedGoal}</Tag>}</div>{it.dependencies && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6, fontStyle: "italic" }}>Dependencies / watch for: {it.dependencies}</div>}</div>))}</Block>)}

      {plan.roadmap && plan.roadmap.length > 0 && (
        <Block num={7} icon={Map} accent={C.accent} title="Roadmap">
          <p style={{ color: C.muted, fontSize: 12.5, marginTop: 0, marginBottom: 16 }}>The journey at a glance — each phase, when it happens, and what it delivers.</p>
          {plan.roadmap.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < plan.roadmap.length - 1 ? 18 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: 99, background: C.ink, color: C.paper, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                {i < plan.roadmap.length - 1 && <div style={{ width: 2, flex: 1, background: C.line, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6, alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, fontSize: 15, fontFamily: "'Fraunces',serif" }}>{r.phase}</span>
                  {r.timeframe && <span style={{ fontSize: 12.5, color: C.accent, fontWeight: 600 }}>{r.timeframe}</span>}
                </div>
                {r.focus && <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{r.focus}</div>}
                {r.milestones && r.milestones.length > 0 && <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.5 }}>{r.milestones.map((m, j) => <li key={j}>{m}</li>)}</ul>}
              </div>
            </div>
          ))}
        </Block>
      )}

      {/* Financial goals — new section */}
      {plan.financialGoals && (
        <Block num={8} icon={DollarSign} accent={C.accent2} title="Financial goals">
          {plan.financialGoals.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.financialGoals.overview}</p>}
          {plan.financialGoals.targets && plan.financialGoals.targets.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Sub>Targets</Sub>
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", background: C.paper, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted }}>
                  <span style={{ padding: "8px 10px" }}>Goal</span><span style={{ padding: "8px 10px" }}>Target</span><span style={{ padding: "8px 10px" }}>By when</span>
                </div>
                {plan.financialGoals.targets.map((t, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", fontSize: 13.5, borderTop: `1px solid ${C.line}` }}>
                    <span style={{ padding: "8px 10px", fontWeight: 600 }}>{t.goal}</span>
                    <span style={{ padding: "8px 10px", color: C.accent2, fontWeight: 600 }}>{t.target}</span>
                    <span style={{ padding: "8px 10px", color: C.muted }}>{t.timeframe || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {plan.financialGoals.costReduction && <Line label="Cost reduction" text={plan.financialGoals.costReduction} />}
          {plan.financialGoals.profitabilityGoal && <Line label="Profitability goal" text={plan.financialGoals.profitabilityGoal} />}
          {plan.financialGoals.fundingNeeds && <Line label="Funding needs" text={plan.financialGoals.fundingNeeds} />}
          {plan.financialGoals.financialRisks && plan.financialGoals.financialRisks.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Sub>Financial risks</Sub>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.financialGoals.financialRisks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
        </Block>
      )}

      {(plan.kpis || plan.milestones) && (
        <Block num={9} icon={Gauge} accent={C.accent2} title="KPIs, milestones & review cycle">
          {plan.kpis && (<div style={{ marginBottom: plan.milestones ? 16 : 0 }}><Sub>KPIs</Sub>{plan.kpis.map((k, i) => (<Row key={i} left={k.kpi} right={`${k.target}${k.frequency ? " · " + k.frequency : ""}`} last={i === plan.kpis.length - 1} />))}</div>)}
          {plan.milestones && (<div style={{ marginBottom: plan.reviewCycle ? 16 : 0 }}><Sub>Milestones</Sub>{plan.milestones.map((m, i) => (<Row key={i} left={m.milestone} right={m.when} accent last={i === plan.milestones.length - 1} />))}</div>)}
          {plan.reviewCycle && <div><Sub>Review cycle</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{plan.reviewCycle}</p></div>}
        </Block>
      )}

      {(plan.budget || plan.roles || plan.governance) && (
        <Block num={10} icon={Landmark} accent={C.accent} title="Budget, roles & governance">
          {plan.budget && (<div style={{ marginBottom: 16 }}><Sub>Budget</Sub>{plan.budget.map((b, i) => (<div key={i} style={{ padding: "6px 0", borderBottom: i < plan.budget.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ fontWeight: 600 }}>{b.area}</span><span style={{ color: C.accent2, fontWeight: 600, whiteSpace: "nowrap" }}>{b.allocation}</span></div>{b.note && <div style={{ color: C.muted, fontSize: 13 }}>{b.note}</div>}</div>))}</div>)}
          {plan.roles && (<div style={{ marginBottom: plan.governance ? 16 : 0 }}><Sub>Roles & responsibilities</Sub>{plan.roles.map((r, i) => (<div key={i} style={{ padding: "6px 0", borderBottom: i < plan.roles.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}><span style={{ fontWeight: 600 }}>{r.role}</span> — <span style={{ color: C.muted }}>{r.responsibility}</span></div>))}</div>)}
          {plan.governance && <div><Sub>Governance</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{plan.governance}</p></div>}
        </Block>
      )}

      {plan.culturalConsiderations && (
        <Block num={11} icon={Globe} accent={C.accent2} title="Cultural considerations">
          {plan.culturalConsiderations.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.culturalConsiderations.overview}</p>}
          {plan.culturalConsiderations.factors && plan.culturalConsiderations.factors.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Sub>Key factors</Sub>
              {plan.culturalConsiderations.factors.map((fac, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < plan.culturalConsiderations.factors.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{fac.area}</div>
                  <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{fac.insight}</div>
                </div>
              ))}
            </div>
          )}
          {plan.culturalConsiderations.implications && <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent2}`, borderRadius: 4, lineHeight: 1.5 }}><strong>Strategic implication:</strong> {plan.culturalConsiderations.implications}</div>}
        </Block>
      )}

      {plan.complianceRequirements && (
        <Block num={plan.culturalConsiderations ? 12 : 11} icon={BookOpen} accent={C.accent} title="Compliance requirements">
          {plan.complianceRequirements.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.complianceRequirements.overview}</p>}
          {plan.complianceRequirements.areas && plan.complianceRequirements.areas.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {plan.complianceRequirements.areas.map((area, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <Sub>{area.level}</Sub>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{(area.requirements || []).map((req, j) => <li key={j}>{req}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {plan.complianceRequirements.disclaimer && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 8 }}>{plan.complianceRequirements.disclaimer}</div>}
        </Block>
      )}
    </>
  );
}

/* ---------- Business plan view ---------- */
function BusinessView({ plan, org }) {
  return (
    <>
      <section style={{ background: C.ink, color: C.paper, borderRadius: 14, padding: "42px 26px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.accent, fontWeight: 600 }}>Business Plan</div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 40, fontWeight: 600, margin: "14px 0 6px", lineHeight: 1.05 }}>{org}</h1>
        {plan.tagline && <p style={{ fontSize: 16, fontStyle: "italic", color: "#b9c6e0", margin: "0 0 14px" }}>{plan.tagline}</p>}
        <div style={{ fontSize: 12.5, color: "#9fb0d0", letterSpacing: ".04em" }}>{plan.preparedFor ? plan.preparedFor + " · " : ""}{TODAY}</div>
      </section>
      <Block num={1} icon={Sparkles} accent={C.accent} title="Executive summary"><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}>{plan.executiveSummary}</p></Block>
      {plan.businessOverview && (<Block num={2} icon={Building2} accent={C.accent2} title="Business overview">{plan.businessOverview.description && <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.55 }}>{plan.businessOverview.description}</p>}{plan.businessOverview.mission && <Line label="Mission" text={plan.businessOverview.mission} />}{plan.businessOverview.legalStructure && <Line label="Legal structure" text={plan.businessOverview.legalStructure} />}{plan.businessOverview.stage && <Line label="Stage" text={plan.businessOverview.stage} />}{plan.businessOverview.location && <Line label="Location" text={plan.businessOverview.location} />}</Block>)}
      {plan.marketAnalysis && (<Block num={3} icon={TrendingUp} accent={C.accent} title="Market analysis">{plan.marketAnalysis.industryOverview && <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.55 }}>{plan.marketAnalysis.industryOverview}</p>}{plan.marketAnalysis.targetSegments && (<div style={{ marginBottom: 12 }}><Sub>Target segments</Sub>{plan.marketAnalysis.targetSegments.map((s, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{s.segment}</span>{s.need ? <span style={{ color: C.muted }}> — {s.need}</span> : null}</div>))}</div>)}{plan.marketAnalysis.marketSize && <Line label="Market size" text={plan.marketAnalysis.marketSize} />}{plan.marketAnalysis.trends && (<div style={{ margin: "12px 0" }}><Sub>Trends</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.marketAnalysis.trends.map((t, i) => <li key={i}>{t}</li>)}</ul></div>)}{plan.marketAnalysis.competitors && (<div style={{ marginBottom: 12 }}><Sub>Competitors</Sub>{plan.marketAnalysis.competitors.map((c, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{c.name}</span>{c.note ? <span style={{ color: C.muted }}> — {c.note}</span> : null}</div>))}</div>)}{plan.marketAnalysis.positioning && <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent}`, borderRadius: 4 }}><strong>Positioning:</strong> {plan.marketAnalysis.positioning}</div>}</Block>)}
      {plan.productsServices && (<Block num={4} icon={Package} accent={C.accent2} title="Products & services">{plan.productsServices.map((p, i) => (<div key={i} style={{ paddingTop: i ? 13 : 0, marginTop: i ? 13 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>{p.pricing && <Tag accent>{p.pricing}</Tag>}</div>{p.description && <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>{p.description}</div>}{p.usp && <div style={{ fontSize: 13, color: C.accent2, marginTop: 4 }}><strong>Edge:</strong> {p.usp}</div>}</div>))}</Block>)}
      {plan.marketingSales && (<Block num={5} icon={Megaphone} accent={C.accent} title="Marketing & sales">{plan.marketingSales.positioning && <Line label="Positioning" text={plan.marketingSales.positioning} />}{plan.marketingSales.channels && (<div style={{ margin: "10px 0" }}><Sub>Channels</Sub><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{plan.marketingSales.channels.map((c, i) => <Tag key={i}>{c}</Tag>)}</div></div>)}{plan.marketingSales.acquisition && <Line label="Customer acquisition" text={plan.marketingSales.acquisition} />}{plan.marketingSales.salesProcess && <Line label="Sales process" text={plan.marketingSales.salesProcess} />}{plan.marketingSales.pricingStrategy && <Line label="Pricing strategy" text={plan.marketingSales.pricingStrategy} />}</Block>)}
      {plan.operations && (<Block num={6} icon={Settings} accent={C.accent2} title="Operations">{plan.operations.model && <Line label="Operating model" text={plan.operations.model} />}{plan.operations.keyProcesses && (<div style={{ margin: "10px 0" }}><Sub>Key processes</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.operations.keyProcesses.map((p, i) => <li key={i}>{p}</li>)}</ul></div>)}{plan.operations.resources && (<div style={{ margin: "10px 0" }}><Sub>Key resources & suppliers</Sub><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{plan.operations.resources.map((r, i) => <Tag key={i}>{r}</Tag>)}</div></div>)}{plan.operations.technology && <Line label="Technology" text={plan.operations.technology} />}{plan.operations.facilities && <Line label="Facilities / location" text={plan.operations.facilities} />}</Block>)}
      {plan.management && (<Block num={7} icon={Users} accent={C.accent} title="Management & staffing">{plan.management.structure && <Line label="Structure" text={plan.management.structure} />}{plan.management.team && (<div style={{ margin: "10px 0" }}><Sub>Team</Sub>{plan.management.team.map((t, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{t.role}</span>{t.responsibility ? <span style={{ color: C.muted }}> — {t.responsibility}</span> : null}</div>))}</div>)}{plan.management.hiringPlan && (<div style={{ margin: "10px 0" }}><Sub>Hiring plan</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.management.hiringPlan.map((h, i) => <li key={i}>{h}</li>)}</ul></div>)}{plan.management.advisors && <Line label="Advisors / board" text={plan.management.advisors} />}</Block>)}
      {plan.financialPlan && (
        <Block num={8} icon={DollarSign} accent={C.accent2} title="Financial plan">
          {plan.financialPlan.revenueModel && <Line label="Revenue model" text={plan.financialPlan.revenueModel} />}
          {plan.financialPlan.projections && (<div style={{ margin: "12px 0" }}><Sub>Projections (illustrative)</Sub><div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}><div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", background: C.paper, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted }}><span style={{ padding: "8px 10px" }}>Period</span><span style={{ padding: "8px 10px" }}>Revenue</span><span style={{ padding: "8px 10px" }}>Costs</span><span style={{ padding: "8px 10px" }}>Profit</span></div>{plan.financialPlan.projections.map((r, i) => (<div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", fontSize: 13.5, borderTop: `1px solid ${C.line}` }}><span style={{ padding: "8px 10px", fontWeight: 600 }}>{r.period}</span><span style={{ padding: "8px 10px" }}>{r.revenue}</span><span style={{ padding: "8px 10px" }}>{r.costs}</span><span style={{ padding: "8px 10px", color: C.accent2, fontWeight: 600 }}>{r.profit}</span></div>))}</div></div>)}
          {plan.financialPlan.assumptions && (<div style={{ margin: "10px 0" }}><Sub>Key assumptions</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.financialPlan.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></div>)}
          {plan.financialPlan.fundingRequirement && <Line label="Funding requirement" text={plan.financialPlan.fundingRequirement} />}
          {plan.financialPlan.breakEven && <Line label="Break-even" text={plan.financialPlan.breakEven} />}
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12, fontStyle: "italic" }}>Figures are illustrative estimates based on the stated assumptions — validate with real data and a qualified advisor before use.</div>
        </Block>
      )}
      {plan.appendices && (<Block num={9} icon={Paperclip} accent={C.accent} title="Appendices"><p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>Suggested supporting documents to attach:</p><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{plan.appendices.map((a, i) => <li key={i}>{a}</li>)}</ul></Block>)}

      {plan.culturalConsiderations && (
        <Block num={10} icon={Globe} accent={C.accent2} title="Cultural considerations">
          {plan.culturalConsiderations.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.culturalConsiderations.overview}</p>}
          {plan.culturalConsiderations.factors && plan.culturalConsiderations.factors.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Sub>Key factors</Sub>
              {plan.culturalConsiderations.factors.map((fac, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < plan.culturalConsiderations.factors.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{fac.area}</div>
                  <div style={{ fontSize: 13.5, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>{fac.insight}</div>
                </div>
              ))}
            </div>
          )}
          {plan.culturalConsiderations.implications && <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent2}`, borderRadius: 4, lineHeight: 1.5 }}><strong>Strategic implication:</strong> {plan.culturalConsiderations.implications}</div>}
        </Block>
      )}

      {plan.complianceRequirements && (
        <Block num={plan.culturalConsiderations ? 11 : 10} icon={BookOpen} accent={C.accent} title="Compliance requirements">
          {plan.complianceRequirements.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.complianceRequirements.overview}</p>}
          {plan.complianceRequirements.areas && plan.complianceRequirements.areas.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              {plan.complianceRequirements.areas.map((area, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <Sub>{area.level}</Sub>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{(area.requirements || []).map((req, j) => <li key={j}>{req}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {plan.complianceRequirements.disclaimer && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 8 }}>{plan.complianceRequirements.disclaimer}</div>}
        </Block>
      )}
    </>
  );
}

/* ---------- Shared components ---------- */
function Block({ icon: Icon, accent, title, num, children }) {
  return (
    <section className="hover-lift" style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginBottom: 16, boxShadow: "0 1px 2px rgba(11,18,32,0.04), 0 10px 24px -16px rgba(11,18,32,0.18)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        {num != null && <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: `linear-gradient(145deg, ${C.accent2}, ${C.accent})`, width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 8px -2px rgba(37,99,235,0.5)" }}>{num}</span>}
        <Icon size={18} color={accent} />
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 21, fontWeight: 600, margin: 0, color: C.ink }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Line({ label, text }) { return (<div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 15, lineHeight: 1.5, marginTop: 2 }}>{text}</div></div>); }
function Sub({ children }) { return <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontWeight: 700, marginBottom: 8 }}>{children}</div>; }
function Tag({ children, accent, muted }) { return <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 6, padding: "3px 9px", background: accent ? C.accent : C.paper, color: accent ? C.card : (muted ? C.muted : C.ink), border: accent ? "none" : `1px solid ${C.line}` }}>{children}</span>; }
function Row({ left, right, accent, last }) { return (<div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: last ? "none" : `1px solid ${C.line}`, fontSize: 14 }}><span>{left}</span><span style={{ color: accent ? C.accent : C.muted, fontWeight: accent ? 600 : 400, whiteSpace: "nowrap" }}>{right}</span></div>); }
