// API route: /api/chat-messages
import { db } from "@/lib/db";
import { messages as messagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge"; // make this run faster

type paramsType = {
  chatId: number;
};

export async function GET(req: Request, { params }: { params: paramsType }) {
  const chatId = params.chatId;
  const _messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));
  return Response.json(_messages);
}
