import OpenAI from "openai";
import { Request, Response } from 'express';
import { Pinecone } from '@pinecone-database/pinecone';
import "dotenv/config";

import File from '../../models/File';

if (!process.env.PINECONE_API_KEY || typeof process.env.PINECONE_API_KEY !== 'string') {
    throw new Error('Pinecone API key is not defined or is not a string.');
}
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

export const viewDocuments = async (req: Request, res: Response) => {
    // const index = pc.index('botdb').namespace('dfcc-new-vectors');

    // const results = await index.listPaginated();
    // console.log(results);

    let chatHistory = req.body.messages || [];

    async function getListOfIDs() {

        try {


            const index = pc.index('botdb');
            const fileIds  = await File.findAll({
                attributes: ['file_id']
              });

              const ids = fileIds.map(file => file.file_id);
            console.log(ids);
            const fetchResult = await index.namespace('hosting-cub-data').fetch(ids);
                

            // console.log("IDs:", fetchResult.records);
            
            // { ids }
            // res.render('id :', fetchResult );
            const vectors = Object.values(fetchResult.records).map(record => ({
                id: record.id,
                title: record.metadata?.Title,
                text: record.metadata?.Text
            }));
            // console.log("vectors: ",vectors)
            res.render('viewVectors', { title: 'All Documents', vectors  });


        } catch (error) {
            console.error("Error processing question:", error);
            res.status(500).json({ error: "An error occurred." });
        }
    }
    await getListOfIDs();
};
