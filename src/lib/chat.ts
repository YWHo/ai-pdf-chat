import { eq } from "drizzle-orm";
import { db } from "./db";
import { chats as chatsTable } from "./db/schema";

export async function getFirstChat(userId: string | null) {
  if (!userId) return null;
  const allChats = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, userId));
  if (allChats) {
    return allChats[0];
  }
  return null;
}
