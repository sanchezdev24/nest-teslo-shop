import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min, IsIn } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Número de productos a retornar por página',
    example: 10,
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Número de productos a saltar (para paginación)',
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Filtrar productos por género',
    example: 'men',
    enum: ['men', 'women', 'unisex', 'kid'],
  })
  @IsOptional()
  @IsIn(['men', 'women', 'unisex', 'kid'])
  gender?: 'men' | 'women' | 'unisex' | 'kid';
}