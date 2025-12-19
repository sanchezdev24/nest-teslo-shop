import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiProduces,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';

import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  @ApiOperation({
    summary: 'Obtener imagen de producto',
    description:
      'Retorna la imagen de un producto según su nombre de archivo.',
  })
  @ApiParam({
    name: 'imageName',
    description: 'Nombre del archivo de imagen',
    example: '1740176-00-A_0_2000.jpg',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/gif')
  @ApiResponse({
    status: 200,
    description: 'Imagen del producto',
    content: {
      'image/jpeg': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/png': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
      'image/gif': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Imagen no encontrada',
  })
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);
    res.sendFile(path);
  }

  @Post('product')
  @ApiOperation({
    summary: 'Subir imagen de producto',
    description:
      'Sube una imagen para un producto. Solo se permiten archivos jpg, jpeg, png y gif.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen a subir',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpg, jpeg, png, gif)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        secureUrl: {
          type: 'string',
          example: 'http://localhost:3000/api/files/product/abc123.jpg',
          description: 'URL completa para acceder a la imagen',
        },
        fileName: {
          type: 'string',
          example: 'abc123.jpg',
          description: 'Nombre del archivo guardado',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - El archivo no es una imagen válida',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl, fileName: file.filename };
  }
}