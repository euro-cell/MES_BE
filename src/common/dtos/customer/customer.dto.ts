import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

class CustomerBaseDto {
  @ApiProperty({ description: '회사명' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '약어', maxLength: 2 })
  @IsString()
  @Length(2, 2)
  shortName: string;

  @ApiPropertyOptional({ description: '비고' })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CreateCustomerDto extends CustomerBaseDto {}

export class UpdateCustomerDto extends PartialType(CustomerBaseDto) {}
