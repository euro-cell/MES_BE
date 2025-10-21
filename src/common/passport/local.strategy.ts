import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../modules/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'employeeNumber' });
  }

  async validate(employeeNumber: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(employeeNumber, password);
    if (!user) {
      throw new UnauthorizedException('사번 또는 비밀번호가 올바르지 않습니다.');
    }
    return user;
  }
}
