import Stripe from "https://esm.sh/stripe@14?target=deno";

export function createStripeClient(): Stripe {
  return new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export function getStripeWebhookSecret(): string {
  return Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
}
