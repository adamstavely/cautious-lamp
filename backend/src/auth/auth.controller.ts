import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, LoginResult, RequestInfo, toMe } from './auth.service';
import { ChangePasswordDto, LoginDto, strictBody } from './auth.dto';
import { AuthPrincipal, Principal, Public, requireUser } from './principal';
import { Me } from './user.types';

function requestInfo(req: Request): RequestInfo {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

/** Sign-in for people (docs/AUTH.md) */
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body(strictBody()) body: LoginDto, @Req() req: Request): Promise<LoginResult> {
    return this.auth.login(body.email, body.password, requestInfo(req));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Principal() principal: AuthPrincipal, @Req() req: Request): Promise<void> {
    await this.auth.logout(requireUser(principal), requestInfo(req));
  }

  @Get('me')
  me(@Principal() principal: AuthPrincipal): Me {
    return toMe(principal);
  }

  @Post('change-password')
  @HttpCode(204)
  async changePassword(
    @Principal() principal: AuthPrincipal,
    @Body(strictBody()) body: ChangePasswordDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.auth.changePassword(requireUser(principal), body.currentPassword, body.newPassword, requestInfo(req));
  }
}
