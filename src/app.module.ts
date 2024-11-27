import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentosModule } from './documentos/documentos.module';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose'; // Importar MongooseModule

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Ruta temporal para almacenar archivos
    }),
    MongooseModule.forRoot(
     // `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`),
      
      `mongodb://mongo:clave123@localhost:27017/ArchivosDB`), //para usar de forma local
      DocumentosModule, // Módulo de documentos
  ],
  controllers: [AppController],
  providers: [AppService],

})
export class AppModule { }
