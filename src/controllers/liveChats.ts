import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ChatHeader from '../../models/ChatHeader';
import LiveChat from '../../models/LiveChat';
import AgentLanguages from '../../models/AgentLanguages';
import ChatTimer from '../../models/ChatTimer';
interface UserDecodedToken extends JwtPayload {
  id: string;
  
}

export const liveChatsOnload = async (req: Request, res: Response, next: NextFunction) => {

    var chat = ''
    let agent_id = req.body.agent_id;
    const chats  = await ChatHeader.findAll({
        where: {
            "agent" : "unassigned",
            "status" : "live",
        },
        order: [['id', 'DESC']]
      });
    const languages  = await AgentLanguages.findAll({
        where: {
            "user_id" : agent_id,
        },
    });

    for (var i = 0; i < chats.length; i++) {
        const newMessageCount = await LiveChat.count({
            where: {
              viewed_by_agent: 'no',
              message_id: chats[i].message_id,
            },

          });
          const lastMessage = await LiveChat.findAll({
            where: {
              message_id: chats[i].message_id,
            },
            order: [['id', 'DESC']],
          });
          
          let time = "";
          let message = "";
          if(lastMessage[0]){
            const timestamp = new Date(`${lastMessage[0].createdAt}`);
            time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });
            message = lastMessage[0].message.slice(0, 30);
          }
        for (var c = 0; c < languages.length; c++){
            if(languages[c].language == chats[i].language){
                chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up">
                <div class="d-flex align-items-center">
                    <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="../images/avatar/avatar-1.png" alt="..."></a>
                    <div>
                      <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
                      <p class="mb-0">`+message+` ...</p>
                      <button type="button" class="waves-effect waves-light btn btn-success mb-5 btn-sm" onclick="ReplayToLiveChat('`+chats[i].message_id+`')">REPLY</button>
                    </div>
                </div>
                <div class="text-end">
                  <span class="d-block mb-5 fs-12">`+time+`</span>`
                if(newMessageCount > 0){
                chat += `<span class="badge badge-primary">`+newMessageCount+`</span>`
                } 
                chat += `</div>
            </div>`
    }
    }}
    return res.json({status:"success", chats:chat, chatsCount:chats.length})
};


export const refreshLiveChats = async (req: Request, res: Response, next: NextFunction) => {

  var chat = ''
  let agent_id = req.body.agent_id;
  const chats  = await ChatHeader.findAll({
      where: {
          "agent" : "unassigned",
          "status" : "live",
      },
      order: [['id', 'DESC']]
    });
  const languages  = await AgentLanguages.findAll({
      where: {
          "user_id" : agent_id,
      },
  });

  for (var i = 0; i < chats.length; i++) {
      const newMessageCount = await LiveChat.count({
          where: {
            viewed_by_agent: 'no',
            message_id: chats[i].message_id,
          },

        });
        const lastMessage = await LiveChat.findAll({
          where: {
            message_id: chats[i].message_id,
          },
          order: [['id', 'DESC']],
        });
        let time = "";
        let message = "";
        if(lastMessage[0]){
          const timestamp = new Date(`${lastMessage[0].createdAt}`);
          time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });
          message = lastMessage[0].message.slice(0, 30);
        }
        
      for (var c = 0; c < languages.length; c++){
          if(languages[c].language == chats[i].language){
              chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up">
              <div class="d-flex align-items-center">
                  <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="../images/avatar/avatar-1.png" alt="..."></a>
                  <div>
                    <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
                    <p class="mb-0">`+message+` ...</p>
                    <button type="button" class="waves-effect waves-light btn btn-success mb-5 btn-sm" onclick="ReplayToLiveChat('`+chats[i].message_id+`')">REPLY</button>
                  </div>
              </div>
              <div class="text-end">
                <span class="d-block mb-5 fs-12">`+time+`</span>`
              if(newMessageCount > 0){
              chat += `<span class="badge badge-primary">`+newMessageCount+`</span>`
              } 
              chat += `</div>
          </div>`
  }
  }}
  return res.json({status:"success", chats:chat, chatsCount:chats.length})
};

