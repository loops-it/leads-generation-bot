import { Request, Response } from 'express';
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
import multer from 'multer';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone'
import "dotenv/config";
import QuickQuestion from '../../models/QuickQuestion';

export const quickQuestionsAdd = async (req: Request, res: Response, next: Function) => {
    let question = req.body.question;
    let answer = req.body.answer;
    try {
        await QuickQuestion.create(
            { 
            question: question,
            answer: answer,
            },
        );
        req.flash('success', `Question Added`);
        return res.redirect('/quick-questions');
    } catch (error) {
      req.flash('error', `${error}`);
      return res.redirect('/quick-questions');
    }
  };
  

  export const quickQuestionsEdit = async (req: Request, res: Response, next: Function) => {
    let question = req.body.question;
    let answer = req.body.answer;
    let id = req.body.id;
    try {

        await QuickQuestion.update(
            { 
                question: question,
                answer: answer,
            },
            { where: { id: id } }
          );
        req.flash('success', `Question Updated`);
        return res.redirect(`/edit-question?id=${id}`);
    } catch (error) {
      req.flash('error', `${error}`);
      return res.redirect(`/edit-question?id=${id}`);
    }
  };