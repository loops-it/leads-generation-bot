import { Request, Response } from 'express';
const bodyParser = require('body-parser');
const pdfParse = require('pdf-parse');
import multer from 'multer';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone'
import "dotenv/config";
import User from '../../models/User';
import Admin from '../../models/Admin';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserDecodedToken extends JwtPayload {
  id: string;
  // Add other properties if needed
}
export const adminAccountCreate = async (req: Request, res: Response, next: Function) => {
    let name = req.body.name;
    let phone = req.body.phone;
    let email = req.body.email;
    let password = req.body.password;
    let user_role = req.body.user_role;

    try {
      const email_exist = await User.findAll({
        where: {
        email : email,
        },
      });
    if(email_exist[0]){
        return res.json({status:"failed", message:"Email has already registered"})
    }
    else{
        const crypt_password = await (bcrypt.hash(password, 10));
        let user = await User.create(
            { 
            email: email,
            password: crypt_password,
            user_role:user_role,
            status:"active",
            },
          );
        await Admin.create(
            { 
            user_id: user.id,
            name: name,
            phone:phone,
            status:"active",
            },
          );
          return res.json({status:"success", message:"Admin Added"})
    }
    } catch (error) {
      return res.json({status:"failed", message:`${error}`})
    }
  };
  
  export const adminUpdate = async (req: Request, res: Response, next: Function) => {
    const {admin_name, phone, email, user_id} = req.body

    try {
      const email_exist = await User.findAll({
        where: {
        email : email,
        },
      });
    if(email_exist[0]){
        if(email_exist[0].id == user_id){
            await Admin.update(
                { name: admin_name,phone: phone},
                { where: { user_id: user_id } }
              );
            await User.update(
                { email: email},
                { where: { id: user_id } }
              );
    
            return res.json({status:"success", message:"Admin Updated"})
        }
        else{
            return res.json({status:"failed", message:"Email has already registered"})
        }    
    }
    else{
        await Admin.update(
            { name: admin_name,phone: phone},
            { where: { user_id: user_id } }
          );
        await User.update(
            { email: email},
            { where: { id: user_id } }
          );

        return res.json({status:"success", message:"Admin Updated"})
    }
    } catch (error) {
      return res.json({status:"failed", message:`${error}`})
    }
  };

  export const matchPassword = async (req: Request, res: Response, next: Function) => {
    const {current_password, user_id} = req.body

    try {
      const user = await User.findAll({
        where: {
        id : user_id,
        },
      });
    if(!user[0] || !await bcrypt.compare(current_password, user[0].password)){
        return res.json({status:"failed", message:"Current password is incorrect"})
    }
    else {
        return res.json({status:"success"})
    }
    } catch (error) {
      return res.json({status:"failed", message:`${error}`})
    }
  };
  
  export const adminUpdateWithPassword = async (req: Request, res: Response, next: Function) => {
    const {admin_name, phone, email, user_id, password} = req.body
    const crypt_password = await (bcrypt.hash(password, 10));
    try {
      const email_exist = await User.findAll({
        where: {
        email : email,
        },
      });
    if(email_exist[0]){
        if(email_exist[0].id == user_id){
            await Admin.update(
                { name: admin_name,phone: phone},
                { where: { user_id: user_id } }
              );
            await User.update(
                { email: email,password: crypt_password},
                { where: { id: user_id } }
              );
    
            return res.json({status:"success", message:"Admin Updated"})
        }
        else{
            return res.json({status:"failed", message:"Email has already registered"})
        }    
    }
    else{
        await Admin.update(
            { name: admin_name,phone: phone},
            { where: { user_id: user_id } }
          );
        await User.update(
            { email: email,password: crypt_password},
            { where: { id: user_id } }
          );

        return res.json({status:"success", message:"Admin Updated"})
    }
    } catch (error) {
      return res.json({status:"failed", message:`${error}`})
    }
  };