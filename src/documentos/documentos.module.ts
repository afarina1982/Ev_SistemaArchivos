import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { Documento, DocumentoSchema } from './documento.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Documento', schema: DocumentoSchema }]), // Registrar el modelo Documento
  ],
  providers: [DocumentosService],
  controllers: [DocumentosController],
})
export class DocumentosModule {}