export const replyLiveChats = async (req: Request, res: Response, next: NextFunction) => {

  let agent_id = req.body.agent_id;
  let message_id = req.body.message_id;

  await LiveChat.update(
    { viewed_by_agent: 'yes' },
    { where: { message_id: message_id } }
  );

  var message_history = ''

  await ChatHeader.update(
    { agent: agent_id },
    { where: { message_id: message_id } }
  );

  const chats  = await LiveChat.findAll({
    where: {
        "message_id" : message_id,
    },
    order: [['id', 'ASC']],
  });

  message_history += `<div class="chatbox" id="main-chat-`+message_id+`">
  <div class="chatbox-top">
    <div class="chat-partner-name">
    #`+message_id+`
    </div>
    <div class="chatbox-icons">
        <button type="button" class="waves-effect waves-light btn btn-danger mb-5 btn-xs" onclick="CloseLiveChat('`+message_id+`')">Close Chat</button>     
    </div>      
  </div>
  <div class="chat-messages  inner-live-chats" id="live-chat-inner-`+message_id+`" data-id="`+message_id+`">`

  for (var i = 0; i < chats.length; i++) {
    const timestamp = new Date("'"+chats[i].createdAt+"'");
    const formattedDateTime = timestamp.toLocaleString(); 
    if(chats[i].sent_by == "customer"){
        message_history += `<div class="chat-msg user">
        <div class="d-flex align-items-center">
            <span class="msg-avatar">
                <img src="/images/avatar/avatar-1.png" class="avatar avatar-lg">
            </span>
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">Customer</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`
        </div>
    </div>`
    }
    else if(chats[i].sent_by == "bot"){
        message_history += `<div class="chat-msg self">
        <div class="d-flex align-items-center justify-content-end">
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">Bot</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
            <span class="msg-avatar">
                <img src="/images/avatar/bot.png" class="avatar avatar-lg">
            </span>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`         
        </div>        
    </div>`
    }
    else{
        message_history += `<div class="chat-msg self">
        <div class="d-flex align-items-center justify-content-end">
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">You</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
            <span class="msg-avatar">
                <img src="../images/avatar/3.jpg" class="avatar avatar-lg">
            </span>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`        
        </div>        
    </div>`
    }
  }
  message_history += `</div>
  <div class="chat-input-holder">
  <textarea class="chat-input" id="agent-reply-message-`+message_id+`"></textarea>
  <button type="button" class="waves-effect waves-light btn btn-success mb-5 btn-sm" onclick="ReplyChat('`+message_id+`')">Send</button>     
  </div>`
  return res.json({status:"success", message:message_history})
};


export const sendReplyLiveChats = async (req: Request, res: Response, next: NextFunction) => {

  let reply_message = req.body.reply_message;
  let message_id = req.body.message_id;

  await LiveChat.create(
    { 
      message_id: message_id,
      sent_by: "agent",
      message: reply_message,
      sent_to_user: "no",
    },
  );
  return res.json({status:"success"})
};

export const closeLiveChats = async (req: Request, res: Response, next: NextFunction) => {

  let message_id = req.body.chatId;

  await ChatHeader.update(
    { status: "closed" },
    { where: { message_id: message_id } }
  );
  return res.json({status:"success"})
};
export const refreshLiveChatInner = async (req: Request, res: Response, next: NextFunction) => {

  let message_id = req.body.message_id;
  let agent_id = req.body.agent_id;
  
  const timer  = await ChatTimer.findAll({
    where: {
        "message_id" : message_id,
    }
  });
  if(!timer[0]){
    await ChatTimer.create(
      { 
        message_id: message_id,
        agent: agent_id,
        time:1,
      },
    );
  }
  else{
    await ChatTimer.update(
      { time: timer[0].time+1 },
      { where: { message_id: message_id } }
    );
  }
  var message_history = ''
  const chats  = await LiveChat.findAll({
    where: {
        "message_id" : message_id,
    },
    order: [['id', 'ASC']],
  });
  for (var i = 0; i < chats.length; i++) {
    const timestamp = new Date("'"+chats[i].createdAt+"'");
    const formattedDateTime = timestamp.toLocaleString(); 
    if(chats[i].sent_by == "customer"){
        message_history += `<div class="chat-msg user">
        <div class="d-flex align-items-center">
            <span class="msg-avatar">
                <img src="/images/avatar/avatar-1.png" class="avatar avatar-lg">
            </span>
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">Customer</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`
        </div>
    </div>`
    }
    else if(chats[i].sent_by == "bot"){
        message_history += `<div class="chat-msg self">
        <div class="d-flex align-items-center justify-content-end">
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">Bot</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
            <span class="msg-avatar">
                <img src="/images/avatar/bot.png" class="avatar avatar-lg">
            </span>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`         
        </div>        
    </div>`
    }
    else{
        message_history += `<div class="chat-msg self">
        <div class="d-flex align-items-center justify-content-end">
            <div class="mx-10">
                <a href="#" class="text-dark hover-primary fw-bold">You</a>
                <p class="text-muted fs-12 mb-0">`+formattedDateTime+`</p>
            </div>
            <span class="msg-avatar">
                <img src="../images/avatar/3.jpg" class="avatar avatar-lg">
            </span>
        </div>
        <div class="cm-msg-text">
        `+chats[i].message+`        
        </div>        
    </div>`
    }
}
return res.json({status:"success", message:message_history})
};