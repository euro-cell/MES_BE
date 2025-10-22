import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { UserRole } from '../enums/user.enum';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ example: '2501', description: '사번 (로그인 아이디)' })
  @IsNotEmpty()
  @IsString()
  employeeNumber: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ example: '1234', description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '전지사업팀', description: '부서' })
  department: string;

  @ApiProperty({ enum: UserRole, default: UserRole.STAFF })
  role: UserRole;
}

export class LoginDto extends PickType(UserDto, ['employeeNumber', 'password'] as const) {}

export class RegisterDto extends OmitType(UserDto, ['role'] as const) {}
