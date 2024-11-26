import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar archivos estáticos
  app.use('/uploads', express.static('uploads'));

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Servicio de Documentos')
    .setDescription('API para la gestión y carga de documentos')
    .setVersion('1.0')
    .addTag('documentos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Iniciar el servidor
  await app.listen(3000);
  console.log(`API ejecutándose en: http://localhost:3000/api`);
}
bootstrap();
