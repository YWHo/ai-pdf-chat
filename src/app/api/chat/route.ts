// API route: /api/chat
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { Message } from "ai/react";
import { getPdfContext } from "@/lib/pdfContext";
import { db } from "@/lib/db";
import { chats, messages as messagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

export async function POST(req: Request, res: Response) {
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);
    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length === 0) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getPdfContext(lastMessage.content, fileKey);

    // reference: https://vercel.com/templates/next.js/pinecone-vercel-ai
    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    const messagesWithPrompt = [
      prompt,
      ...messages.filter((message: Message) => message.role == "user"),
    ];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messagesWithPrompt,
      stream: true,
    });

    const stream = OpenAIStream(response, {
      onStart: async () => {
        // save user message into db
        await db.insert(messagesTable).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });
      },
      // Saving system messages
      onCompletion: async (completion) => {
        // save AI response message into db
        await db.insert(messagesTable).values({
          chatId,
          content: completion,
          role: "system",
        });
      },
    });
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("\n/api/chat err:\n", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
