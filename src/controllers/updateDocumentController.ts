import { Request, Response } from 'express';
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
import multer from 'multer';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone'
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
if (!process.env.PINECONE_API_KEY || typeof process.env.PINECONE_API_KEY !== 'string') {
    throw new Error('Pinecone API key is not defined or is not a string.');
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage: multer.memoryStorage() });

// Define the uploadDocuments middleware
export const updateDocuments = async (req: Request, res: Response, next: Function) => {
    const index = pc.index("botdb")
    let title = req.body.title;
    let id = req.body.id;
    let text = req.body.text;
    // let category = req.body.category;
    try {
      if (!req.file) {
        const embedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: text,
        });
        await index.namespace('hosting-cub-data').update({
            "id": id, 
            "values": embedding.data[0].embedding,
            "metadata": {"Title": title, "Text": text}
        });
        res.send('PDF update successful.');
      }
      else{
        // const parsedData = await pdfParse(req.file.path);
        const buffer = Buffer.from(req.file.buffer);
        const parsedData = await pdfParse(buffer);
        const pdfParcesData = parsedData.text
      const cleanedText = pdfParcesData.replace(/\n/g, '');
        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: cleanedText,
        });
        await index.namespace('hosting-cub-data').update({
            "id": id, 
            "values": embedding.data[0].embedding,
            "metadata": {"Title": title, "Text": cleanedText}
        });
        res.send('PDF update successful.');
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  // Apply multer middleware to the uploadDocuments middleware
  export const handleFileUploadUpdate = upload.single('file');
  