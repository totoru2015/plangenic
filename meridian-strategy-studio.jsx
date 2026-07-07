import React, { useState } from "react";
import {
  Compass, FileText, Users, Briefcase, Loader2, Sparkles, AlertCircle,
  Target, Layers, ChevronRight, ChevronDown, Check, Wand2, Flag, Globe,
  Rocket, Gauge, Landmark, Heart, Building2, TrendingUp, Package,
  Megaphone, Settings, DollarSign, Paperclip, BarChart3, Trophy, Map, Download, FileType,
  Shield, Upload, ImagePlus
} from "lucide-react";

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap');
@keyframes rise { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform:none;} }
.rise { animation: rise .5s cubic-bezier(.2,.7,.3,1) both; }
`;

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
  { key: "governance", label: "Budget, roles & governance" },
];
const BIZ_STEPS = [
  { key: "boverview", label: "Summary & business overview" },
  { key: "bmarket", label: "Market analysis" },
  { key: "boffering", label: "Products, marketing & sales" },
  { key: "bops", label: "Operations & team" },
  { key: "bfin", label: "Financial plan & appendices" },
];
const EXTRA_STEPS = {
  cultural: { key: "cultural", label: "Cultural considerations" },
  compliance: { key: "compliance", label: "Compliance requirements" },
};

async function callClaude(system, userContent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  let res;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content: userContent }] }),
    });
  } catch (e) {
    clearTimeout(timer);
    throw new Error(e.name === "AbortError" ? "The request timed out." : "Couldn't reach the AI service (network/connection).");
  }
  clearTimeout(timer);
  if (!res.ok) {
    let detail = "";
    try { const j = await res.json(); detail = j && j.error ? (j.error.message || j.error.type || "") : ""; } catch (_) {}
    throw new Error(`AI service error ${res.status}${detail ? ": " + detail : ""}`);
  }
  const data = await res.json();
  const text = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).filter(Boolean).join("\n");
  if (!text) throw new Error("The AI returned an empty response.");
  return text;
}
function extractJson(text) {
  let t = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(t); } catch (e) {}
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e !== -1) return JSON.parse(t.slice(s, e + 1));
  throw new Error("parse");
}
const CONSULTANT = "You are a senior management and business-planning consultant with 25 years of experience across industries. You produce rigorous, specific, realistic documents. Never use placeholder or filler text. Return only the requested JSON.";
const C = { paper: "#f6f2e9", ink: "#191e2b", accent: "#b07d33", accent2: "#3a5a52", muted: "#6b6f7a", line: "#dcd5c6", card: "#fffdf8" };
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
    if (plan.kpis) push("KPIs", bullets(plan.kpis, (k) => `• ${k.kpi}: ${k.target}${k.frequency ? ` (${k.frequency})` : ""}`));
    if (plan.milestones) push("Milestones", bullets(plan.milestones, (m) => `• ${m.milestone} — ${m.when}`));
    push("Review Cycle", [plan.reviewCycle]);
    if (plan.budget) push("Budget", bullets(plan.budget, (b) => `• ${b.area}: ${b.allocation}${b.note ? ` — ${b.note}` : ""}`));
    if (plan.roles) push("Roles & Responsibilities", bullets(plan.roles, (r) => `• ${r.role} — ${r.responsibility}`));
    push("Governance", [plan.governance]);
    if (plan.culturalConsiderations) {
      const cc = plan.culturalConsiderations;
      push("Cultural Considerations", [cc.overview, ...(cc.factors || []).map((f) => `• ${f.area}: ${f.insight}`), cc.implications && `Strategic implication: ${cc.implications}`]);
    }
    if (plan.complianceRequirements) {
      const cr = plan.complianceRequirements;
      push("Compliance Requirements", [cr.overview, ...(cr.areas || []).flatMap((a) => [`${a.level}:`, ...(a.requirements || []).map((r) => `  • ${r}`)]), cr.disclaimer]);
    }
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
    if (plan.culturalConsiderations) {
      const cc = plan.culturalConsiderations;
      push("Cultural Considerations", [cc.overview, ...(cc.factors || []).map((f) => `• ${f.area}: ${f.insight}`), cc.implications && `Strategic implication: ${cc.implications}`]);
    }
    if (plan.complianceRequirements) {
      const cr = plan.complianceRequirements;
      push("Compliance Requirements", [cr.overview, ...(cr.areas || []).flatMap((a) => [`${a.level}:`, ...(a.requirements || []).map((r) => `  • ${r}`)]), cr.disclaimer]);
    }
  }
  return S;
}

const inputStyle = { width: "100%", border: `1px solid ${C.line}`, background: C.card, color: C.ink, borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "'Hanken Grotesk',sans-serif", outline: "none", boxSizing: "border-box" };
const Field = ({ label, children }) => (<label style={{ display: "block" }}><span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>{label}</span><div style={{ marginTop: 6 }}>{children}</div></label>);

export default function App() {
  const [docType, setDocType] = useState("strategic");
  const [role, setRole] = useState("owner");
  const [f, setF] = useState({
    org: "", industry: "", stage: STAGES[1], goals: "", objectives: "",
    horizon: HORIZONS[2], constraints: "",
    includeCultural: false,
    compliance: [],
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleCompliance = (level) => setF((p) => ({
    ...p,
    compliance: p.compliance.includes(level) ? p.compliance.filter((x) => x !== level) : [...p.compliance, level],
  }));

  const [recMode, setRecMode] = useState(true);
  const chooseRole = (r) => { setRole(r); setRecMode(r === "owner"); };
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
  const [genCultural, setGenCultural] = useState(false);
  const [genCompliance, setGenCompliance] = useState([]);

  const [fwData, setFwData] = useState({});
  const [fwOpen, setFwOpen] = useState({});
  const [fwLoading, setFwLoading] = useState({});

  const [active, setActive] = useState("business");
  const [versions, setVersions] = useState({});
  const [vLoading, setVLoading] = useState(false);

  // Branding for export cover
  const [brand, setBrand] = useState({ logoUrl: "", businessName: "", aim: "" });
  const setBrandField = (k) => (e) => setBrand((p) => ({ ...p, [k]: e.target.value }));

  const ctx = () => `Organization: ${f.org}
