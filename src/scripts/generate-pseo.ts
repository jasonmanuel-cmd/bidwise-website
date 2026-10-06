// BIDWISE Programmatic SEO Generator
// Brand: BIDWISE — Price like a pro.

export interface PageData {
  slug: string;
  trade: string;
  metro: string;
  title: string;
  meta: string;
  h1: string;
  defaults: { laborHours: number; laborRate: number; materialsCost: number; targetMargin: number };
  structuredData: object;
}

const TRADES = ["handyman","electrician","plumber","hvac","painter","roofer","drywall","carpenter","concrete","landscaper"];
const METROS = ["bakersfield-ca","austin-tx","phoenix-az","dallas-tx","tampa-fl","denver-co","charlotte-nc","portland-or","sacramento-ca"];

export function generatePages(trades = TRADES.slice(0,5), metros = METROS.slice(0,10)): PageData[] {
  const pages: PageData[] = [];
  for (const trade of trades) {
    for (const metro of metros) {
      const slug = `/tools/quote-calculator/${trade}-${metro}`;
      pages.push({
        slug,
        trade,
        metro,
        title: `BIDWISE Calculator — ${trade} Pricing ${metro}`,
        meta: `Free ${trade} quote calculator for ${metro}. Calculate cost, margin, and required price instantly.`,
        h1: `${trade} Quote Calculator — ${metro}`,
        defaults: { laborHours: 10, laborRate: 65, materialsCost: 450, targetMargin: 0.3 },
        structuredData: { "@context":"https://schema.org","@type":"SoftwareApplication","name":"BIDWISE Calculator","applicationCategory":"BusinessApplication","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","url":"https://bidwise.co" + slug}},
      });
    }
  }
  return pages;
}
