import DodoPayments from "dodopayments";

export type DodoPaymentsEnvironment = "live_mode" | "test_mode";

let client: DodoPayments | null = null;

export function getDodoClient() {
  if (!process.env.DODO_PAYMENTS_API_KEY) {
    throw new Error("Dodo Payments is not configured");
  }

  if (!client) {
    client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment:
        (process.env
          .DODO_PAYMENTS_ENVIRONMENT as DodoPaymentsEnvironment | undefined) ??
        "test_mode",
    });
  }

  return client;
}
