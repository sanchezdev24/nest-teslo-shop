import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Título del producto (debe ser único)',
    example: "Men's Chill Crew Neck Sweatshirt",
    minLength: 1,
    uniqueItems: true,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    description: 'Precio del producto',
    example: 75,
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example:
      'Introducing the Tesla Chill Collection. The Men\'s Chill Crew Neck Sweatshirt has a premium, heavyweight exterior and soft fleece interior.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Slug del producto para URLs amigables (se genera automáticamente si no se proporciona)',
    example: 'mens_chill_crew_neck_sweatshirt',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Cantidad en stock',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

  @ApiProperty({
    description: 'Tallas disponibles del producto',
    example: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    type: 'string',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];

  @ApiProperty({
    description: 'Género al que está dirigido el producto',
    example: 'men',
    enum: ['men', 'women', 'kid', 'unisex'],
  })
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender: string;

  @ApiPropertyOptional({
    description: 'Etiquetas para categorizar el producto',
    example: ['sweatshirt', 'chill collection'],
    type: 'string',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'URLs de las imágenes del producto',
    example: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
    type: 'string',
    isArray: true,
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}