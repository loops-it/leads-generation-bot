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

export const LiveChatHistoryOnload = async (req: Request, res: Response, next: NextFunction) => {
    const {agent_id,profile_picture} = req.body
    var chat = ''
    const chats  = await ChatHeader.findAll({
        where: {
            "agent" : agent_id,
        },
      });

    for (var i = 0; i < chats.length; i++) {
        const lastMessage = await LiveChat.findAll({
            where: {
              message_id: chats[i].message_id,
            },
            order: [['id', 'DESC']],
          });
          const timestamp = new Date("'"+lastMessage[0].createdAt+"'");
          const time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });  
        chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up" onclick="GetLiveAllChats('`+chats[i].message_id+`')">
          <div class="d-flex align-items-center">
              <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="/uploads/`+profile_picture+`" alt="..."></a>
              <div>
                <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
                <p class="mb-0">`+lastMessage[0].message.slice(0, 30)+` ...</p>
              </div>
          </div>
          <div class="text-end">
          <span class="d-block mb-5 fs-12">`+time+`</span>`
        chat += `</div>
    </div>`
  }
  return res.json({status:"success", chats:chat, chatsCount:chats.length})
};


export const LiveChatHistoryMessages = async (req: Request, res: Response, next: NextFunction) => {
    const {agent_id,profile_picture,message_id} = req.body;
    var chat = ''
      const chats = await LiveChat.findAll({
        where: {
          message_id: message_id
        },
        order: [['id', 'ASC']]
      });
      chat += ` <div class="box">
      <div class="box-body px-20 py-10 bb-1 bbsr-0 bber-0">
        <div class="d-md-flex d-block justify-content-between align-items-center w-p100">
            <div class="d-flex align-items-center">
                <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/images/avatar/avatar-1.png" alt="..."></a>
                <div>
                  <a class="hover-primary mb-5" href="#"><strong>#`+message_id+`</strong></a>
                 
                </div>
            </div>
        </div>								             
      </div>
      <div class="box-body mb-30">
          <div class="chat-box-six">`
          for (var i = 0; i < chats.length; i++) {
              const timestamp = new Date("'"+chats[i].createdAt+"'");
              const formattedDateTime = timestamp.toLocaleString();   
              if(chats[i].sent_by == "customer"){
                chat += `<div class="rt-bx mb-30 d-flex align-items-start w-p100">
                  <div>
                      <a class="ms-15  avatar avatar-lg" href="#"><img class="bg-danger-light rounded-circle" src="/images/avatar/avatar-1.png" alt="..."></a>
                  </div>
                  <div>
                      <div class="chat-comment d-table max-w-p70 bg-light mb-15 px-15 py-10 rounded10 bter-0">
                          <p class="mb-0">`+chats[i].message+`</p>
                      </div>
                      <p class="text-muted mb-15">`+formattedDateTime+`</p>
                  </div>
                </div>` 
              }
              else{
                chat += ` <div class="lt-bx mb-30 d-flex align-items-start w-p100">
                  <div>
                      <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/uploads/`+profile_picture+`" alt="..."></a>
                  </div>
                  <div>
                      <div class="chat-comment box-shadowed d-table max-w-p70 bg-primary mb-15 px-15 py-10 rounded10 btsr-0">
                          <p class="mb-0">`+chats[i].message+`</p>
                      </div>											
                      <p class="text-muted mb-15">`+formattedDateTime+`</p>
                  </div>
                </div>`
              }
              
          }
          chat += `</div>
      </div>
        <!--<div class="box-footer">
            <div class="d-md-flex d-block justify-content-between align-items-center">
                <input class="form-control b-0 py-10" type="text" placeholder="Type something here...">
                <div class="d-flex justify-content-between align-items-center mt-md-0 mt-30">
            
                    <button type="button" class="waves-effect waves-circle btn btn-circle btn-primary">
                        <i class="mdi mdi-send"></i>
                    </button>
                </div>
            </div>
        </div>-->
    </div>`
      return res.json({status:"success", chats:chat})
  };
  
export const LiveChatHistoryRefresh = async (req: Request, res: Response, next: NextFunction) => {

    const {agent_id,profile_picture} = req.body
    var chat = ''
    const chats = await ChatHeader.findAll({
      where: {
          agent: agent_id
      }
    });
    for (var i = 0; i < chats.length; i++) {
        const lastMessage = await LiveChat.findAll({
          where: {
            message_id: chats[i].message_id,
          },
          order: [['id', 'DESC']],
        });
        const timestamp = new Date("'"+lastMessage[0].createdAt+"'");
        const time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });  
      chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up" onclick="GetLiveAllChats('`+chats[i].message_id+`')">
        <div class="d-flex align-items-center">
            <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="/uploads/`+profile_picture+`" alt="..."></a>
            <div>
              <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
              <p class="mb-0">`+lastMessage[0].message.slice(0, 30)+` ...</p>
            </div>
        </div>
        <div class="text-end">
        <span class="d-block mb-5 fs-12">`+time+`</span>`
      chat += `</div>
  </div>`

    }
      return res.json({status:"success", chats:chat, chatsCount:chats.length})
};

