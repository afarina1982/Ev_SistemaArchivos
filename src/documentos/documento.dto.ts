import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class DocumentoDto {
  @IsString()
  @Matches(/^[0-9]{2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/, {
    message: 'El RUT no tiene el formato válido. Debe ser xx.xxx.xxx-k, donde el RUT tiene 8 dígitos seguidos de guion y "k" o un número.',
  })
  @ApiProperty({ type: 'string', description: 'Rut del Usuario', example: '12345678-9' })
  rutUsuario: string;
  
  @IsString()
  @ApiProperty({ type: 'string', description: 'Nombre Original del Archivo', example: 'archivo.pdf' })
  nombreOriginal: string;
  
  @IsString()
  @IsUUID()
  @ApiProperty({ type: 'string', description: 'Nombre Asignado al Archivo de tipo UUID v4', example: '123e4567-e89b-12d3-a456-426655440000' })
  nombreAsignado: string;
  
  @IsString()
  @ApiProperty({ type: 'string', description: 'Ruta del Archivo', example: '/uploads/12345678-9/12345678-9-123e4567-e89b-12d3-a456-426655440000.pdf' })
  ruta: string;
  
  @IsString()
  @ApiProperty({ type: Date, description: 'Fecha de Carga del Archivo', example: '2021-09-01T00:00' })
  fechaCarga: Date;
}
