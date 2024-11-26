import { ApiProperty } from '@nestjs/swagger';

export class DocumentoDto {
  @ApiProperty()
  rutUsuario: string;

  @ApiProperty()
  nombreOriginal: string;

  @ApiProperty()
  nombreAsignado: string;

  @ApiProperty()
  ruta: string;

  @ApiProperty()
  fechaCarga: Date;
}
