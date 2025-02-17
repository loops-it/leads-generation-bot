import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import BotChats from '../../models/BotChats';


interface UserDecodedToken extends JwtPayload {
  id: string;
  
}



export const botChatsOnload = async (req: Request, res: Response, next: NextFunction) => {

    var chat = ''
    const chats = await BotChats.findAll({
        attributes: ['message_id'],
        group: ['message_id'],
        order: [['id', 'DESC']],
        limit: 20,
    });
    for (var i = 0; i < chats.length; i++) {
        const newMessageCount = await BotChats.count({
            where: {
              viewed_by_admin: 'no',
              message_id: chats[i].message_id,
            },

          });
          const lastMessage = await BotChats.findAll({
            where: {
              message_id: chats[i].message_id,
            },
            order: [['id', 'DESC']],
          });
        const timestamp = new Date("'"+lastMessage[0].createdAt+"'");
        const time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });  
        chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up" onclick="GetAllChats('`+chats[i].message_id+`')">
        <div class="d-flex align-items-center">
            <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="../images/avatar/avatar-1.png" alt="..."></a>
            <div>
              <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
              <p class="mb-0">`+lastMessage[0].message.slice(0, 30)+` ...</p>
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
    return res.json({status:"success", chats:chat, chatsCount:chats.length})
};

export const botChatsGetMessages = async (req: Request, res: Response, next: NextFunction) => {
const {message_id} = req.body

BotChats.update(
    { viewed_by_admin: 'yes' },
    { where: { message_id: message_id } }
);
const chats  = await BotChats.findAll({
    where: {
        "message_id" : message_id,
    },
    order: [['id', 'ASC']],
  });
var message_history = ''

message_history += ` <div class="box">
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
    <div class="chat-box-six" >`
    for (var i = 0; i < chats.length; i++) {
        const timestamp = new Date("'"+chats[i].createdAt+"'");
        const formattedDateTime = timestamp.toLocaleString();   
        if(chats[i].message_sent_by == "customer"){
            message_history += `<div class="rt-bx mb-30 d-flex align-items-start w-p100">
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
            message_history += ` <div class="lt-bx mb-30 d-flex align-items-start w-p100">
            <div>
                <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/images/avatar/bot.png" alt="..."></a>
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
    message_history += `</div>
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
return res.json({status:"success", message:message_history})
};


export const botChatsRefresh = async (req: Request, res: Response, next: NextFunction) => {

    var chat = ''
    const chats = await BotChats.findAll({
        attributes: ['message_id'],
        group: ['message_id']
    });
    for (var i = 0; i < chats.length; i++) {
        const newMessageCount = await BotChats.count({
            where: {
              viewed_by_admin: 'no',
              message_id: chats[i].message_id,
            },

          });
          const lastMessage = await BotChats.findAll({
            where: {
              message_id: chats[i].message_id,
            },
            order: [['id', 'DESC']],
          });
        const timestamp = new Date("'"+lastMessage[0].createdAt+"'");
        const time = timestamp.toLocaleTimeString([], { timeStyle: 'short' });  
        chat += `<div class="p-20 bb-1 d-flex align-items-center justify-content-between pull-up" onclick="GetAllChats('`+chats[i].message_id+`')">
        <div class="d-flex align-items-center">
            <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light" src="../images/avatar/avatar-1.png" alt="..."></a>
            <div>
              <a class="hover-primary mb-5" href="#"><strong>#`+chats[i].message_id+`</strong></a>
              <p class="mb-0">`+lastMessage[0].message.slice(0, 30)+` ...</p>
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
    return res.json({status:"success", chats:chat, chatsCount:chats.length})
};

export const botChatsRefreshMessage = async (req: Request, res: Response, next: NextFunction) => {
    const {message_id} = req.body
    BotChats.update(
        { viewed_by_admin: 'yes' },
        { where: { message_id: message_id } }
    );
    var message_history = ''
    const chats  = await BotChats.findAll({
        where: {
            "message_id" : message_id,
        },
        order: [['id', 'ASC']],
      });
    var message_history = ''
    
    message_history += ` <div class="box">
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
        <div class="chat-box-six" >`
        for (var i = 0; i < chats.length; i++) {
            const timestamp = new Date("'"+chats[i].createdAt+"'");
            const formattedDateTime = timestamp.toLocaleString();   
            if(chats[i].message_sent_by == "customer"){
                message_history += `<div class="rt-bx mb-30 d-flex align-items-start w-p100">
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
                message_history += ` <div class="lt-bx mb-30 d-flex align-items-start w-p100">
                <div>
                    <a class="me-15  avatar avatar-lg" href="#"><img class="bg-primary-light rounded-circle" src="/images/avatar/bot.png" alt="..."></a>
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
        message_history += `</div>
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
    return res.json({status:"success", message:message_history})
};