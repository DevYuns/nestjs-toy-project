import { User } from './../users/entities/user.entity';
import { allowedRoles } from './role.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<allowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];
    if (!user) {
      return false;
    }

    return roles.includes('Any') || roles.includes(user.role);
  }
}
