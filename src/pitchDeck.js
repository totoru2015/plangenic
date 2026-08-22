// Pitch deck export — turns a finished plan into branded PowerPoint slides.
// Uses pptxgenjs (lazy-loaded so it doesn't bloat the main bundle).

const INK = "0B1220";
const NAVY = "081735";
const BLUE = "2563EB";
const SKY = "7DD3FC";
const WHITE = "FFFFFF";
const MUTED = "9FB0D0";

const trim = (s, n) => {
  if (!s) return "";
  const t = String(s).trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
};

function addTitleSlide(pptx, org, subtitle, tagline) {
  const s = pptx.addSlide();
  s.background = { color: NAVY };
  // Accent bar
  s.addShape("rect", { x: 0, y: 0, w: 0.18, h: 5.63, fill: { color: BLUE } });
  s.addText(subtitle.toUpperCase(), { x: 0.7, y: 1.5, w: 8.5, h: 0.4, fontSize: 13, color: SKY, charSpacing: 4, bold: true });
  s.addText(org || "Untitled", { x: 0.65, y: 1.9, w: 8.6, h: 1.2, fontSize: 44, color: WHITE, bold: true });
  if (tagline) s.addText(tagline, { x: 0.7, y: 3.1, w: 8.5, h: 0.6, fontSize: 18, color: MUTED, italic: true });
  const today = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });
  s.addText(`${today}  ·  Prepared with Strataplan`, { x: 0.7, y: 4.9, w: 8.5, h: 0.4, fontSize: 12, color: MUTED });
}

function addContentSlide(pptx, title, bullets, opts = {}) {
  const items = (bullets || []).filter(Boolean).slice(0, opts.max || 7);
  if (!items.length) return;
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.9, fill: { color: NAVY } });
  s.addShape("rect", { x: 0, y: 0.9, w: 10, h: 0.045, fill: { color: BLUE } });
  s.addText(title, { x: 0.55, y: 0.14, w: 9, h: 0.62, fontSize: 22, color: WHITE, bold: true });
  s.addText(
    items.map((b) => ({ text: trim(b, 220), options: { bullet: { code: "2022", indent: 12 }, color: INK, fontSize: 14, paraSpaceAfter: 10 } })),
    { x: 0.65, y: 1.25, w: 8.8, h: 3.9, valign: "top" }
  );
}

function addTableSlide(pptx, title, headers, rows) {
  if (!rows || !rows.length) return;
  const s = pptx.addSlide();
  s.background = { color: WHITE };
  s.addShape("rect", { x: 0, y: 0, w: 10, h: 0.9, fill: { color: NAVY } });
  s.addShape("rect", { x: 0, y: 0.9, w: 10, h: 0.045, fill: { color: BLUE } });
  s.addText(title, { x: 0.55, y: 0.14, w: 9, h: 0.62, fontSize: 22, color: WHITE, bold: true });
  const tableRows = [
    headers.map((h) => ({ text: h, options: { bold: true, color: WHITE, fill: { color: BLUE }, fontSize: 12 } })),
    ...rows.slice(0, 8).map((r) => r.map((c) => ({ text: trim(c, 90), options: { color: INK, fontSize: 12 } }))),
  ];
  s.addTable(tableRows, { x: 0.65, y: 1.3, w: 8.8, border: { pt: 0.5, color: "DDE3EE" }, autoPage: false, rowH: 0.38 });
}

