import { Controller, Post, UploadedFiles, Param, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentosService } from './documentos.service';

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post(':rut_usuario')
  @UseInterceptors(FilesInterceptor('archivos'))
  @ApiOperation({ summary: 'Cargar documentos para un usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        archivos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'rut_usuario', description: 'RUT del usuario', type: String })
  @ApiResponse({ status: 201, description: 'Archivos subidos exitosamente.' })
  @ApiResponse({ status: 400, description: 'No se han enviado archivos.' })
  async cargarDocumentos(
    @Param('rut_usuario') rutUsuario: string,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    if (!archivos || archivos.length === 0) {
      throw new HttpException('No se han enviado archivos', HttpStatus.BAD_REQUEST);
    }

    const resultados = await this.documentosService.guardarArchivos(rutUsuario, archivos);
    return {
      mensaje: 'Archivos subidos exitosamente',
      data: resultados,
    };
  }
}
