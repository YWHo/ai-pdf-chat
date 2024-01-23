import {
  Pinecone,
  PineconeRecord as Vector,
} from "@pinecone-database/pinecone";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import md5 from "md5";
import { downloadFromS3 } from "./s3-server";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf
  const fileName = await downloadFromS3(fileKey);
  if (!fileName) {
    throw new Error("Could not download from s3");
  }
  const loader = new PDFLoader(fileName);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));
  console.log("\n----- 2. documents:\n", documents);

  // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log("\n----- 3. vectors:\n", vectors);

  // 4. upload to pinecone
  const pineconeIndex = pinecone.index("ai-pdf-chat");
  console.log("\n----- 4. Inserting vectors into pinecone");
  const namespace = convertToAscii(fileKey);
  pineconeIndex.namespace(namespace);
  pineconeIndex.upsert(vectors);
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);
    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as Vector;
  } catch (err) {
    console.log("\nembedDocument() error:\n", err);
    throw err;
  }
}

function truncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
}

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
