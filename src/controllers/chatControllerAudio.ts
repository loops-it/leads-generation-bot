import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import "dotenv/config";
import { Request as ExpressRequest, Response } from "express";
import File from "../../models/File";
import BotChats from "../../models/BotChats";
import { Translate } from "@google-cloud/translate/build/src/v2";
// const speech = require("@google-cloud/speech");
const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

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

// const clientGoogle = new speech.SpeechClient({
//   credentials: serviceAccountKey,
// });

const textToSpeachClient = new TextToSpeechClient({
  credentials: serviceAccountKey,
});

export const chatAudioResponse = async (
  req: RequestWithChatId,
  res: Response
) => {
  // console.log("req : ", req.body.chatId)
  const index = pc.index("botdb");
  const namespace = index.namespace("hosting-cub-data");
  //aircash-data

  let userChatId = req.body.chatId || "";
  let language = req.body.language;
  let transcriptQuestion = req.body.transcript;
  let messages = req.body.chatHistory;

  console.log("Original Chat History:", messages);

  // console.log(req.body.language)

  try {
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

      // console.log("Generated chat id : ", userChatId);
    } else {
      // console.log("Existing chat id : ", userChatId);
    }

    //============= get question ======================
    // get user message with history
    let chatHistory = req.body.messages || [];

    let userQuestion = "";

    let translatedQuestion = "";
    let languageCode = "en-GB";
    let voiceName = "en-GB-Standard-A";
    let responsiveLanguage = '';
    // console.log("userQuestion : ", userQuestion)
    if (language == "Sinhala") {
      // languageCode = "si-LK";
      // voiceName = "si-LK-Standard-A";
      responsiveLanguage = 'Sinhala';
      // responsiveVoice.speak("hello world", "Sinhala", {volume: 1});
      
      translatedQuestion = await translateToEnglish(transcriptQuestion);
    } else if (language === "Tamil") {
      languageCode = "ta-IN";
      voiceName = "ta-IN-Standard-C";
      translatedQuestion = await translateToEnglish(transcriptQuestion);
    } else {
      languageCode = "en-GB";
      voiceName = "en-GB-Standard-A";
      translatedQuestion = transcriptQuestion;
    }

    // console.log("userQuestion",userQuestion);

    async function translateToEnglish(transcriptQuestion: string) {
      const [translationsToEng] = await translate.translate(
        transcriptQuestion,
        "en"
      );
      const finalQuestion = Array.isArray(translationsToEng)
        ? translationsToEng.join(", ")
        : translationsToEng;
      return finalQuestion;
    }
    const lastUserIndex = chatHistory
      .map((entry: ChatEntry) => entry.role)
      .lastIndexOf("user");
    if (lastUserIndex !== -1) {
      chatHistory[lastUserIndex].content = translatedQuestion;
      // console.log(chatHistory);
    }
    await BotChats.create({
      message_id: userChatId,
      language: language,
      message: transcriptQuestion,
      message_sent_by: "customer",
      viewed_by_admin: "no",
    });

    let kValue = 2;

    async function handleSearchRequest(
      translatedQuestion: string,
      kValue: number
    ) {
      const filteredChatHistory = chatHistory.filter(
        (item: { role: string }) => item.role !== "system"
      );
      console.log("Filtered Chat History:", filteredChatHistory);

      const chatHistoryString = JSON.stringify(filteredChatHistory);

      console.log("chatHistoryString : ", chatHistoryString);

      console.log(`translated to ${language}  Question : ${translatedQuestion}`);

      const questionRephrasePrompt = `As a senior banking assistant, kindly assess whether the FOLLOWUP QUESTION related to the CHAT HISTORY or if it introduces a new question. If the FOLLOWUP QUESTION is unrelated, refrain from rephrasing it. However, if it is related, please rephrase it as an independent query utilizing relevent keywords from the CHAT HISTORY, even if it is a question related to the calculation. If the user asks for information like email or address, provide Air Cash email and address.
      ----------
      CHAT HISTORY: {${chatHistoryString}}
      ----------
      FOLLOWUP QUESTION: {${translatedQuestion}}
      ----------
      Standalone question:`;

      const completionQuestion = await openai.completions.create({
        model: "gpt-3.5-turbo-instruct",
        prompt: questionRephrasePrompt,
        max_tokens: 50,
        temperature: 0,
      });

      console.log("Standalone Question :", completionQuestion.choices[0].text);

      // =============================================================================
      // create embeddings
      const embedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: completionQuestion.choices[0].text,
      });

      const queryResponse = await namespace.query({
        vector: embedding.data[0].embedding,
        topK: kValue,
        includeMetadata: true,
      });

      const results: string[] = [];

      queryResponse.matches.forEach((match) => {
        if (match.metadata && typeof match.metadata.Title === "string") {
          const result = `Title: ${match.metadata.Title}, \n Content: ${match.metadata.Text} \n \n `;
          results.push(result);
        }
      });
      let context = results.join("\n");

      // set system prompt
      // =============================================================================
      if (chatHistory.length === 0 || chatHistory[0].role !== "system") {
        chatHistory.unshift({ role: "system", content: "" });
      }
      chatHistory[0].content = `You are a helpful assistant and you are friendly. if user greet you you will give proper greeting in friendly manner. Your name is "Hosting Cub". Answer user question Only based on given Context: ${context}, your answer must be less than 150 words. If the user asks for information like your email or address, you'll provide Hosting Cub email and address. If answer has list give it as numberd list. If it has math question relevent to given Context give calculated answer, If user question is not relevent to the Context just say "Sorry, I couldn't find any information on that. Would you like to chat with a live agent?". Do NOT make up any answers and questions not relevant to the context using public information.`;
    }

    await handleSearchRequest(transcriptQuestion, kValue);

    // console.log("chatHistory",chatHistory);
    // GPT response ===========================
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: chatHistory,
      max_tokens: 180,
      temperature: 0,
    });

    let botResponse: string | null = completion.choices[0].message.content;
    let selectedLanguage = "en";
    let translatedResponse = "";
    // console.log("userQuestion : ", userQuestion)
    if (language == "Sinhala") {
      selectedLanguage = "si";
      if (botResponse !== null) {
        translatedResponse = await translateToLanguage(botResponse);
      }
    } else if (language === "Tamil") {
      selectedLanguage = "ta";
      if (botResponse !== null) {
        translatedResponse = await translateToLanguage(botResponse);
      }
    } else {
      selectedLanguage = "en";
      if (botResponse !== null) {
        translatedResponse = botResponse;
      }
    }

    console.log("translatedResponse (SP2TXT) : ", translatedResponse);

    chatHistory.push({ role: "assistant", content: translatedResponse });

    async function translateToLanguage(botResponse: string) {
      const [translationsToLanguage] = await translate.translate(
        botResponse,
        selectedLanguage
      );
      const finalAnswer = Array.isArray(translationsToLanguage)
        ? translationsToLanguage.join(", ")
        : translationsToLanguage;
      return finalAnswer;
    }

    // add assistant to array
    chatHistory.push({ role: "assistant", content: botResponse });
    let audioSrc;
    if(responsiveLanguage === 'Sinhala'){
      console.log("sinhala response")
      audioSrc = null
    }else{
      const [response] = await textToSpeachClient.synthesizeSpeech({
        input: { text: translatedResponse },
        voice: { languageCode: languageCode, name: voiceName, ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" },
      });
  
      const audioContent = response.audioContent.toString("base64");
      audioSrc = `data:audio/mp3;base64,${audioContent}`;
    }

    await BotChats.create({
      message_id: userChatId,
      language: language,
      message: translatedResponse,
      message_sent_by: "bot",
      viewed_by_admin: "no",
    });

    // console.log("botResponse",botResponse);
    // console.log("translatedResponse",translatedResponse);
    res.json({
      answer: translatedResponse,
      chatHistory: chatHistory,
      chatId: userChatId,
      audioSrc: audioSrc,
    });
    // }
  } catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};