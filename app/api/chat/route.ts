import { PineconeClient } from "@pinecone-database/pinecone";
import { LangChainStream, StreamingTextResponse } from "ai";
import { CallbackManager } from "langchain/callbacks";
import { VectorDBQAChain } from "langchain/chains";
import { HuggingFaceInferenceEmbeddings } from "langchain/embeddings/huggingface";
import { HuggingFaceInference } from "langchain/llms/huggingface";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Parse the POST request's JSON body
  const body = await request.json();

  // Use Vercel's `ai` package to setup a stream
  const { stream, handlers } = LangChainStream();

  // Initialize Pinecone Client
  const pineconeClient = new PineconeClient();
  await pineconeClient.init({
    apiKey: process.env.PINECONE_API_KEY ?? "",
    environment: "gcp-starter",
  });
  const pineconeIndex = pineconeClient.Index(
    process.env.PINECONE_INDEX_NAME as string
  );

  // Initialize our vector store
  const vectorStore = await PineconeStore.fromExistingIndex(
    new HuggingFaceInferenceEmbeddings({
      model: "hkunlp/instructor-base",
      apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
    }),
    { pineconeIndex }
  );

  // Specify the OpenAI model we'd like to use, and turn on streaming
  const model = new HuggingFaceInference({
    model: "bigscience/bloom",
    apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
    streaming: true,
    callbackManager: CallbackManager.fromHandlers(handlers),
  });

  // Define the Langchain chain
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });

  // Call our chain with the prompt given by the user
  chain.call({ query: body.message }).catch(console.error);

  return new StreamingTextResponse(stream);
}