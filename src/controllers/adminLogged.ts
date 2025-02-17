import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/User';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserDecodedToken extends JwtPayload {
  id: string;
  
}

export const adminLogged = async (req: Request, res: Response, next: NextFunction) => {
    // if (req.session.user) {
    //     next();
    // } else {
    //     req.flash('error', 'You have to login first');
    //     res.redirect('/login');
    // }

    if(!req.cookies.adminLoggedIn) {
        req.flash('error', 'You have to login first');
        res.redirect('/login');
    }
    try {
        const decode = jwt.verify(req.cookies.adminLoggedIn, "lkasdh23123h2ljqwher31414l312423") as UserDecodedToken;
    
        const user = await User.findOne({
          where: {
            "id" : decode.id,
          },
        });
        if (!user) {
            req.flash('error', 'You have to login first');
            return res.redirect('/login');
          }

        res.locals.admin_login_details = user;
        
        return next();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
};