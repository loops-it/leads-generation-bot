import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";
import { Request as ExpressRequest, Response } from "express";
import File from "../../models/File";
import BotChats from "../../models/BotChats";
import { Translate } from "@google-cloud/translate/build/src/v2";
const speech = require("@google-cloud/speech");
import multer from "multer";

const upload = multer();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (
  !process.env.PINECONE_API_KEY ||
  typeof process.env.PINECONE_API_KEY !== "string"
) {
  throw new Error("Pinecone API key is not defined or is not a string.");
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

interface RequestWithChatId extends ExpressRequest {
  userChatId?: string;
}
interface ChatEntry {
  role: string;
  content: string;
}
const translate = new Translate({
  key: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const serviceAccountKey = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "",
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

// console.log("serviceAccountKey: ", serviceAccountKey);

const clientGoogle = new speech.SpeechClient({
  credentials: serviceAccountKey,
});

export const chatTranscribeAudio = async (
  req: RequestWithChatId,
  res: Response
) => {
  // console.log("req : ", req.body.chatId)
  const index = pc.index("botdb");
  const namespace = index.namespace("hosting-cub-data");
  //hosting-cub-data

  let userChatId = req.body.chatId || "";
  let language = req.body.language;

  // console.log(req.body.language)
  // chat id
  if (!userChatId) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);
    const hours = ("0" + currentDate.getHours()).slice(-2);
    const minutes = ("0" + currentDate.getMinutes()).slice(-2);
    const seconds = ("0" + currentDate.getSeconds()).slice(-2);

    const prefix = "chat";
    userChatId = `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}`;
  }


  let languageCode = "en-US"; 
  if (language === "Sinhala") {
    languageCode = "si-LK";
  } else if (language === "Tamil") {
    languageCode = "ta-IN";
  }

  if (!req.file) {
    return res.status(400).send("No audio file uploaded.");
  }

  const audioBuffer = req.file.buffer;

  console.log("audioBuffer : ", audioBuffer);

  const request = {
    audio: {
      content: audioBuffer.toString("base64"),
    },
    config: {
      encoding: "MP3",
      sampleRateHertz: 16000,
      languageCode: languageCode,
    },
  };

  try {
    const [response] = await clientGoogle.recognize(request);
    const transcription = response.results
      .map(
        (result: { alternatives: { transcript: any }[] }) =>
          result.alternatives[0].transcript
      )
      .join("\n");
    console.log(`Transcription (Google Cloud): ${transcription}`);
    res.json({ text: transcription });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).send("Error during transcription");
  }
};
