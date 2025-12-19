import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from './../common/dtos/pagination.dto';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear un nuevo producto',
    description:
      'Crea un nuevo producto en la base de datos. Requiere autenticación.',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Datos inválidos o título duplicado',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Token relacionado',
  })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los productos',
    description:
      'Retorna una lista paginada de productos con opción de filtrar por género.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos por página',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de productos a saltar',
    example: 0,
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: ['men', 'women', 'unisex', 'kid'],
    description: 'Filtrar por género del producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 100 },
        pages: { type: 'number', example: 10 },
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/Product' },
        },
      },
    },
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  @ApiOperation({
    summary: 'Buscar un producto',
    description:
      'Busca un producto por ID (UUID), título o slug.',
  })
  @ApiParam({
    name: 'term',
    description: 'Término de búsqueda: UUID, título o slug del producto',
    example: 'mens_chill_crew_neck_sweatshirt',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Producto no encontrado',
  })
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar un producto',
    description:
      'Actualiza un producto existente. Requiere rol de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del producto a actualizar',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Se requiere rol de admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Producto no encontrado',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productsService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar un producto',
    description:
      'Elimina un producto de la base de datos. Requiere rol de administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del producto a eliminar',
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Se requiere rol de admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Producto no encontrado',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}