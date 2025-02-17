import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import Agent from '../../models/Agent';
import AgentLanguages from '../../models/AgentLanguages';

export const agentCreateAccount = async (req: Request, res: Response) => {
    const {name, phone, email, password, language} = req.body;
    console.log(req.body);
    try {
        const email_exist = await User.findAll({
          where: {
          email : email,
          },
        });
      if(email_exist[0]){

        return res.json({status:"failed", message:`Email has already registered`})
      }
      else{
          const crypt_password = await (bcrypt.hash(password, 10));
          let user = await User.create(
              { 
              email: email,
              password: crypt_password,
              user_role:2,
              status:"active",
              },
            );
          await Agent.create(
              { 
              user_id: user.id,
              name: name,
              phone:phone,
              status:"active",
              profile_picture:"agent.png",
              },
            );
            for (var i = 0; i < language.length; i++) {
                await AgentLanguages.create(
                    { 
                    user_id: user.id,
                    language: language[i],
                    },
                  );
            }
            return res.json({status:"success", message:"Agent Added"})
      }
      } catch (error) {
        return res.json({status:"failed", message:`${error}`})
      }
};

export const agentUpdateAccount = async (req: Request, res: Response, next: Function) => {
  const {agent_name, phone, email, user_id,language} = req.body

  try {
    const email_exist = await User.findAll({
      where: {
      email : email,
      },
    });
  if(email_exist[0]){
      if(email_exist[0].id == user_id){
          await Agent.update(
              { name: agent_name,phone: phone},
              { where: { user_id: user_id } }
            );
          await User.update(
              { email: email},
              { where: { id: user_id } }
            );
          await AgentLanguages.destroy({
              where: { user_id: user_id },
            });  
          for (var i = 0; i < language.length; i++) {
              await AgentLanguages.create(
                  { 
                  user_id: user_id,
                  language: language[i],
                  },
              );
          }
          return res.json({status:"success", message:"Agent Updated"})
      }
      else{
          return res.json({status:"failed", message:"Email has already registered"})
      }    
  }
  else{
      await Agent.update(
          { name: agent_name,phone: phone},
          { where: { user_id: user_id } }
        );
      await User.update(
          { email: email},
          { where: { id: user_id } }
        );

      await AgentLanguages.destroy({
          where: { user_id: user_id },
        });  
      for (var i = 0; i < language.length; i++) {
          await AgentLanguages.create(
              { 
              user_id: user_id,
              language: language[i],
              },
          );
      }
      return res.json({status:"success", message:"Agent Updated"})
  }
  } catch (error) {
    return res.json({status:"failed", message:`${error}`})
  }
};

export const agentUpdateWithPassword = async (req: Request, res: Response, next: Function) => {
  const {agent_name, phone, email, user_id, password,language} = req.body
  const crypt_password = await (bcrypt.hash(password, 10));
  try {
    const email_exist = await User.findAll({
      where: {
      email : email,
      },
    });
  if(email_exist[0]){
      if(email_exist[0].id == user_id){
        await Agent.update(
          { name: agent_name,phone: phone},
          { where: { user_id: user_id } }
        );
          await User.update(
              { email: email,password: crypt_password},
              { where: { id: user_id } }
            );
            await AgentLanguages.destroy({
              where: { user_id: user_id },
            });  
          for (var i = 0; i < language.length; i++) {
              await AgentLanguages.create(
                  { 
                  user_id: user_id,
                  language: language[i],
                  },
              );
          }
          return res.json({status:"success", message:"Agent Updated"})
      }
      else{
          return res.json({status:"failed", message:"Email has already registered"})
      }    
  }
  else{
    await Agent.update(
      { name: agent_name,phone: phone},
      { where: { user_id: user_id } }
    );
      await User.update(
          { email: email,password: crypt_password},
          { where: { id: user_id } }
        );
        await AgentLanguages.destroy({
          where: { user_id: user_id },
        });  
      for (var i = 0; i < language.length; i++) {
          await AgentLanguages.create(
              { 
              user_id: user_id,
              language: language[i],
              },
          );
      }
      return res.json({status:"success", message:"Agent Updated"})
  }
  } catch (error) {
    return res.json({status:"failed", message:`${error}`})
  }
};