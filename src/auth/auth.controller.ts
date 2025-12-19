import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';

import { IncomingHttpHeaders } from 'http';

import { AuthService } from './auth.service';
import { RawHeaders, GetUser, Auth } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema con email, contraseña y nombre completo. Retorna el usuario creado junto con un token JWT.',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del usuario a registrar',
    examples: {
      ejemplo1: {
        summary: 'Usuario básico',
        value: {
          email: 'usuario@example.com',
          password: 'Password123',
          fullName: 'Juan Pérez',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-del-usuario' },
            email: { type: 'string', example: 'usuario@example.com' },
            fullName: { type: 'string', example: 'Juan Pérez' },
            isActive: { type: 'boolean', example: true },
            roles: { type: 'array', items: { type: 'string' }, example: ['user'] },
          },
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Datos inválidos o email ya existe',
  })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario existente con email y contraseña. Retorna los datos del usuario y un token JWT.',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'Credenciales del usuario',
    examples: {
      ejemplo1: {
        summary: 'Login básico',
        value: {
          email: 'test1@google.com',
          password: 'Abc123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-del-usuario' },
            email: { type: 'string', example: 'test1@google.com' },
            fullName: { type: 'string', example: 'Test One' },
            isActive: { type: 'boolean', example: true },
            roles: { type: 'array', items: { type: 'string' }, example: ['admin'] },
          },
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Credenciales inválidas',
  })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verificar estado de autenticación',
    description:
      'Verifica si el token JWT es válido y retorna un nuevo token junto con los datos del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido - Retorna nuevo token',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-del-usuario' },
            email: { type: 'string', example: 'test1@google.com' },
            fullName: { type: 'string', example: 'Test One' },
            isActive: { type: 'boolean', example: true },
            roles: { type: 'array', items: { type: 'string' }, example: ['admin'] },
          },
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token inválido o expirado',
  })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  /* @Get('private')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ruta privada de prueba',
    description:
      'Endpoint de prueba que requiere autenticación. Retorna información del usuario y headers de la petición.',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceso permitido',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Hola Mundo Private' },
        user: { type: 'object' },
        userEmail: { type: 'string', example: 'test1@google.com' },
        rawHeaders: { type: 'array', items: { type: 'string' } },
        headers: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userEmail,
      rawHeaders,
      headers,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ruta privada con roles (super-user, admin)',
    description:
      'Endpoint que requiere autenticación y rol de super-user o admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceso permitido',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - El usuario no tiene los roles requeridos',
  })
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Ruta privada solo para admin',
    description: 'Endpoint que requiere autenticación y rol de admin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Acceso permitido',
    schema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean', example: true },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Token no proporcionado o inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - El usuario no tiene rol de admin',
  })
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  } */
}