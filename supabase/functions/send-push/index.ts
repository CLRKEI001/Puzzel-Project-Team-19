/*// supabase/functions/send-push/index.ts
//
// Sends a real Web Push notification (VAPID-signed, per RFC 8291/8292) to
// every subscription a user has saved in push_subscriptions. Called by the
// client — e.g. AdminHome.js after approving someone — as:
//
//   supabase.functions.invoke("send-push", {
//     body: { userId, title, body, url },
//   });
//
// Deploy: supabase functions deploy send-push
// Secrets (set once, never shipped to the browser):
//   supabase secrets set VAPID_PUBLIC_KEY=...  VAPID_PRIVATE_KEY=...  VAPID_SUBJECT=mailto:you@example.org
// Generate a key pair with: npx web-push generate-vapid-keys
//
// Uses the `web-push` npm package via Deno's npm: specifier so the VAPID
// JWT signing and aes128gcm payload encryption follow the standard,
// well-tested implementation rather than hand-rolled crypto.

// @ts-ignore -- Deno remote/npm imports aren't resolved by a local TS toolchain
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
// @ts-ignore
import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.org";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(JSON.stringify({ error: "VAPID keys not configured" }), { status: 500 });
  }

  const { userId, title, body, url } = await req.json();
  if (!userId || !title) {
    return new Response(JSON.stringify({ error: "userId and title are required" }), { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!subs || subs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no-subscriptions" }), { status: 200 });
  }

  const payload = JSON.stringify({ title, body: body ?? "", url: url ?? "/" });
  let sent = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err) {
        // 404/410 means the browser unsubscribed or the subscription expired
        // — safe to drop it so the next attempt doesn't keep retrying it.
        const status = err?.statusCode;
        if (status === 404 || status === 410) staleEndpoints.push(sub.endpoint);
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await supabase.from("push_subscriptions").delete().in("endpoint", staleEndpoints);
  }

  return new Response(JSON.stringify({ sent, removed: staleEndpoints.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});*/