import { Role } from '../../constants/enums';

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../role.decorator';

@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user:profile } = context.switchToHttp().getRequest();
    const success = requiredRoles.some((role) => profile.user.roles?.includes(role));

    if (!success) {
      throw new UnauthorizedException(`Forbidden: ${requiredRoles} Only`);
    }

    return success;
  }
}

export default RolesGuard;
