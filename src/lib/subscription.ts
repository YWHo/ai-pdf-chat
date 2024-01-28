import { auth } from "@clerk/nextjs";
import { db } from "./db";
import { userSubscriptions as userSubscriptionsTable } from "./db/schema";
import { eq } from "drizzle-orm";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export async function getSubscriptionStatus(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptionsTable)
    .where(eq(userSubscriptionsTable.userId, userId));

  if (!_userSubscriptions[0]) {
    return false;
  }

  const userSubscription = _userSubscriptions[0];
  const currentPeriodEnd =
    userSubscription.stripeCurrentPeriodEnd?.getTime() ?? 0;
  const isValid =
    userSubscription.stripePriceId && currentPeriodEnd + DAY_IN_MS > Date.now();

  return !!isValid;
}
