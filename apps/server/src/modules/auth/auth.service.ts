import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(username: string, password: string): Promise<{ token: string; user: PublicUser }> {
    const exists = await this.users.findOne({ where: { username } });
    if (exists) throw new ConflictException('username already taken');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.save(this.users.create({ username, passwordHash }));
    return this.issue(user);
  }

  async login(username: string, password: string): Promise<{ token: string; user: PublicUser }> {
    const user = await this.users.findOne({ where: { username } });
    if (!user) throw new UnauthorizedException('invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid credentials');
    return this.issue(user);
  }

  private issue(user: User): { token: string; user: PublicUser } {
    const token = this.jwt.sign({ sub: user.id, username: user.username, role: user.role });
    return { token, user: { id: user.id, username: user.username, role: user.role } };
  }
}

export interface PublicUser {
  id: string;
  username: string;
  role: 'user' | 'admin';
}
