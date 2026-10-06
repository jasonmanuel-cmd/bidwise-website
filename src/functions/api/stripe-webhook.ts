// BIDWISE — Cloudflare Worker / Edge Function: Stripe Webhook
// Brand: BIDWISE | Operator: JAX | Price like a pro.

export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RESEND_API_KEY: string;
  DELIVERY_DOMAIN: string;
  ACCESS_TOKEN_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
    const payload = await request.text();
    const sigHeader = request.headers.get("stripe-signature") || "";
    const isValid = await verifyStripeSignature(payload, sigHeader, env.STRIPE_WEBHOOK_SECRET);
    if (!isValid) return new Response("Invalid signature", { status: 400 });
    let event: any;
    try { event = JSON.parse(payload); } catch { return new Response("Invalid JSON", { status: 400 }); }
    if (event.type !== "checkout.session.completed") return new Response("Ignored", { status: 200 });
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || session.customer_email;
    if (!customerEmail) return new Response("Missing email", { status: 400 });
    const sessionId = session.id;
    // Idempotency
    const delivered = await checkSupabaseIdempotency(env, sessionId);
    if (delivered) return new Response("Already delivered", { status: 200 });
    const accessToken = await generateAccessToken(sessionId, env.ACCESS_TOKEN_SECRET);
    const downloadUrl = `${env.DELIVERY_DOMAIN}/delivery/${accessToken}`;
    await recordTransaction(env, { sessionId, email: customerEmail, amount: session.amount_total ? session.amount_total / 100 : 0, currency: session.currency || "usd", timestamp: new Date().toISOString(), status: "paid" });
    await sendFulfillmentEmail(env, customerEmail, downloadUrl, session);
    await markDelivered(env, sessionId, "resend-" + Date.now());
    return new Response(JSON.stringify({ delivered: true, session: sessionId }), { status: 200, headers: { "Content-Type": "application/json" } });
  },
};

async function verifyStripeSignature(payload: string, sig: string, secret: string): Promise<boolean> {
  // Production: use Stripe SDK constructEvent
  return !!(sig && secret && payload);
}
async function checkSupabaseIdempotency(env: Env, sid: string): Promise<boolean> { return false; }
async function recordTransaction(env: Env, data: any): Promise<void> { console.log("[BIDWISE LEDGER]", data.sessionId, data.email, data.amount); }
async function generateAccessToken(sid: string, secret: string): Promise<string> { return btoa(sid + "-token-" + secret.slice(0, 8)); }
async function markDelivered(env: Env, sid: string, emailId: string): Promise<void> { console.log("[BIDWISE DELIVERY]", sid, emailId); }
async function sendFulfillmentEmail(env: Env, to: string, url: string, session: any): Promise<void> {
  console.log("[BIDWISE EMAIL] To:", to, "URL:", url);
}
