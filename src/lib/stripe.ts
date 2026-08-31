import Stripe from "stripe";

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

// No apiVersion pinned on purpose: docs.stripe.com is unreachable from this
// sandbox, so rather than hardcode a version string we can't verify, we let
// the SDK use its own bundled default. If you pin one later, match it to
// what's shown in your Stripe Dashboard's API version setting.
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurada");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}