Industry / sector: ${f.industry || "not specified"}
Current stage: ${f.stage}
${docType === "strategic" ? "Planning" : "Projection"} horizon: ${f.horizon}
Goals: ${f.goals}
Key objectives: ${f.objectives || "infer from the goals"}
Known constraints / anticipated delays: ${f.constraints || "none stated"}`;

  async function runStep(key, prompt) {
    setSteps((p) => ({ ...p, [key]: "doing" }));
    try { const out = extractJson(await callClaude(CONSULTANT, prompt)); setSteps((p) => ({ ...p, [key]: "done" })); return out; }
    catch (e) { setSteps((p) => ({ ...p, [key]: "error" })); setGenErr((e && e.message) ? e.message : "Generation failed."); return null; }
  }

  async function generate() {
    if (!f.org.trim() || !f.goals.trim()) { setError("Please add at least the organization name and its goals."); return; }
    setError(""); setGenErr(""); setLoading(true); setPlan(null); setPlanFw([]); setFwReasons({}); setFwRationale(""); setFwData({}); setFwOpen({}); setVersions({}); setSteps({});
    setPlanType(docType);
    setGenCultural(f.includeCultural);
    setGenCompliance([...f.compliance]);
    setBrand((p) => ({ ...p, businessName: p.businessName || f.org }));
    if (docType === "strategic") await generateStrategic(); else await generateBusiness();
    setLoading(false);
  }

  async function generateStrategic() {
    let acc = {};
    const consultantPicked = role === "consultant" && selFw.length > 0;
    const fwInstruction = consultantPicked
      ? `The consultant has chosen these frameworks; echo them in "recommendedFrameworks" and briefly note in "frameworkRationale" why this set works: ${selFw.join("; ")}.`
      : `Act as the consultant. Based specifically on the business's STAGE (${f.stage}) and its GOALS, choose the 4-6 MOST suitable frameworks from this list and return their exact names in "recommendedFrameworks". In "frameworkReasons" give a one-sentence plain-language reason for EACH chosen framework (why it fits this stage/goal). In "frameworkRationale" give one sentence on the overall approach. List: ${ALL_FW.join("; ")}.`;

    const fnd = await runStep("foundations", `Create the foundation of a strategic plan.\n\n${ctx()}\n\n${fwInstruction}\n\nReturn ONLY JSON:\n{ "executiveSummary":"3-5 sentence overview", "mission":"one sentence", "vision":"one sentence", "values":["4-6 short values"], "strategicPriorities":[{"title":"...","rationale":"1 sentence"}], "recommendedFrameworks":["..."], "frameworkRationale":"one sentence", "frameworkReasons":{"Framework name":"why it fits"} }\n3-5 priorities. Tailor to the ${f.horizon} horizon.`);
    if (fnd) {
      acc = { ...acc, ...fnd }; setPlan({ ...acc });
      setPlanFw(fnd.recommendedFrameworks && fnd.recommendedFrameworks.length ? fnd.recommendedFrameworks : (consultantPicked ? selFw : ["SWOT Analysis", "PESTLE Analysis", "Porter's Five Forces"]));
      setFwReasons(fnd.frameworkReasons || {});
      setFwRationale(fnd.frameworkRationale || "");
    }

    const env = await runStep("environment", `Produce an environmental scan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "environmentalScan":[ {"area":"Macro (PESTLE)","insights":["..."]}, {"area":"Industry & competition","insights":["..."]}, {"area":"Market & customers","insights":["..."]}, {"area":"Internal capabilities","insights":["..."]} ] }\n2-4 insights per area, specific to them.`);
    if (env) { acc = { ...acc, ...env }; setPlan({ ...acc }); }

    const pl = await runStep("plan", `Define goals, objectives and initiatives.\n\n${ctx()}\nPriorities: ${JSON.stringify(acc.strategicPriorities || [])}\n\nReturn ONLY JSON:\n{ "goals":[{"goal":"...","objectives":["..."]}], "initiatives":[{"initiative":"...","linkedGoal":"...","owner":"function/role","timeframe":"e.g. Q1-Q2 Yr1","dependencies":"key dependencies or likely delays"}] }\n3-5 goals; 4-8 initiatives. Tailor timeframes to the ${f.horizon} horizon.`);
    if (pl) { acc = { ...acc, ...pl }; setPlan({ ...acc }); }

    const ex = await runStep("execution", `Define measurement, review, a phased roadmap, and a plain-language stakeholder summary.\n\n${ctx()}\nGoals: ${JSON.stringify(acc.goals || [])}\n\nReturn ONLY JSON:\n{ "kpis":[{"kpi":"...","target":"...","frequency":"e.g. Monthly"}], "milestones":[{"milestone":"...","when":"e.g. End of Yr1"}], "reviewCycle":"2-3 sentences", "roadmap":[{"phase":"Phase 1: name","timeframe":"e.g. Months 0-6","focus":"one line on the focus of this phase","milestones":["key deliverable","key deliverable"]}], "stakeholderSummary":"3-5 sentences in plain, jargon-free language that any stakeholder — staff, investor, partner — can understand: what we're doing, why, and what success looks like." }\n5-8 KPIs; 4-6 milestones; 3-6 roadmap phases aligned to the ${f.horizon} horizon.`);
    if (ex) { acc = { ...acc, ...ex }; setPlan({ ...acc }); }

    const gov = await runStep("governance", `Define budget, roles and governance.\n\n${ctx()}\nInitiatives: ${JSON.stringify(acc.initiatives || [])}\n\nReturn ONLY JSON:\n{ "budget":[{"area":"...","allocation":"% or $ band","note":"..."}], "roles":[{"role":"...","responsibility":"..."}], "governance":"2-4 sentences" }\nRealistic for a ${f.stage} organization.`);
    if (gov) { acc = { ...acc, ...gov }; setPlan({ ...acc }); }

    if (f.includeCultural) {
      const cult = await runStep("cultural", `Generate a cultural considerations section for this strategic plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "culturalConsiderations": { "overview": "2-3 sentences on the cultural context relevant to this business's market, workforce, and customers", "factors": [{"area": "e.g. Workforce diversity", "insight": "specific, actionable observation for this business"}], "implications": "1-2 sentences on how these cultural factors should shape the strategy" } }\n3-5 factors specific to this industry and business.`);
      if (cult) { acc = { ...acc, ...cult }; setPlan({ ...acc }); }
    }

    if (f.compliance.length > 0) {
      const levels = f.compliance.map((c) => c === "local" ? "Local Council" : c === "state" ? "State" : "Federal").join(", ");
      const comp = await runStep("compliance", `Generate a compliance requirements section for these levels: ${levels}.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "complianceRequirements": { "overview": "2-3 sentences on the compliance landscape for this business", "areas": [{"level": "Local Council / State / Federal", "requirements": ["specific requirement relevant to this industry"]}], "disclaimer": "one sentence advising the reader to seek qualified legal and regulatory advice" } }\nInclude only the levels requested: ${levels}. Be specific to the industry and business stage.`);
      if (comp) { acc = { ...acc, ...comp }; setPlan({ ...acc }); }
    }
  }

  async function generateBusiness() {
    let acc = {};
    const o = await runStep("boverview", `Create the opening of a business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "tagline":"short evocative tagline", "preparedFor":"likely audience e.g. Prospective investors", "executiveSummary":"4-6 sentences", "businessOverview":{"description":"what the business does","mission":"one sentence","legalStructure":"suggest a sensible structure if unknown","stage":"...","location":"infer or 'to be confirmed'"} }`);
    if (o) { acc = { ...acc, ...o }; setPlan({ ...acc }); }

    const m = await runStep("bmarket", `Write the market analysis for this business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "marketAnalysis":{ "industryOverview":"2-3 sentences", "targetSegments":[{"segment":"...","need":"..."}], "marketSize":"TAM/SAM/SOM note, qualitative if figures unknown", "trends":["..."], "competitors":[{"name":"...","note":"how this business differs"}], "positioning":"one sentence" } }\nBe specific to the industry.`);
    if (m) { acc = { ...acc, ...m }; setPlan({ ...acc }); }

    const off = await runStep("boffering", `Define products/services and the marketing & sales approach.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "productsServices":[{"name":"...","description":"...","pricing":"price or model","usp":"why it wins"}], "marketingSales":{"positioning":"...","channels":["..."],"acquisition":"how customers are won","salesProcess":"...","pricingStrategy":"..."} }\n2-5 products/services.`);
    if (off) { acc = { ...acc, ...off }; setPlan({ ...acc }); }

    const ops = await runStep("bops", `Define operations and the management & staffing plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "operations":{"model":"how it runs day to day","keyProcesses":["..."],"resources":["key resources/suppliers"],"technology":"...","facilities":"location/facilities"}, "management":{"structure":"...","team":[{"role":"...","responsibility":"..."}],"hiringPlan":["roles to add & when"],"advisors":"optional advisors/board"} }`);
    if (ops) { acc = { ...acc, ...ops }; setPlan({ ...acc }); }

    const fin = await runStep("bfin", `Build the financial plan and appendices.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "financialPlan":{"revenueModel":"how money is made","assumptions":["key assumptions behind the numbers"],"projections":[{"period":"Year 1","revenue":"$ figure or band","costs":"$ figure or band","profit":"$ figure or band"}],"fundingRequirement":"how much is needed and for what (or 'self-funded')","breakEven":"when/how break-even is reached"}, "appendices":["suggested supporting documents to attach"] }\nProvide 3 years of projections aligned to the ${f.horizon} horizon. Figures are illustrative estimates grounded in the assumptions.`);
    if (fin) { acc = { ...acc, ...fin }; setPlan({ ...acc }); }

    if (f.includeCultural) {
      const cult = await runStep("cultural", `Generate a cultural considerations section for this business plan.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "culturalConsiderations": { "overview": "2-3 sentences on the cultural context relevant to this business's market, workforce, and customers", "factors": [{"area": "e.g. Customer communication norms", "insight": "specific, actionable observation for this business"}], "implications": "1-2 sentences on how these cultural factors should shape the business model or operations" } }\n3-5 factors specific to this industry and business.`);
      if (cult) { acc = { ...acc, ...cult }; setPlan({ ...acc }); }
    }

    if (f.compliance.length > 0) {
      const levels = f.compliance.map((c) => c === "local" ? "Local Council" : c === "state" ? "State" : "Federal").join(", ");
      const comp = await runStep("compliance", `Generate a compliance requirements section for these levels: ${levels}.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "complianceRequirements": { "overview": "2-3 sentences on the compliance landscape for this business", "areas": [{"level": "Local Council / State / Federal", "requirements": ["specific requirement relevant to this industry"]}], "disclaimer": "one sentence advising the reader to seek qualified legal and regulatory advice" } }\nInclude only the levels requested: ${levels}. Be specific to the industry and business stage.`);
      if (comp) { acc = { ...acc, ...comp }; setPlan({ ...acc }); }
    }
  }

  async function loadFramework(name) {
    if (fwData[name] || fwLoading[name]) return;
    setFwLoading((p) => ({ ...p, [name]: true }));
    try {
      const out = extractJson(await callClaude(CONSULTANT, `Apply the "${name}" framework to the organization below; be specific.\n\n${ctx()}\n\nReturn ONLY JSON:\n{ "summary":"1-2 sentences", "sections":[{"heading":"a standard component of ${name}","points":["..."]}], "implication":"1-2 sentences" }\nUse the recognised components of ${name} as headings.`));
      setFwData((p) => ({ ...p, [name]: out }));
    } catch (e) { setFwData((p) => ({ ...p, [name]: { error: true } })); }
    finally { setFwLoading((p) => ({ ...p, [name]: false })); }
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
    } catch (e) { setVersions((p) => ({ ...p, [key]: "Could not generate this version — try again." })); }
    finally { setVLoading(false); }
  }

  function resetAll() {
    setF({ org: "", industry: "", stage: STAGES[1], goals: "", objectives: "", horizon: HORIZONS[2], constraints: "", includeCultural: false, compliance: [] });
    setSelFw([]); setOpenCats({ "Strategy & competitive": true });
    setPlan(null); setPlanFw([]); setFwReasons({}); setFwRationale("");
    setFwData({}); setFwOpen({}); setVersions({}); setSteps({});
    setError(""); setGenErr(""); setGenCultural(false); setGenCompliance([]);
    setBrand({ logoUrl: "", businessName: "", aim: "" });
  }

  const done = plan && !loading;
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function buildPlanHTML(plan, planType, org, forWord, br) {
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

    const brandName = (br && br.businessName) ? br.businessName : (org || "");
    const brandAim = (br && br.aim) ? br.aim : "";
    const logoHtml = (br && br.logoUrl) ? `<img src="${br.logoUrl}" style="max-height:80px;max-width:200px;object-fit:contain;display:block;margin-bottom:12px;" />` : "";

    const css = `body{font-family:Georgia,'Times New Roman',serif;color:#191e2b;line-height:1.5;max-width:780px;margin:0 auto;padding:40px}
h1{font-size:30px;margin:0 0 2px} h2{font-size:17px;border-bottom:1px solid #dcd5c6;padding-bottom:5px;margin:26px 0 10px;color:#191e2b}
p{margin:5px 0;font-size:13.5px} .meta{color:#6b6f7a;font-size:12px;margin-bottom:8px}
.cover{border-left:5px solid #b07d33;padding-left:14px;margin-bottom:18px}
.aim{font-style:italic;color:#3a5a52;font-size:14px;margin-top:4px;}`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(brandName || title)}</title><style>${css}</style></head>
<body><div class="cover">${logoHtml}<div class="meta">${escapeHtml(title.toUpperCase())}</div><h1>${escapeHtml(brandName || "Untitled")}</h1>${brandAim ? `<div class="aim">${escapeHtml(brandAim)}</div>` : ""}<div class="meta">${TODAY}</div></div>${body}</body></html>`;
  }

  function exportDOCX(plan, planType, org) {
    setExporting(true); setExportMsg("");
    try {
      const html = buildPlanHTML(plan, planType, org, true, brand);
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
      const html = buildPlanHTML(plan, planType, org, false, brand);
      const w = window.open("", "_blank");
      if (!w) { setExportMsg("Please allow pop-ups for this site, then tap PDF again."); setExporting(false); return; }
      w.document.open(); w.document.write(html + `<script>window.onload=function(){setTimeout(function(){window.print();},300);}<\/script>`); w.document.close();
      setExportMsg("✓ A print window opened — choose "Save as PDF" as the destination.");
    } catch (e) { setExportMsg("Couldn't open the PDF view: " + (e.message || e)); }
    finally { setExporting(false); }
  }

  const baseSteps = docType === "strategic" ? STRAT_STEPS : BIZ_STEPS;
  const activeSteps = [
    ...baseSteps,
    ...(f.includeCultural ? [EXTRA_STEPS.cultural] : []),
    ...(f.compliance.length ? [EXTRA_STEPS.compliance] : []),
  ];

  return (
    <div style={{ background: C.paper, color: C.ink, minHeight: "100%", fontFamily: "'Hanken Grotesk',sans-serif" }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 22px 64px" }}>

        <header className="rise" style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: 18, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Compass size={22} color={C.accent} />
              <span style={{ fontSize: 12, letterSpacing: ".32em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>Strategy & business planning</span>
            </div>
            <button onClick={resetAll} title="Clear everything and start a new business" style={{ cursor: "pointer", border: `1px solid ${C.line}`, background: C.card, color: C.muted, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              ↺ New business
            </button>
          </div>
          <h1 style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, fontSize: 38, lineHeight: 1.05, margin: "10px 0 4px" }}>Plangenic</h1>
          <p style={{ color: C.muted, fontSize: 15, margin: 0 }}>Board-ready strategic plans and full business plans — drafted in minutes.</p>
        </header>

        {/* Role selector */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>I am a…</span>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[["owner", "Business owner", "The app chooses the right analysis methods for your business stage and goals."], ["consultant", "Business consultant", "Full access — choose any model, framework or method yourself."]].map(([k, lbl, desc]) => {
              const on = role === k;
              return (
                <button key={k} onClick={() => chooseRole(k)} style={{ flex: 1, textAlign: "left", cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>{lbl}</div>
                  <div style={{ fontSize: 12, color: on ? "#cdc6b8" : C.muted, marginTop: 3, lineHeight: 1.4 }}>{desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Doc type switch */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["strategic", "Strategic plan"], ["business", "Business plan"]].map(([k, lbl]) => {
            const on = docType === k;
            return <button key={k} onClick={() => setDocType(k)} style={{ flex: 1, cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 10, padding: "11px 14px", fontSize: 14.5, fontWeight: 600, fontFamily: "'Fraunces',serif" }}>{lbl}</button>;
          })}
        </div>

        {/* Inputs */}
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
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Cultural considerations */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: f.includeCultural ? "#eef4f2" : C.paper, border: `1px solid ${f.includeCultural ? C.accent2 : C.line}`, borderRadius: 10, padding: "12px 14px" }}>
                <input type="checkbox" checked={f.includeCultural} onChange={(e) => setF((p) => ({ ...p, includeCultural: e.target.checked }))} style={{ marginTop: 2, accentColor: C.accent2, width: 16, height: 16, flexShrink: 0 }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: C.ink }}>
                    <Globe size={15} color={C.accent2} /> Cultural considerations
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3, lineHeight: 1.4 }}>Adds a section analysing cultural factors relevant to your market, workforce, and customers — and their strategic implications.</div>
                </div>
              </label>

              {/* Compliance requirements */}
              <div style={{ background: f.compliance.length ? "#eef4f2" : C.paper, border: `1px solid ${f.compliance.length ? C.accent2 : C.line}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 8 }}>
                  <Shield size={15} color={C.accent2} /> Compliance requirements
                </div>
                <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, lineHeight: 1.4 }}>Select the levels of compliance to include in the plan. The AI will outline key obligations relevant to your industry.</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[["local", "Local Council"], ["state", "State"], ["federal", "Federal"]].map(([val, lbl]) => {
                    const on = f.compliance.includes(val);
                    return (
                      <label key={val} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 8, padding: "7px 12px", fontSize: 13.5, fontWeight: 500, userSelect: "none" }}>
                        <input type="checkbox" checked={on} onChange={() => toggleCompliance(val)} style={{ display: "none" }} />
                        {on && <Check size={13} color={C.accent} />}
                        {lbl}
                      </label>
                    );
                  })}
                </div>
              </div>

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
          <button onClick={generate} disabled={loading} style={{ marginTop: 20, width: "100%", border: "none", cursor: loading ? "wait" : "pointer", background: C.ink, color: C.paper, padding: "13px 18px", borderRadius: 9, fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
            {loading ? <><Loader2 size={17} className="animate-spin" /> Building your {docType === "strategic" ? "strategic plan" : "business plan"}…</> : <><Sparkles size={17} color={C.accent} /> Generate {docType === "strategic" ? "strategic plan" : "business plan"}</>}
          </button>
        </section>

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

        {!loading && genErr && !plan && (
          <section className="rise" style={{ background: "#fdecec", border: "1px solid #f3c2c2", borderRadius: 14, padding: 18, marginBottom: 24, color: "#9a3412", fontSize: 13.5 }}>
            <strong>Couldn't generate the plan.</strong> {genErr}
            <div style={{ marginTop: 6, color: "#7a3010" }}>If this says network or connection, the AI call is being blocked in this preview — it will work once the app is deployed. Otherwise tap Generate to retry.</div>
          </section>
        )}

        {plan && (
          <div className="rise">
            {done && (
              <section style={{ background: C.ink, color: C.paper, borderRadius: 14, padding: "18px 22px", marginBottom: 16 }}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 600 }}>Your {planType === "strategic" ? "strategic plan" : "business plan"} is ready</div>
                    <div style={{ fontSize: 12.5, color: "#cdc6b8", marginTop: 2 }}>Add your branding below, then download as PDF or Word.</div>
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => exportPDF(plan, planType, f.org)} disabled={exporting} style={{ cursor: exporting ? "wait" : "pointer", border: "none", background: C.accent, color: "#fff", borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Download size={15} /> PDF</button>
                    <button onClick={() => exportDOCX(plan, planType, f.org)} disabled={exporting} style={{ cursor: exporting ? "wait" : "pointer", border: "none", background: C.paper, color: C.ink, borderRadius: 8, padding: "10px 15px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><FileType size={15} /> Word (.doc)</button>
                  </div>
                </div>

                {/* Branding panel */}
                <div style={{ marginTop: 18, borderTop: "1px solid #2e3547", paddingTop: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: ".09em", textTransform: "uppercase", color: "#7a8299", fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <ImagePlus size={13} /> Personalise your document cover (optional)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 12, alignItems: "start" }}>
                    {/* Logo upload */}
                    <div>
                      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", border: "1px dashed #3e4a66", borderRadius: 8, padding: "10px 14px", minWidth: 90, minHeight: 64, background: "#1e2535", color: "#7a8299", fontSize: 12, textAlign: "center" }}>
                        {brand.logoUrl
                          ? <img src={brand.logoUrl} alt="logo" style={{ maxHeight: 48, maxWidth: 88, objectFit: "contain", borderRadius: 4 }} />
                          : <><Upload size={18} color="#4a5578" /><span>Upload logo</span></>
                        }
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setBrand((p) => ({ ...p, logoUrl: ev.target.result }));
                          reader.readAsDataURL(file);
                        }} />
                      </label>
                      {brand.logoUrl && (
                        <button onClick={() => setBrand((p) => ({ ...p, logoUrl: "" }))} style={{ marginTop: 4, fontSize: 11, color: "#7a8299", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "center" }}>Remove</button>
                      )}
                    </div>
                    {/* Business name */}
                    <div>
                      <div style={{ fontSize: 11, color: "#7a8299", letterSpacing: ".07em", textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Business name</div>
                      <input value={brand.businessName} onChange={setBrandField("businessName")} placeholder={f.org || "Your business name"} style={{ ...inputStyle, background: "#1e2535", border: "1px solid #2e3a55", color: C.paper, borderRadius: 7 }} />
                    </div>
                    {/* Aim */}
                    <div>
                      <div style={{ fontSize: 11, color: "#7a8299", letterSpacing: ".07em", textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>Your aim / tagline</div>
                      <input value={brand.aim} onChange={setBrandField("aim")} placeholder="e.g. Building a sustainable future in logistics" style={{ ...inputStyle, background: "#1e2535", border: "1px solid #2e3a55", color: C.paper, borderRadius: 7 }} />
                    </div>
                  </div>
                </div>
              </section>
            )}
            {exportMsg && <div style={{ fontSize: 13, color: exportMsg.startsWith("✓") ? C.accent2 : "#9a3412", marginBottom: 12 }}>{exportMsg}</div>}
            {planType === "strategic" ? <StrategicView plan={plan} planFw={planFw} fwReasons={fwReasons} fwRationale={fwRationale} fwOpen={fwOpen} fwData={fwData} fwLoading={fwLoading} toggleFwCard={toggleFwCard} bizCtx={ctx()} genCultural={genCultural} genCompliance={genCompliance} /> : <BusinessView plan={plan} org={f.org} genCultural={genCultural} genCompliance={genCompliance} />}

            {done && (
              <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginTop: 8 }}>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Tailored versions</div>
                <p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>The same document, written for three different audiences.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {Object.keys(VERSION_META).map((k) => { const M = VERSION_META[k]; const Ic = M.icon; const on = active === k; return <button key={k} onClick={() => loadVersion(k)} style={{ cursor: "pointer", border: `1px solid ${on ? C.ink : C.line}`, background: on ? C.ink : C.card, color: on ? C.paper : C.ink, borderRadius: 9, padding: "9px 14px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}><Ic size={15} /> {M.label}</button>; })}
                </div>
                <p style={{ color: C.muted, fontSize: 13, marginTop: 0, marginBottom: 14 }}>{VERSION_META[active].hint}</p>
                <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: 18, minHeight: 110 }}>
                  {vLoading && !versions[active] ? <div style={{ display: "flex", gap: 9, alignItems: "center", color: C.muted, fontSize: 14 }}><Loader2 size={16} className="animate-spin" /> Writing the {VERSION_META[active].label} version…</div>
                    : versions[active] ? <pre style={{ whiteSpace: "pre-wrap", fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{versions[active]}</pre>
                      : <button onClick={() => loadVersion(active)} style={{ cursor: "pointer", border: "none", background: "transparent", color: C.accent, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>Generate the {VERSION_META[active].label} version <ChevronRight size={16} /></button>}
                </div>
              </section>
            )}
          </div>
        )}

        {!plan && !loading && <p style={{ textAlign: "center", color: C.muted, fontSize: 13.5, marginTop: 8 }}>Pick a document type, fill in the brief, and generate.</p>}
      </div>
    </div>
  );
}

/* ---------- Strategic plan view ---------- */
function StrategicView({ plan, planFw, fwReasons, fwRationale, fwOpen, fwData, fwLoading, toggleFwCard, bizCtx, genCultural, genCompliance }) {
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

      {/* Best-method-per-category comparison */}
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

      {(plan.kpis || plan.milestones) && (
        <Block num={8} icon={Gauge} accent={C.accent2} title="KPIs, milestones & review cycle">
          {plan.kpis && (<div style={{ marginBottom: plan.milestones ? 16 : 0 }}><Sub>KPIs</Sub>{plan.kpis.map((k, i) => (<Row key={i} left={k.kpi} right={`${k.target}${k.frequency ? " · " + k.frequency : ""}`} last={i === plan.kpis.length - 1} />))}</div>)}
          {plan.milestones && (<div style={{ marginBottom: plan.reviewCycle ? 16 : 0 }}><Sub>Milestones</Sub>{plan.milestones.map((m, i) => (<Row key={i} left={m.milestone} right={m.when} accent last={i === plan.milestones.length - 1} />))}</div>)}
          {plan.reviewCycle && <div><Sub>Review cycle</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{plan.reviewCycle}</p></div>}
        </Block>
      )}

      {(plan.budget || plan.roles || plan.governance) && (
        <Block num={9} icon={Landmark} accent={C.accent} title="Budget, roles & governance">
          {plan.budget && (<div style={{ marginBottom: 16 }}><Sub>Budget</Sub>{plan.budget.map((b, i) => (<div key={i} style={{ padding: "6px 0", borderBottom: i < plan.budget.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ fontWeight: 600 }}>{b.area}</span><span style={{ color: C.accent2, fontWeight: 600, whiteSpace: "nowrap" }}>{b.allocation}</span></div>{b.note && <div style={{ color: C.muted, fontSize: 13 }}>{b.note}</div>}</div>))}</div>)}
          {plan.roles && (<div style={{ marginBottom: plan.governance ? 16 : 0 }}><Sub>Roles & responsibilities</Sub>{plan.roles.map((r, i) => (<div key={i} style={{ padding: "6px 0", borderBottom: i < plan.roles.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}><span style={{ fontWeight: 600 }}>{r.role}</span> — <span style={{ color: C.muted }}>{r.responsibility}</span></div>))}</div>)}
          {plan.governance && <div><Sub>Governance</Sub><p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: C.muted }}>{plan.governance}</p></div>}
        </Block>
      )}

      {/* Cultural considerations */}
      {genCultural && plan.culturalConsiderations && (
        <Block num={10} icon={Globe} accent={C.accent2} title="Cultural considerations">
          {plan.culturalConsiderations.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.culturalConsiderations.overview}</p>}
          {plan.culturalConsiderations.factors && (
            <div style={{ marginBottom: 14 }}>
              <Sub>Key factors</Sub>
              {plan.culturalConsiderations.factors.map((f, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < plan.culturalConsiderations.factors.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{f.area}</span>
                  {f.insight && <span style={{ color: C.muted }}> — {f.insight}</span>}
                </div>
              ))}
            </div>
          )}
          {plan.culturalConsiderations.implications && (
            <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent2}`, borderRadius: 4 }}>
              <strong>Strategic implication:</strong> {plan.culturalConsiderations.implications}
            </div>
          )}
        </Block>
      )}

      {/* Compliance requirements */}
      {genCompliance.length > 0 && plan.complianceRequirements && (
        <Block num={genCultural ? 11 : 10} icon={Shield} accent={C.accent} title="Compliance requirements">
          <div style={{ fontSize: 12.5, color: "#9a3412", background: "#fdf5ec", border: "1px solid #f3d8b2", borderRadius: 7, padding: "8px 12px", marginBottom: 14 }}>
            This section provides general guidance only. Seek qualified legal and regulatory advice before acting on any compliance obligations.
          </div>
          {plan.complianceRequirements.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.complianceRequirements.overview}</p>}
          {plan.complianceRequirements.areas && plan.complianceRequirements.areas.map((area, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <Sub>{area.level}</Sub>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: C.muted }}>
                {(area.requirements || []).map((req, j) => <li key={j}>{req}</li>)}
              </ul>
            </div>
          ))}
        </Block>
      )}
    </>
  );
}

/* ---------- Business plan view ---------- */
function BusinessView({ plan, org, genCultural, genCompliance }) {
  return (
    <>
      <section style={{ background: C.ink, color: C.paper, borderRadius: 14, padding: "42px 26px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: C.accent, fontWeight: 600 }}>Business Plan</div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 40, fontWeight: 600, margin: "14px 0 6px", lineHeight: 1.05 }}>{org}</h1>
        {plan.tagline && <p style={{ fontSize: 16, fontStyle: "italic", color: "#d9d2c4", margin: "0 0 14px" }}>{plan.tagline}</p>}
        <div style={{ fontSize: 12.5, color: "#b8b2a6", letterSpacing: ".04em" }}>{plan.preparedFor ? plan.preparedFor + " · " : ""}{TODAY}</div>
      </section>

      <Block num={1} icon={Sparkles} accent={C.accent} title="Executive summary"><p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6 }}>{plan.executiveSummary}</p></Block>

      {plan.businessOverview && (
        <Block num={2} icon={Building2} accent={C.accent2} title="Business overview">
          {plan.businessOverview.description && <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.55 }}>{plan.businessOverview.description}</p>}
          {plan.businessOverview.mission && <Line label="Mission" text={plan.businessOverview.mission} />}
          {plan.businessOverview.legalStructure && <Line label="Legal structure" text={plan.businessOverview.legalStructure} />}
          {plan.businessOverview.stage && <Line label="Stage" text={plan.businessOverview.stage} />}
          {plan.businessOverview.location && <Line label="Location" text={plan.businessOverview.location} />}
        </Block>
      )}

      {plan.marketAnalysis && (
        <Block num={3} icon={TrendingUp} accent={C.accent} title="Market analysis">
          {plan.marketAnalysis.industryOverview && <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.55 }}>{plan.marketAnalysis.industryOverview}</p>}
          {plan.marketAnalysis.targetSegments && (<div style={{ marginBottom: 12 }}><Sub>Target segments</Sub>{plan.marketAnalysis.targetSegments.map((s, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{s.segment}</span>{s.need ? <span style={{ color: C.muted }}> — {s.need}</span> : null}</div>))}</div>)}
          {plan.marketAnalysis.marketSize && <Line label="Market size" text={plan.marketAnalysis.marketSize} />}
          {plan.marketAnalysis.trends && (<div style={{ margin: "12px 0" }}><Sub>Trends</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.marketAnalysis.trends.map((t, i) => <li key={i}>{t}</li>)}</ul></div>)}
          {plan.marketAnalysis.competitors && (<div style={{ marginBottom: 12 }}><Sub>Competitors</Sub>{plan.marketAnalysis.competitors.map((c, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{c.name}</span>{c.note ? <span style={{ color: C.muted }}> — {c.note}</span> : null}</div>))}</div>)}
          {plan.marketAnalysis.positioning && <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent}`, borderRadius: 4 }}><strong>Positioning:</strong> {plan.marketAnalysis.positioning}</div>}
        </Block>
      )}

      {plan.productsServices && (
        <Block num={4} icon={Package} accent={C.accent2} title="Products & services">
          {plan.productsServices.map((p, i) => (<div key={i} style={{ paddingTop: i ? 13 : 0, marginTop: i ? 13 : 0, borderTop: i ? `1px solid ${C.line}` : "none" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><span style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</span>{p.pricing && <Tag accent>{p.pricing}</Tag>}</div>{p.description && <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>{p.description}</div>}{p.usp && <div style={{ fontSize: 13, color: C.accent2, marginTop: 4 }}><strong>Edge:</strong> {p.usp}</div>}</div>))}
        </Block>
      )}

      {plan.marketingSales && (
        <Block num={5} icon={Megaphone} accent={C.accent} title="Marketing & sales">
          {plan.marketingSales.positioning && <Line label="Positioning" text={plan.marketingSales.positioning} />}
          {plan.marketingSales.channels && (<div style={{ margin: "10px 0" }}><Sub>Channels</Sub><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{plan.marketingSales.channels.map((c, i) => <Tag key={i}>{c}</Tag>)}</div></div>)}
          {plan.marketingSales.acquisition && <Line label="Customer acquisition" text={plan.marketingSales.acquisition} />}
          {plan.marketingSales.salesProcess && <Line label="Sales process" text={plan.marketingSales.salesProcess} />}
          {plan.marketingSales.pricingStrategy && <Line label="Pricing strategy" text={plan.marketingSales.pricingStrategy} />}
        </Block>
      )}

      {plan.operations && (
        <Block num={6} icon={Settings} accent={C.accent2} title="Operations">
          {plan.operations.model && <Line label="Operating model" text={plan.operations.model} />}
          {plan.operations.keyProcesses && (<div style={{ margin: "10px 0" }}><Sub>Key processes</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.operations.keyProcesses.map((p, i) => <li key={i}>{p}</li>)}</ul></div>)}
          {plan.operations.resources && (<div style={{ margin: "10px 0" }}><Sub>Key resources & suppliers</Sub><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{plan.operations.resources.map((r, i) => <Tag key={i}>{r}</Tag>)}</div></div>)}
          {plan.operations.technology && <Line label="Technology" text={plan.operations.technology} />}
          {plan.operations.facilities && <Line label="Facilities / location" text={plan.operations.facilities} />}
        </Block>
      )}

      {plan.management && (
        <Block num={7} icon={Users} accent={C.accent} title="Management & staffing">
          {plan.management.structure && <Line label="Structure" text={plan.management.structure} />}
          {plan.management.team && (<div style={{ margin: "10px 0" }}><Sub>Team</Sub>{plan.management.team.map((t, i) => (<div key={i} style={{ fontSize: 14, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{t.role}</span>{t.responsibility ? <span style={{ color: C.muted }}> — {t.responsibility}</span> : null}</div>))}</div>)}
          {plan.management.hiringPlan && (<div style={{ margin: "10px 0" }}><Sub>Hiring plan</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.management.hiringPlan.map((h, i) => <li key={i}>{h}</li>)}</ul></div>)}
          {plan.management.advisors && <Line label="Advisors / board" text={plan.management.advisors} />}
        </Block>
      )}

      {plan.financialPlan && (
        <Block num={8} icon={DollarSign} accent={C.accent2} title="Financial plan">
          {plan.financialPlan.revenueModel && <Line label="Revenue model" text={plan.financialPlan.revenueModel} />}
          {plan.financialPlan.projections && (
            <div style={{ margin: "12px 0" }}>
              <Sub>Projections (illustrative)</Sub>
              <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", background: C.paper, fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.muted }}>
                  <span style={{ padding: "8px 10px" }}>Period</span><span style={{ padding: "8px 10px" }}>Revenue</span><span style={{ padding: "8px 10px" }}>Costs</span><span style={{ padding: "8px 10px" }}>Profit</span>
                </div>
                {plan.financialPlan.projections.map((r, i) => (<div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", fontSize: 13.5, borderTop: `1px solid ${C.line}` }}><span style={{ padding: "8px 10px", fontWeight: 600 }}>{r.period}</span><span style={{ padding: "8px 10px" }}>{r.revenue}</span><span style={{ padding: "8px 10px" }}>{r.costs}</span><span style={{ padding: "8px 10px", color: C.accent2, fontWeight: 600 }}>{r.profit}</span></div>))}
              </div>
            </div>
          )}
          {plan.financialPlan.assumptions && (<div style={{ margin: "10px 0" }}><Sub>Key assumptions</Sub><ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.5, color: C.muted }}>{plan.financialPlan.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul></div>)}
          {plan.financialPlan.fundingRequirement && <Line label="Funding requirement" text={plan.financialPlan.fundingRequirement} />}
          {plan.financialPlan.breakEven && <Line label="Break-even" text={plan.financialPlan.breakEven} />}
          <div style={{ fontSize: 12, color: C.muted, marginTop: 12, fontStyle: "italic" }}>Figures are illustrative estimates based on the stated assumptions — validate with real data and a qualified advisor before use.</div>
        </Block>
      )}

      {plan.appendices && (
        <Block num={9} icon={Paperclip} accent={C.accent} title="Appendices">
          <p style={{ color: C.muted, fontSize: 13.5, marginTop: 0 }}>Suggested supporting documents to attach:</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{plan.appendices.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </Block>
      )}

      {/* Cultural considerations */}
      {genCultural && plan.culturalConsiderations && (
        <Block num={10} icon={Globe} accent={C.accent2} title="Cultural considerations">
          {plan.culturalConsiderations.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.culturalConsiderations.overview}</p>}
          {plan.culturalConsiderations.factors && (
            <div style={{ marginBottom: 14 }}>
              <Sub>Key factors</Sub>
              {plan.culturalConsiderations.factors.map((f, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < plan.culturalConsiderations.factors.length - 1 ? `1px solid ${C.line}` : "none", fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{f.area}</span>
                  {f.insight && <span style={{ color: C.muted }}> — {f.insight}</span>}
                </div>
              ))}
            </div>
          )}
          {plan.culturalConsiderations.implications && (
            <div style={{ fontSize: 13.5, padding: "10px 12px", background: C.paper, borderLeft: `3px solid ${C.accent2}`, borderRadius: 4 }}>
              <strong>Strategic implication:</strong> {plan.culturalConsiderations.implications}
            </div>
          )}
        </Block>
      )}

      {/* Compliance requirements */}
      {genCompliance.length > 0 && plan.complianceRequirements && (
        <Block num={genCultural ? 11 : 10} icon={Shield} accent={C.accent} title="Compliance requirements">
          <div style={{ fontSize: 12.5, color: "#9a3412", background: "#fdf5ec", border: "1px solid #f3d8b2", borderRadius: 7, padding: "8px 12px", marginBottom: 14 }}>
            This section provides general guidance only. Seek qualified legal and regulatory advice before acting on any compliance obligations.
          </div>
          {plan.complianceRequirements.overview && <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55 }}>{plan.complianceRequirements.overview}</p>}
          {plan.complianceRequirements.areas && plan.complianceRequirements.areas.map((area, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <Sub>{area.level}</Sub>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: C.muted }}>
                {(area.requirements || []).map((req, j) => <li key={j}>{req}</li>)}
              </ul>
            </div>
          ))}
        </Block>
      )}
    </>
  );
}

/* ---------- shared bits ---------- */
function Block({ icon: Icon, accent, title, num, children }) {
  return (
    <section style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, padding: 22, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        {num != null && <span style={{ fontSize: 12, fontWeight: 700, color: C.paper, background: C.ink, width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</span>}
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
