import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";
import { Request as ExpressRequest, Response } from "express";
import { OperationUsage } from "@pinecone-database/pinecone/dist/data/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (
  !process.env.PINECONE_API_KEY ||
  typeof process.env.PINECONE_API_KEY !== "string"
) {
  throw new Error("Pinecone API key is not defined or is not a string.");
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });


type OpenAIMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string; 
};

interface RequestWithChatId extends ExpressRequest {
  userChatId?: string;
}

interface ChatEntry {
  role: string;
  content: string;
}


export const chatResponseTrigger = async (req: RequestWithChatId, res: Response) => {
  try {
    let userChatId = req.body.chatId || generateChatId();
    const index = pc.index("botdb");
  // const namespace = index.namespace("legalCRM-data-test");
  const namespace = index.namespace("legalCRM-vector-store");

    let chatHistory: OpenAIMessage[] = req.body.messages || [];
    const userQuestion = extractLastUserMessage(chatHistory);

    if (!userQuestion) {
      return res.status(400).json({ error: "No user message found." });
    }

    updateUserMessage(chatHistory, userQuestion);

 
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: userQuestion,
    });
    let queryResponse: { matches: any; namespace?: string; usage?: OperationUsage | undefined; };
    queryResponse = await namespace.query({
      vector: embedding.data[0].embedding,
      topK: 2,
      includeMetadata: true,
    });
    const results: string[] = [];
      // console.log("CONTEXT : ", queryResponse.matches[0].metadata);
      queryResponse.matches.forEach((match: { metadata: { Title: any; Text: any; }; }) => {
        if (match.metadata && typeof match.metadata.Title === "string") {
          const result = `Title: ${match.metadata.Title}, \n  Content: ${match.metadata.Text} \n \n `;
          results.push(result);
        }
      });
    let context = results.join("\n");
    console.log("context : ",context)
    prependSystemMessage(chatHistory, context);

    const completion = await openai.chat.completions.create({
      messages: chatHistory,
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0,
    });

    

    const botResponse = completion.choices[0]?.message.content?.trim() || "No response from model.";
    console.log("botResponse : ",botResponse)
    chatHistory.push({ role: "assistant", content: botResponse });

    res.json({
      answer: botResponse,
      chatHistory,
      chatId: userChatId,
    });
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};


function generateChatId() {
  const currentDate = new Date();
  const formatDate = (unit: number) => `0${unit}`.slice(-2);
  const prefix = "chat";
  return `${prefix}_${currentDate.getFullYear()}${formatDate(currentDate.getMonth() + 1)}${formatDate(currentDate.getDate())}_${formatDate(currentDate.getHours())}${formatDate(currentDate.getMinutes())}${formatDate(currentDate.getSeconds())}`;
}

function extractLastUserMessage(chatHistory: OpenAIMessage[]): string {
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    if (chatHistory[i].role === "user") {
      return chatHistory[i].content;
    }
  }
  return "";
}

function updateUserMessage(chatHistory: OpenAIMessage[], userQuestion: string) {
  const lastUserIndex = chatHistory.map(entry => entry.role).lastIndexOf("user");
  if (lastUserIndex !== -1) {
    chatHistory[lastUserIndex].content = userQuestion;
  }
}

function prependSystemMessage(chatHistory: OpenAIMessage[],context: string) {
//   const sysPrompt = `You are Jane, a friendly and helpful assistant at "The Legal Firm." Greet users warmly when they initiate a conversation. Respond to all questions politely and informatively based on the provided context, answer in spanish language, ensuring each answer is concise, under 75 words. If a user requests legal support or information about representation, ask, "Are you looking to choose a lawyer for your case?" If they confirm, respond with "Se procederá a la selección del abogado." If you don’t have specific information, provide a plausible response while remaining within the guidelines. Do not answer from public information. 

// -----
// CONTEXT: ${context}

// -----------
// ANSWER: `;


// const sysPrompt = `You are Jane, a friendly and helpful assistant at "The Legal Firm." Greet users warmly when they initiate a conversation. Respond to all questions politely and informatively based on the provided context, answering in Spanish. Ensure each response is concise, under 75 words.

// If a user requests legal support or information about representation, ask, "¿Estás buscando elegir un abogado para tu caso?" If they confirm, reply, "Se procederá a la selección del abogado. Un experto se pondrá en contacto contigo dentro de las próximas 24 horas."

// If you don’t have specific information, provide a plausible response while staying within the guidelines. To improve client experience, collect information from the prospect as part of the process. Additionally, if lawyers allow, inform the prospect of the office phone number and email for direct contact. Always ensure the process is smooth and helpful.

// Avoid using public information and focus on providing relevant assistance.

// -----
// CONTEXT: ${context}

// -----------
// ANSWER: `;

// const sysPrompt = `You are Jane, a friendly and helpful assistant at "The Marketing Firm." Greet users warmly when they initiate a conversation. Respond to all questions politely and informatively based on the provided context, answering in Spanish. Ensure each response is concise, under 75 words.

// If a user requests legal support or information about representation, ask, "¿Está buscando elegir un agente de marketing para su caso."If they confirm, reply, "Se seleccionará el agente de marketing. Un experto se comunicará con usted dentro de las próximas 24 horas."

// If you don’t have specific information, provide a plausible response while staying within the guidelines. To improve client experience, collect information from the prospect as part of the process. Additionally, if lawyers allow, inform the prospect of the office phone number and email for direct contact. Always ensure the process is smooth and helpful.

// Do not use public information and focus on providing relevant assistance.
// -----
// CONTEXT: ${context}

// -----------
// ANSWER: `;

const sysPrompt = `You are Jane, a friendly and helpful assistant at "The Marketing Firm." Greet users warmly when they initiate a conversation. Respond to all questions politely and informatively based on the provided context, answering in English. Ensure each response is concise, under 75 words.

If a user requests legal support or information about representation, ask, "Are you looking to choose a marketing agent for your case?" If they confirm, reply, "A marketing agent will be selected. An expert will contact you within the next 24 hours."

If you don’t have specific information, provide a plausible response while staying within the guidelines. To improve client experience, collect information from the prospect as part of the process. Additionally, if lawyers allow, inform the prospect of the office phone number and email for direct contact. Always ensure the process is smooth and helpful.

Do not use any special formatting, such as bold, italics, or symbols like **, *, _, or ~. Present all text in plain format.

-----
CONTEXT: ${context}

-----------
ANSWER:
1. Title: Description
2. Title: Description
3. Title: Description
...`;



  chatHistory.unshift({
    role: "system",
    content: sysPrompt,
  });
}