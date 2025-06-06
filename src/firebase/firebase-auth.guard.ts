import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase-auth') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const baseGuardResult = await super.canActivate(context);
    if (!baseGuardResult) {
      throw new UnauthorizedException('no role was set for this endpoint');
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      throw new UnauthorizedException('no role was set for this endpoint');
    }
    const { user } = context.switchToHttp().getRequest();

    const possibleRoles = roles.filter(
      (rl) => !['user', 'manager'].includes(rl),
    );

    if (possibleRoles.length == 0) {
      return true;
    }

    if (user.roles?.includes('admin')) {
      return true;
    }

    if (possibleRoles.length > 0 && user.roles?.length == 0) {
      return false;
    }

    return possibleRoles.some((rl) => user.roles.includes(rl));
  }
}
