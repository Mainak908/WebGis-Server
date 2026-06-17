import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { FastifyRequest } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
  cookies: Record<string, string | undefined>;
  user?: { sub: number; username: string };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        username: string;
      }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      // Set the user on the request
      request.user = payload;
    } catch {
      throw new UnauthorizedException(
        'Authentication token is invalid or expired',
      );
    }

    return true;
  }

  private extractToken(request: AuthenticatedRequest): string | undefined {
    // Try to extract from cookie first
    if (request.cookies && request.cookies.token) {
      return request.cookies.token;
    }
    // Fallback to Bearer token in Authorization header
    const authorization = request.headers.authorization;
    if (!authorization) {
      return undefined;
    }
    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      return undefined;
    }
    const [type, token] = parts;
    return type === 'Bearer' ? token : undefined;
  }
}
