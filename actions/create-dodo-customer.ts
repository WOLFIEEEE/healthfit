"use server";

import { getDodoClient } from "@/lib/dodo-payments/client";
import { ServerActionRes } from "@/types/server-action";
import { Customer } from "dodopayments/resources/index.mjs";

export async function createDodoCustomer(props: {
  email: string;
  name?: string;
}): ServerActionRes<Customer> {
  try {
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      return { success: false, error: "Dodo Payments is not configured" };
    }

    const customer = await getDodoClient().customers.create({
      email: props.email,
      name: props.name ? props.name : props.email.split("@")[0],
    });

    return { success: true, data: customer };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}
