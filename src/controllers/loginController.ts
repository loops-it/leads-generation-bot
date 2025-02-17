import { Request, Response } from 'express';
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
import multer from 'multer';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone'
import "dotenv/config";
import User from '../../models/User';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserDecodedToken extends JwtPayload {
  id: string;
  // Add other properties if needed
}
export const login = async (req: Request, res: Response, next: Function) => {
    let email = req.body.email;
    let password = req.body.password;
    try {
      const user = await User.findOne({
        where: {
        email,
        "user_role" : "1",
        "status" : "active",
        },
      });
  
      if (user) {
        if(!await bcrypt.compare(password, user.password)){
        req.flash('error', 'Invalid login details');
        return res.redirect('/login');
        }
        else{
        const token = jwt.sign({ id: user.id }, "lkasdh23123h2ljqwher31414l312423", {
          expiresIn: "90d",
        });
  
        const cookieOptions = {
          expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
          httpOnly: true,
        };
  
        res.cookie('adminLoggedIn', token, cookieOptions);
  
        return res.redirect('/admin-dashboard');
      }
      } else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/login');
      }
    } catch (error) {
      req.flash('error', `${error}`);
    }
  };
  

  export const agent = async (req: Request, res: Response, next: Function) => {
    let email = req.body.email;
    let password = req.body.password;
    try {
      const user = await User.findOne({
        where: {
        email,
        "user_role" : "2",
        "status" : "active",
        },
      });
  
      if (user) {
        if(!await bcrypt.compare(password, user.password)){
          req.flash('error', 'Invalid login details');
          return res.redirect('/agent');
        }
        else{
        const token = jwt.sign({ id: user.id }, "lkasdh23123h2ljqwher31414l312423", {
          expiresIn: "90d",
        });
  
        const cookieOptions = {
          expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
          httpOnly: true,
        };
  
        res.cookie('agentLoggedIn', token, cookieOptions);
  
        return res.redirect('/agent-dashboard');
      }
      } else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/agent');
      }
    } catch (error) {
      req.flash('error', `${error}`);
    }
  };
  
  