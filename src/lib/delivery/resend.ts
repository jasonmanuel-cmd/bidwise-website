// BIDWISE Fulfillment — Resend API Delivery
// Brand: BIDWISE | Price like a pro.

export interface Env { RESEND_API_KEY: string; FROM_EMAIL: string; PRODUCT_PAGE_URL: string; SUPPORT_EMAIL: string; }
export interface Payload { customerEmail: string; sessionId: string; productKey: string; customerName?: string; }

export async function sendFulfillmentEmail(env: Env, p: Payload): Promise<{ id: string }> {
  const downloadLink = `https://bidwise.co/delivery/${p.sessionId}`;
  const driveLink = `https://drive.google.com/uc?export=download&id=BIDWISE_WORKBOOK_FILE_ID`;
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;color:#18181B;line-height:1.5"><h2 style="color:#FBBF24">Your BIDWISE Workbook is ready.</h2><p>Thanks for your purchase, ${p.customerName || "Contractor"}.</p><h3>Inside your package:</h3><ul><li><strong>Bidwise_Quote_Profit_Workbook.xlsx</strong> — Macro-free, Sheets-compatible</li><li><strong>Quick Start PDF</strong> — 5-step setup, color key, margin vs markup</li><li><strong>Example Quote PDF</strong> — Fictional example clearly labeled</li><li><strong>License + Disclaimer + Changelog + README</strong></li></ul><h3>Download:</h3><p><a href="${downloadLink}" style="background:#FBBF24;color:#0B1117;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:700">Download ZIP Package</a></p><p><a href="${driveLink}" style="color:#FBBF24">Google Sheets copy link</a></p><hr/><p style="font-size:13px;color:#777">Need help? Reply or contact <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>.</p></body></html>`;
  const text = `Your BIDWISE Workbook is ready.\nDownload ZIP: ${downloadLink}\nGoogle Sheets copy: ${driveLink}\nSupport: ${env.SUPPORT_EMAIL}`;
  // Production: fetch("https://api.resend.com/emails", {method:"POST", headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json"}, body: JSON.stringify({from:env.FROM_EMAIL,to:p.customerEmail,subject:"Your BIDWISE Workbook — download inside",html,text})})
  console.log("[BIDWISE FULFILLMENT] Email to", p.customerEmail, "session:", p.sessionId);
  return { id: "resend-" + Date.now() };
}