export async function exportPitchDeck(plan, planType, org) {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 10, height: 5.63 });
  pptx.layout = "WIDE";

  if (planType === "strategic") {
    addTitleSlide(pptx, org, "Strategic Plan", plan.vision);
    addContentSlide(pptx, "Executive Summary", [plan.executiveSummary], { max: 1 });
    addContentSlide(pptx, "Mission, Vision & Values", [
      plan.mission && `Mission — ${plan.mission}`,
      plan.vision && `Vision — ${plan.vision}`,
      plan.values && plan.values.length && `Values — ${plan.values.join(" · ")}`,
    ]);
    addContentSlide(pptx, "Strategic Priorities", (plan.strategicPriorities || []).map((p) => `${p.title}${p.rationale ? ` — ${p.rationale}` : ""}`));
    addContentSlide(pptx, "Goals", (plan.goals || []).map((g) => g.goal));
    addContentSlide(pptx, "Key Initiatives", (plan.initiatives || []).map((it) => `${it.initiative}${it.timeframe ? ` (${it.timeframe})` : ""}`));
    if (plan.roadmap && plan.roadmap.length) {
      addTableSlide(pptx, "Roadmap", ["Phase", "Timeframe", "Focus"], plan.roadmap.map((r) => [r.phase || "", r.timeframe || "", r.focus || ""]));
    }
    if (plan.financialGoals) {
      const fg = plan.financialGoals;
      if (fg.targets && fg.targets.length) {
        addTableSlide(pptx, "Financial Goals", ["Goal", "Target", "By when"], fg.targets.map((t) => [t.goal || "", t.target || "", t.timeframe || ""]));
      } else {
        addContentSlide(pptx, "Financial Goals", [fg.overview, fg.profitabilityGoal && `Profitability — ${fg.profitabilityGoal}`, fg.fundingNeeds && `Funding — ${fg.fundingNeeds}`]);
      }
    }
    if (plan.kpis && plan.kpis.length) {
      addTableSlide(pptx, "How We Measure Success", ["KPI", "Target", "Frequency"], plan.kpis.map((k) => [k.kpi || "", k.target || "", k.frequency || ""]));
    }
    addContentSlide(pptx, "In Plain Language", [plan.stakeholderSummary], { max: 1 });
  } else {
    addTitleSlide(pptx, org, "Business Plan", plan.tagline);
    addContentSlide(pptx, "Executive Summary", [plan.executiveSummary], { max: 1 });
    if (plan.businessOverview) {
      const b = plan.businessOverview;
      addContentSlide(pptx, "The Business", [b.description, b.mission && `Mission — ${b.mission}`, b.stage && `Stage — ${b.stage}`, b.location && `Location — ${b.location}`]);
    }
    if (plan.marketAnalysis) {
      const m = plan.marketAnalysis;
      addContentSlide(pptx, "Market Opportunity", [
        m.industryOverview,
        m.marketSize && `Market size — ${m.marketSize}`,
        m.positioning && `Positioning — ${m.positioning}`,
        ...(m.trends || []).slice(0, 3),
      ]);
      if (m.competitors && m.competitors.length) {
        addContentSlide(pptx, "Competitive Landscape", m.competitors.map((c) => `${c.name}${c.note ? ` — ${c.note}` : ""}`));
      }
    }
    addContentSlide(pptx, "Products & Services", (plan.productsServices || []).map((p) => `${p.name}${p.pricing ? ` (${p.pricing})` : ""}${p.usp ? ` — ${p.usp}` : ""}`));
    if (plan.marketingSales) {
      const m = plan.marketingSales;
      addContentSlide(pptx, "Go-to-Market", [
        m.positioning && `Positioning — ${m.positioning}`,
        m.channels && m.channels.length && `Channels — ${m.channels.join(", ")}`,
        m.acquisition && `Acquisition — ${m.acquisition}`,
        m.pricingStrategy && `Pricing — ${m.pricingStrategy}`,
      ]);
    }
    if (plan.management) {
      const mg = plan.management;
      addContentSlide(pptx, "Team", [mg.structure, ...(mg.team || []).map((t) => `${t.role} — ${t.responsibility}`)]);
    }
    if (plan.financialPlan) {
      const fp = plan.financialPlan;
      if (fp.projections && fp.projections.length) {
        addTableSlide(pptx, "Financial Projections (Illustrative)", ["Period", "Revenue", "Costs", "Profit"], fp.projections.map((r) => [r.period || "", r.revenue || "", r.costs || "", r.profit || ""]));
      }
      addContentSlide(pptx, "The Ask", [
        fp.fundingRequirement && `Funding — ${fp.fundingRequirement}`,
        fp.breakEven && `Break-even — ${fp.breakEven}`,
        fp.revenueModel && `Revenue model — ${fp.revenueModel}`,
      ]);
    }
  }

  const fileName = `${(org || "plan").replace(/[^a-z0-9]+/gi, "_")}_pitch_deck.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
