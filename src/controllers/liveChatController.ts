import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ChatHeader from '../../models/ChatHeader';
import LiveChat from '../../models/LiveChat';
import AgentLanguages from '../../models/AgentLanguages';
import ChatTimer from '../../models/ChatTimer';
import Agent from '../../models/Agent';
import BotChats from '../../models/BotChats';


interface UserDecodedToken extends JwtPayload {
  id: string;
  
}
 

export const switchToAgent = async (req: Request, res: Response, next: NextFunction) => {
    const {chatId} = req.body
    try {
        const onlineUser = await User.findOne({ where: { online_status: 'online',status: 'active',user_role: 2 } });
        if(onlineUser){
            const chat_header_exist = await ChatHeader.findOne({ where: { message_id: chatId } });
            const queued_chats  = await ChatHeader.count({
                where: {
                    "agent" : "unassigned",
                    "status" : "live",
                },
            });
            if(chat_header_exist){
                res.json({ status: "success",queued_chats }) 
            }else{
                const chat_main = await BotChats.findOne({
                    where: {
                      message_id: chatId
                    }
                });
                const chats = await BotChats.findAll({
                    where: {
                      message_id: chatId
                    },
                    order: [['id', 'ASC']]
                });
                if(chat_main){
                    await ChatHeader.create({
                    message_id: chatId,
                    language: chat_main.language,
                    status: "live",
                    agent: "unassigned",
                });
                }
    
                for (var c = 0; c < chats.length; c++) {
        
                    await LiveChat.create({
                      message_id: chatId,
                      sent_by: chats[c].message_sent_by,
                      message: chats[c].message,
              
                    })
                }
    
                await BotChats.destroy({
                    where: {
                      message_id: chatId
                    }
                })
                res.json({ status: "success",queued_chats:queued_chats }) 
            }   
        }
       else{
        res.json({ status: "fail"}) 
       }
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};

export const liveChat = async (req: Request, res: Response, next: NextFunction) => {
const {chatId} = req.body
try {
    
    const chat_header_result  = await ChatHeader.findOne({
        where: {
            "message_id" : chatId
        },
      });
    const chat_body_result = await LiveChat.findOne({
        where: {
            message_id: chatId,
            sent_by: 'agent',
            sent_to_user: 'no',
        },
        order: [['id', 'DESC']],
    });
    if(chat_header_result){
        let agent_name;
        let profile_picture;
        let agent_message;
        const agent_details = await Agent.findOne({
            where: {
                user_id: chat_header_result.agent,
            }
        });
        if (agent_details) {
            agent_name = agent_details.name;
            profile_picture = agent_details.profile_picture;
          }
          else{
            agent_name = null;
            profile_picture = null;
          }
          
        if (chat_body_result) {
            agent_message = chat_body_result.message;
            await LiveChat.update(
                { sent_to_user:"yes"},
                { where: { id: chat_body_result.id } }
            );
        }
        else {
            agent_message = null;
          }
          let agent_id = chat_header_result.agent;
          let chat_status = chat_header_result.status;
          let is_time_out = chat_header_result.is_time_out;
          res.json({ agent_id, chat_status, agent_message, agent_name, profile_picture, is_time_out });
    }
    else{
        let agent_id = null;
        let chat_status = null;
        let agent_message = null;
        let agent_name = null;
        let profile_picture = null;
        let is_time_out = null;

          res.json({ agent_id, chat_status, agent_message, agent_name, profile_picture, is_time_out });
    }
}
catch (error) {
    console.error("Error processing question:", error);
    res.status(500).json({ error: "An error occurred." });
}
};


export const liveChatUser = async (req: Request, res: Response, next: NextFunction) => {
    const {chatId,user_message, language} = req.body
    try {
        
        const chat_header_exist = await ChatHeader.findOne({ where: { message_id: chatId } });
        if(chat_header_exist){
            await LiveChat.create({
                message_id: chatId,
                sent_by: 'customer',
                message: user_message,
                viewed_by_agent : 'no'
              })
        }
        else{
            await ChatHeader.create({
                message_id: chatId,
                language: language,
                status: "live",
                agent: "unassigned",
            });
            await LiveChat.create({
                message_id: chatId,
                sent_by: 'customer',
                message: user_message,
                viewed_by_agent : 'no'
              })
        }
        res.json({ status : "success" });
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
    };

export const saveRating = async (req: Request, res: Response, next: NextFunction) => {
    const {ratingValue,feedbackMessage,chatId} = req.body
    try {
        await ChatHeader.update(
            { rating:ratingValue,feedback:feedbackMessage,},
            { where: { message_id: chatId } }
        );
        res.json({ status: "success" })
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};

export const chatUserClose = async (req: Request, res: Response, next: NextFunction) => {
    const {chatId} = req.body
    try {
        await ChatHeader.update(
            { status:"closed"},
            { where: { message_id: chatId } }
        );
        res.json({ status: "success" })
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};
export const chatTimeOut = async (req: Request, res: Response, next: NextFunction) => {
    const {chatId} = req.body
    try {
        await ChatHeader.update(
            { status:"closed",is_time_out:"yes"},
            { where: { message_id: chatId } }
        );
        res.json({ status: "success" })
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};

export const directConnectAgent = async (req: Request, res: Response, next: NextFunction) => {
    const {language} = req.body
    try {
        let chatId = req.body.chatId || "";
        const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
            const day = ('0' + currentDate.getDate()).slice(-2);
            const hours = ('0' + currentDate.getHours()).slice(-2);
            const minutes = ('0' + currentDate.getMinutes()).slice(-2);
            const seconds = ('0' + currentDate.getSeconds()).slice(-2);

            const prefix = 'chat';
            chatId = `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}`;
        
        await ChatHeader.create({
            message_id: chatId,
            language: language,
            status: "live",
            agent: "unassigned",
        });
        res.json({ status: "success",chatId: chatId })
    }
    catch (error) {
        console.error("Error processing question:", error);
        res.status(500).json({ error: "An error occurred." });
    }
};