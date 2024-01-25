import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fikeKey: string
) {
  try {
    const pineconeIndex = pinecone.index("ai-pdf-chat");
    const namespace = convertToAscii(fikeKey);
    const namespaceIndex = pineconeIndex.namespace(namespace);
    const queryResult = await namespaceIndex.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (err) {}
}

export async function getPdfContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  const qualifyingDocs = matches?.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs?.map((match) => (match.metadata as Metadata).text);
  return docs?.join("\n").substring(0, 3000);
}
