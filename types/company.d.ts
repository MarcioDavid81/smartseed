import { Plan, SubscriptionStatus } from "@prisma/client";

export interface Company {
  id: string;
  name: string;
  plan?: Plan | null;
  planStartedAt?: Date | null;
  planExpiresAt?: Date | null;
  subscriptionStatus?: SubscriptionStatus | null;
}
