// Three-statement financial model (Stage 1: AI-supplied assumptions → computed statements).
// The AI returns a structured `assumptions` object; we compute the P&L, cash flow, and
// balance sheet from it in JS. Stage 2 will let users edit the assumptions and recompute
// live — the compute engine below is already the single source of truth for that.

export const FINANCIAL_YEARS = 3;

// Prompt that asks Claude for numeric assumptions only (not the statements themselves).
export function financialAssumptionsPrompt(ctx) {
  return `Estimate a realistic set of financial assumptions for the organisation below, to drive a 3-year financial model (profit & loss, cash flow, balance sheet).

${ctx}

Return ONLY JSON with NUMERIC values (plain numbers, no currency symbols or text inside the numbers):
{
  "currency": "e.g. AUD",
  "basis": "1-2 sentences stating that these are illustrative estimates and what they assume",
  "startingAnnualRevenue": 0,
  "revenueGrowthPct": [0, 0],
  "cogsPctOfRevenue": 0,
  "year1OperatingExpenses": 0,
  "opexGrowthPct": 0,
  "taxRatePct": 0,
  "startingCash": 0,
  "equityInjection": 0,
  "loanAmount": 0,
  "loanInterestPct": 0,
  "annualCapex": 0,
  "depreciationPct": 0
}

Guidance: revenueGrowthPct is [Year 2 growth %, Year 3 growth %] over the prior year. cogsPctOfRevenue and depreciationPct are percentages (e.g. 40 means 40%). year1OperatingExpenses is annual fixed operating cost excluding COGS, depreciation and interest. equityInjection and loanAmount are one-off Year 1 funding inflows. Base every figure on realistic industry benchmarks for a ${""} business of this stage and the user-provided context. Do not present estimates as fact.`;
}

const num = (v, d = 0) => {
  const n = typeof v === "string" ? parseFloat(v.replace(/[^0-9.-]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : d;
};

// Compute the three statements from an assumptions object. Always balances by construction.
export function computeStatements(a) {
  const currency = a.currency || "AUD";
  const growth = Array.isArray(a.revenueGrowthPct) ? a.revenueGrowthPct : [num(a.revenueGrowthPct), num(a.revenueGrowthPct)];
  const cogsPct = num(a.cogsPctOfRevenue) / 100;
  const opexGrowth = num(a.opexGrowthPct) / 100;
  const taxRate = num(a.taxRatePct) / 100;
  const depPct = num(a.depreciationPct) / 100;
  const loanRate = num(a.loanInterestPct) / 100;
  const loan = num(a.loanAmount);
  const capex = num(a.annualCapex);

  const years = [];
  let revenue = num(a.startingAnnualRevenue);
  let opex = num(a.year1OperatingExpenses);
  let cash = num(a.startingCash);
  let cumulativeCapex = 0;
  let accumulatedDep = 0;
  let retainedEarnings = 0;
  const paidInCapital = num(a.equityInjection);
  const openingEquity = num(a.startingCash); // starting cash is owner's opening equity brought forward

  for (let y = 0; y < FINANCIAL_YEARS; y++) {
    if (y > 0) {
      revenue = revenue * (1 + num(growth[y - 1]) / 100);
      opex = opex * (1 + opexGrowth);
    }
    // Fixed assets & depreciation (straight-line-ish on cumulative capex, capped at book value)
    cumulativeCapex += capex;
    let depreciation = depPct * cumulativeCapex;
    const bookBefore = cumulativeCapex - accumulatedDep;
    if (depreciation > bookBefore) depreciation = Math.max(0, bookBefore);
    accumulatedDep += depreciation;
    const netFixedAssets = cumulativeCapex - accumulatedDep;

    // P&L
    const cogs = revenue * cogsPct;
    const grossProfit = revenue - cogs;
    const ebitda = grossProfit - opex;
    const ebit = ebitda - depreciation;
    const interest = loan * loanRate; // interest-only, drawn Year 1, principal held
    const profitBeforeTax = ebit - interest;
    const tax = profitBeforeTax > 0 ? profitBeforeTax * taxRate : 0;
    const netProfit = profitBeforeTax - tax;

    // Cash flow (indirect; simplified — no working-capital timing)
    const operatingCF = netProfit + depreciation;
    const investingCF = -capex;
    const financingCF = (y === 0 ? paidInCapital + loan : 0);
    const netCF = operatingCF + investingCF + financingCF;
    const openingCash = cash;
    cash = openingCash + netCF;

    // Balance sheet
    retainedEarnings += netProfit;
    const totalAssets = cash + netFixedAssets;
    const totalLiabilities = loan;
    const totalEquity = openingEquity + paidInCapital + retainedEarnings;

    years.push({
      label: `Year ${y + 1}`,
      pl: { revenue, cogs, grossProfit, opex, ebitda, depreciation, ebit, interest, profitBeforeTax, tax, netProfit,
        grossMarginPct: revenue ? (grossProfit / revenue) * 100 : 0,
        netMarginPct: revenue ? (netProfit / revenue) * 100 : 0 },
      cashFlow: { openingCash, operatingCF, investingCF, financingCF, netCF, closingCash: cash },
      balance: { cash, netFixedAssets, totalAssets, loan: totalLiabilities, openingEquity, paidInCapital, retainedEarnings, totalEquity,
        balances: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1 },
    });
  }

  return { currency, basis: a.basis || "", assumptions: a, years };
}

export function formatMoney(n, currency = "AUD") {
  const v = Math.round(num(n));
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v).toLocaleString("en-AU");
  return `${sign}${currency === "AUD" || currency === "NZD" || currency === "USD" ? "$" : currency + " "}${abs}`;
}
