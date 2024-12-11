import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/types';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    await this.authenticateUser(req);

    return this.authorizeUser(req, context);
  }

  private async authenticateUser(req: any): Promise<void> {
    const bearerHeader = req.headers.authorization;
    // Bearer eylskfdjlsdf309
    const token = bearerHeader?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided.');
    }

    try {
      const payload = await this.jwtService.verify(token);
      const id = payload.id;
      if (!id) {
        throw new UnauthorizedException(
          'Invalid token. No id present in the token.',
        );
      }

      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new UnauthorizedException(
          'Invalid token. No user present with the id.',
        );
      }

      // console.log('jwt payload: ', payload);
      req.user = payload;
    } catch (err) {
      console.error('Token validation error:', err);
      throw err;
    }

    if (!req.user) {
      throw new UnauthorizedException('Invalid token.');
    }
  }

  private async authorizeUser(
    req: any,
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredRoles = this.getMetadata<Role[]>('roles', context);
    const userRoles = await this.getUserRoles(req.user.id);
    req.user.roles = userRoles;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some((role) => userRoles.includes(role));
  }

  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private async getUserRoles(id: string): Promise<Role[]> {
    const roles: Role[] = [];

    const [admin, manager, valet] = await Promise.all([
      this.prisma.admin.findUnique({ where: { id } }),
      this.prisma.manager.findUnique({ where: { id } }),
      this.prisma.valet.findUnique({ where: { id } }),
      // Add promises for other role models here
    ]);

    if (admin) {
      roles.push('admin');
    }
    if (manager) {
      roles.push('manager');
    }
    if (valet) {
      roles.push('valet');
    }

    return roles;
  }
}
