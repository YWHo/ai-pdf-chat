// API route: /api/chat
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request, res: Response) {
  try {
    const { messages } = await req.json();
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (err) {
    console.error("\n/api/chat err:\n", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
