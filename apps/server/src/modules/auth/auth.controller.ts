import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, PublicUser } from './auth.service.js';

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export interface CredentialsDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: CredentialsDto): Promise<AuthResponse> {
    return this.auth.register(body.username, body.password);
  }

  @Post('login')
  login(@Body() body: CredentialsDto): Promise<AuthResponse> {
    return this.auth.login(body.username, body.password);
  }
}
