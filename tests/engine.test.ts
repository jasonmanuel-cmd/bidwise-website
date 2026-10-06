import { describe, test, expect } from 'vitest';
import { priceAtMargin, markupFromMargin, safeCalculate, calculateCostDetail, calculateProfitCheck, buildCustomerQuote } from '../lib/engine/calculator';

describe("BIDWISE Engine", () => {
  test("Price at 30% margin on $400 = $571.43", () => expect(priceAtMargin(400,0.3)).toBeCloseTo(571.43,2));
  test("Markup from 30% = ~42.86%", () => expect(markupFromMargin(0.3)).toBeCloseTo(0.4286,4));
  test("Zero cost safe", () => expect(priceAtMargin(0,0.3)).toBe(0));
  test("100% margin rejected", () => expect(() => priceAtMargin(400,1)).toThrow());
  test("Negative cost rejected", () => expect(() => priceAtMargin(-100,0.3)).toThrow());
  test("Safe calculate handles NaN/blanks", () => expect(safeCalculate(NaN,0.3)).toEqual({error:"Invalid cost input"}));
  test("Customer quote hides internal costs", () => {
    const quote = buildCustomerQuote({customer:"C",projectName:"P",quoteNumber:"Q",description:"D",laborHours:2,laborRateHourly:60,laborBurdenPct:0,materialsCost:100,materialsContingency:0,equipmentCost:0,subcontractorCost:0,travelDisposalFlat:0,fixedOverheadHourly:0,overheadAllocationHours:0}, calculateCostDetail({customer:"C",projectName:"P",quoteNumber:"Q",description:"D",laborHours:2,laborRateHourly:60,laborBurdenPct:0,materialsCost:100,materialsContingency:0,equipmentCost:0,subcontractorCost:0,travelDisposalFlat:0,fixedOverheadHourly:0,overheadAllocationHours:0}), {currency:"USD",targetMargin:0.3,taxRate:0.0825,taxEnabled:true,discountPct:0,quoteExpirationDays:30});
    const s = JSON.stringify(quote);
    expect(s).not.toContain("laborCost");
    expect(s).not.toContain("grossProfit");
    expect(s).not.toContain("markup");
  });
});
