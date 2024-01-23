import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAi = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  console.log("\n---\n getEmbeddings: config:\n", config);
  console.log("\n---\n getEmbeddings: text:\n", text);
  try {
    const response = await openAi.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });
    const result = await response.json();
    if (result.error)
      throw new Error(result.error.message || "something goes wrong");
    console.log("\n---\n getEmbeddings: result:\n", result);
    return result.data[0].embedding as number[];
  } catch (err) {
    console.log("error calling openAi embeddings api: ", err);
    throw err;
  }
}
