import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: '2501', description: '사번 (로그인 아이디)' })
  @IsNotEmpty()
  @IsString()
  employeeNumber: string;

  @ApiProperty({ example: '1234', description: '비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
