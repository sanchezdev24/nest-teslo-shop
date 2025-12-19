import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  @ApiOperation({
    summary: 'Ejecutar seed de la base de datos',
    description: `
      ⚠️ **ADVERTENCIA**: Este endpoint destruye TODOS los datos existentes y recrea la base de datos.
      
      Acciones que realiza:
      - Elimina todos los productos existentes
      - Elimina todos los usuarios existentes
      - Crea usuarios de prueba (test1@google.com, test2@google.com)
      - Crea productos de ejemplo (catálogo Tesla)
      
      **Nota**: Esto invalida todos los tokens JWT existentes.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Seed ejecutado exitosamente',
    schema: {
      type: 'string',
      example: 'SEED EXECUTED',
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
  executeSeed() {
    return this.seedService.runSeed();
  }
}