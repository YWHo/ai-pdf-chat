// API route: /api/chat-messages
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge"; // make this run faster

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paramId = searchParams.get("id");
  const chatId: number = paramId ? parseInt(paramId) : -1;
  const _messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));
  return Response.json(_messages);
}
