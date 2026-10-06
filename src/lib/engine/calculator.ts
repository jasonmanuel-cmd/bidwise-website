// BIDWISE CleanQuote OS — Core Calculation Engine
// Synthesis: File 2 (margin/math rules, test cases) + File 3 (TypeScript config / JSON schema)
// Brand: BIDWISE | Slogan: Price like a pro.

export interface JobInputs {
  customer: string;
  projectName: string;
  quoteNumber: string;
  description: string;
  laborHours: number;
  laborRateHourly: number;
  laborBurdenPct: number;
  materialsCost: number;
  materialsContingency: number;
  equipmentCost: number;
  subcontractorCost: number;
  travelDisposalFlat: number;
  fixedOverheadHourly: number;
  overheadAllocationHours: number;
}

export interface Settings {
  currency: string;
  targetMargin: number; // 0 <= M < 1.0
  taxRate: number;
  taxEnabled: boolean;
  discountPct: number;
  quoteExpirationDays: number;
}

export interface CostDetail {
  laborCost: number;
  materialsCost: number;
  equipmentCost: number;
  subcontractorCost: number;
  travelDisposal: number;
  fixedOverhead: number;
  percentageOverhead: number;
  totalModeledCost: number;
}

export interface ProfitCheck {
  totalModeledCost: number;
  proposedPrice: number;
  grossProfit: number;
  grossMargin: number;
  markup: number;
  targetMargin: number;
  priceAtTarget: number;
  discountEffectMargin: number;
  warning: string | null;
}

export interface QuoteOutput {
  contractorInfo: string;
  customerInfo: string;
  projectDescription: string;
  lineItems: Array<{ label: string; amount: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentTerms: string;
  acceptanceLine: string;
}

export function priceAtMargin(cost: number, margin: number): number {
  if (margin >= 1.0 || margin < 0) throw new Error("Invalid margin: must be 0 <= M < 1.0");
  if (cost < 0) throw new Error("Invalid cost: must be >= 0");
  if (cost === 0) return 0;
  return Math.round((cost / (1 - margin)) * 100) / 100;
}

export function markupFromMargin(margin: number): number {
  if (margin >= 1.0 || margin < 0) throw new Error("Invalid margin");
  if (margin === 0) return 0;
  return Math.round((margin / (1 - margin)) * 10000) / 10000;
}

export function calculateCostDetail(inputs: JobInputs): CostDetail {
  const laborCost = inputs.laborHours * inputs.laborRateHourly * (1 + inputs.laborBurdenPct);
  const materialsBase = inputs.materialsCost * (1 + inputs.materialsContingency);
  const equipmentCost = inputs.equipmentCost || 0;
  const subcontractorCost = inputs.subcontractorCost || 0;
  const travelDisposal = inputs.travelDisposalFlat || 0;
  const fixedOverhead = inputs.fixedOverheadHourly * inputs.overheadAllocationHours || 0;
  const percentageOverhead = (materialsBase + laborCost + equipmentCost + subcontractorCost + travelDisposal) * 0.05;
  const total = laborCost + materialsBase + equipmentCost + subcontractorCost + travelDisposal + fixedOverhead + percentageOverhead;
  return {
    laborCost: Math.round(laborCost * 100) / 100,
    materialsCost: Math.round(materialsBase * 100) / 100,
    equipmentCost,
    subcontractorCost,
    travelDisposal,
    fixedOverhead,
    percentageOverhead: Math.round(percentageOverhead * 100) / 100,
    totalModeledCost: Math.round(total * 100) / 100,
  };
}

export function calculateProfitCheck(cost: CostDetail, proposedPrice: number, settings: Settings): ProfitCheck {
  if (proposedPrice < 0) throw new Error("Price must be >= 0");
  if (settings.targetMargin < 0 || settings.targetMargin >= 1.0) throw new Error("Invalid target margin");
  const grossProfit = Math.round((proposedPrice - cost.totalModeledCost) * 100) / 100;
  const grossMargin = proposedPrice > 0 ? Math.round((grossProfit / proposedPrice) * 10000) / 10000 : 0;
  const markup = cost.totalModeledCost > 0 ? Math.round((grossProfit / cost.totalModeledCost) * 10000) / 10000 : 0;
  const priceAtTarget = priceAtMargin(cost.totalModeledCost, settings.targetMargin);
  const discountedPrice = proposedPrice * (1 - settings.discountPct);
  const discountedProfit = discountedPrice - cost.totalModeledCost;
  const discountEffectMargin = discountedPrice > 0 ? Math.round((discountedProfit / discountedPrice) * 10000) / 10000 : 0;
  let warning: string | null = null;
  if (grossMargin < settings.targetMargin - 0.01) {
    warning = `Margin below target (${(grossMargin * 100).toFixed(1)}% vs ${(settings.targetMargin * 100).toFixed(1)}%). Raise price or reduce cost.`;
  }
  if (settings.targetMargin === 0) warning = "Target margin is 0%. Price equals cost; no profit.";
  if (settings.targetMargin >= 1.0) warning = "Target margin >= 100% is invalid.";
  return {
    totalModeledCost: cost.totalModeledCost,
    proposedPrice,
    grossProfit,
    grossMargin,
    markup,
    targetMargin: settings.targetMargin,
    priceAtTarget,
    discountEffectMargin,
    warning,
  };
}

export function buildCustomerQuote(inputs: JobInputs, cost: CostDetail, settings: Settings): QuoteOutput {
  const lineItems = [
    { label: "Labor", amount: Math.round(cost.laborCost * 100) / 100 },
    { label: "Materials", amount: Math.round(cost.materialsCost * 100) / 100 },
    { label: "Equipment", amount: Math.round(cost.equipmentCost * 100) / 100 },
    { label: "Subcontractors", amount: Math.round(cost.subcontractorCost * 100) / 100 },
    { label: "Travel / Disposal", amount: Math.round(cost.travelDisposal * 100) / 100 },
  ];
  const subtotal = lineItems.reduce((s, it) => s + it.amount, 0);
  const discount = Math.round(subtotal * settings.discountPct * 100) / 100;
  const tax = settings.taxEnabled ? Math.round((subtotal - discount) * settings.taxRate * 100) / 100 : 0;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;
  return {
    contractorInfo: "BIDWISE Certified Contractor — License #00000",
    customerInfo: inputs.customer,
    projectDescription: inputs.description || inputs.projectName,
    lineItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount,
    tax,
    total,
    paymentTerms: "Net 15. 50% deposit due upon acceptance.",
    acceptanceLine: "By signing below, customer accepts scope, price, and terms.",
  };
}

export function safeCalculate(costInput: number, marginInput: number): number | { error: string } {
  try {
    if (typeof costInput !== "number" || isNaN(costInput)) return { error: "Invalid cost input" };
    if (typeof marginInput !== "number" || isNaN(marginInput)) return { error: "Invalid margin input" };
    if (costInput < 0) return { error: "Negative cost" };
    if (marginInput < 0) return { error: "Margin below 0" };
    if (marginInput >= 1.0) return { error: "Margin >= 1.0 invalid" };
    if (costInput === 0) return 0;
    return Math.round((costInput / (1 - marginInput)) * 100) / 100;
  } catch (e) { return { error: String(e) }; }
}
