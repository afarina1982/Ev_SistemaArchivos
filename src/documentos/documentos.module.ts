import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService]
})
export class DocumentosModule {}
