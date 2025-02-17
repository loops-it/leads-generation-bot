import OpenAI from "openai";
import { Request, Response } from 'express';
import { Pinecone } from '@pinecone-database/pinecone';
import "dotenv/config";


if (!process.env.PINECONE_API_KEY || typeof process.env.PINECONE_API_KEY !== 'string') {
    throw new Error('Pinecone API key is not defined or is not a string.');
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const editDocument = async (req: Request, res: Response) => {
    const id = req.query.id;
    const index = pc.index("botdb")
    const fetchResult = await index.namespace('hosting-cub-data').fetch([`${id}`]);
    //console.log(fetchResult.records[`${id}`].metadata)
    const metadata = fetchResult.records[`${id}`].metadata;
    res.render('edit-document', { metadata: metadata, id: req.query.id });
    
};
