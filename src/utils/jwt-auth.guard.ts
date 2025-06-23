import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Extended Request interface to include user property
interface RequestWithUser extends Request {
  user?: any;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('JWT token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach the user payload to the request object
      request['user'] = payload;

      // Check role-based access (if roles are specified for the endpoint)
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
      if (!requiredRoles || requiredRoles.length === 0) {
        return true; // No specific roles required
      }

      const userRoles = request.user?.roles || [];

      // Admin has access to everything
      if (userRoles.includes('admin')) {
        return true;
      }

      // Check if a user has at least one of the required roles
      return requiredRoles.some((role) => userRoles.includes(role));
    } catch (error) {
      throw new UnauthorizedException('Invalid JWT token');
    }
  }

  private extractTokenFromRequest(
    request: RequestWithUser,
  ): string | undefined {
    // First, try to extract from cookie (your existing approach)
    const cookieToken = request.cookies?.['next-auth.session-token'];
    if (cookieToken) {
      return cookieToken;
    }

    // Then try to extract from the Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }

    return undefined;
  }
}