export const LiveChatHistoryRefreshMessages = async (req: Request, res: Response, next: NextFunction) => {

  const {profile_picture,message_id} = req.body
  var chat = ''
  const chats = await LiveChat.findAll({
    where: {
      message_id: message_id
    },
    order: [['id', 'ASC']]
  });
  chat += ` <div class="box">
  <div class="box-body px-20 py-10 bb-1 bbsr-0 bber-0">
    <div class="d-md-flex d-block justify-content-between align-items-center w-p100">
        <div class="d-flex align-items-center">
            <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/images/avatar/avatar-1.png" alt="..."></a>
            <div>
              <a class="hover-primary mb-5" href="#"><strong>#`+message_id+`</strong></a>
             
            </div>
        </div>
    </div>								             
  </div>
  <div class="box-body mb-30">
      <div class="chat-box-six">`
      for (var i = 0; i < chats.length; i++) {
          const timestamp = new Date("'"+chats[i].createdAt+"'");
          const formattedDateTime = timestamp.toLocaleString();   
          if(chats[i].sent_by == "customer"){
            chat += `<div class="rt-bx mb-30 d-flex align-items-start w-p100">
              <div>
                  <a class="ms-15  avatar avatar-lg" href="#"><img class="bg-danger-light rounded-circle" src="/images/avatar/avatar-1.png" alt="..."></a>
              </div>
              <div>
                  <div class="chat-comment d-table max-w-p70 bg-light mb-15 px-15 py-10 rounded10 bter-0">
                      <p class="mb-0">`+chats[i].message+`</p>
                  </div>
                  <p class="text-muted mb-15">`+formattedDateTime+`</p>
              </div>
            </div>` 
          }
          else{
            chat += ` <div class="lt-bx mb-30 d-flex align-items-start w-p100">
              <div>
                  <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/uploads/`+profile_picture+`" alt="..."></a>
              </div>
              <div>
                  <div class="chat-comment box-shadowed d-table max-w-p70 bg-primary mb-15 px-15 py-10 rounded10 btsr-0">
                      <p class="mb-0">`+chats[i].message+`</p>
                  </div>											
                  <p class="text-muted mb-15">`+formattedDateTime+`</p>
              </div>
            </div>`
          }
          
      }
      chat += `</div>
  </div>
    <!--<div class="box-footer">
        <div class="d-md-flex d-block justify-content-between align-items-center">
            <input class="form-control b-0 py-10" type="text" placeholder="Type something here...">
            <div class="d-flex justify-content-between align-items-center mt-md-0 mt-30">
        
                <button type="button" class="waves-effect waves-circle btn btn-circle btn-primary">
                    <i class="mdi mdi-send"></i>
                </button>
            </div>
        </div>
    </div>-->
</div>`
  return res.json({status:"success", chats:chat})
};