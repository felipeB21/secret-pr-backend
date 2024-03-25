import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserEntity } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { verify } from 'jsonwebtoken';

export interface ExpressRequest extends Request {
  user?: UserEntity;
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UsersService) {}
  async use(req: ExpressRequest, res: Response, next: NextFunction) {
    if (!req.headers['authorization']) {
      req.user = null;
      next();
      return;
    }

    const token = req.headers['authorization'].split(' ')[1];

    try {
      const decode = verify(token, process.env.JWT_SECRET) as {
        username: string;
      };
      const user = await this.userService.findByUsername(decode.username);
      req.user = user;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  }
}
