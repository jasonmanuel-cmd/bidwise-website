// BIDWISE — Stripe Webhook (Vercel / Astro API route)
// Brand: BIDWISE | Price like a pro.
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  const payload = await request.text();
  const sigHeader = request.headers.get('stripe-signature') || '';

  if (!secret) return new Response('Webhook secret not configured', { status: 500 });
  const isValid = await verifyStripeSignature(payload, sigHeader, secret);
  if (!isValid) return new Response('Invalid signature', { status: 400 });

  let event: any;
  try { event = JSON.parse(payload); } catch { return new Response('Invalid JSON', { status: 400 }); }
  if (event.type !== 'checkout.session.completed') return new Response('Ignored', { status: 200 });

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) return new Response('Missing email', { status: 400 });

  console.log('[BIDWISE] checkout.session.completed', session.id, customerEmail);
  // TODO: idempotency check (Supabase), record transaction, send fulfillment email via Resend
  return new Response(JSON.stringify({ received: true, session: session.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = Object.fromEntries(
      sigHeader.split(',').map((kv) => kv.split('=') as [string, string])
    );
    const timestamp = parts['t'];
    const signature = parts['v1'];
    if (!timestamp || !signature) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
    const expected = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return expected === signature;
  } catch {
    return false;
  }
}
