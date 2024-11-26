import { Controller, Post, Get, Param, UploadedFiles, UseInterceptors, HttpException, HttpStatus,Delete } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';
import { DocumentoDto } from './documento.dto'; // Importa el DTO

@ApiTags('documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}
//====================================================================================================
  // Endpoint para cargar documentos
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
//====================================================================================================
  // Endpoint para obtener documentos de un usuario
  @Get(':rut_usuario')
  @ApiOperation({ summary: 'Obtener documentos de un usuario' })
  @ApiParam({ name: 'rut_usuario', description: 'RUT del usuario', type: String })
  @ApiResponse({ status: 200, description: 'Lista de documentos', type: DocumentoDto, isArray: true })
  async obtenerDocumentos(@Param('rut_usuario') rutUsuario: string): Promise<DocumentoDto[]> {
    const documentos = await this.documentosService.obtenerDocumentos(rutUsuario);
    if (!documentos || documentos.length === 0) {
      throw new HttpException('No se encontraron documentos', HttpStatus.NOT_FOUND);
    }
    return documentos.map(doc => ({
      rutUsuario: doc.rutUsuario,
      nombreOriginal: doc.nombreOriginal,
      nombreAsignado: doc.nombreAsignado,
      ruta: doc.ruta,
      fechaCarga: doc.fechaCarga,
    }));
  }
  //====================================================================================================
  @Delete(':uuid_archivo')
  async eliminarDocumento(@Param('uuid_archivo') uuid_archivo: string) {
    try {
      const result = await this.documentosService.eliminarDocumento(uuid_archivo);
      return { message: result };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
