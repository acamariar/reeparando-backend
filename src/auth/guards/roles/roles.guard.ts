import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Token requerido');
    }

    const userLevel = Number(user.nivel);

    if (Number.isNaN(userLevel)) {
      throw new UnauthorizedException('Usuario inválido');
    }

    if (userLevel === 1) {
      return true;
    }

    const allowed = requiredRoles.includes(userLevel);

    if (!allowed) {
      throw new ForbiddenException('No tenés permisos');
    }

    return true;
  }
}