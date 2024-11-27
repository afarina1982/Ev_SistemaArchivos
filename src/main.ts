import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { DocumentosModule } from './documentos/documentos.module';

async function bootstrap() {
  // Convertir la aplicación a NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar archivos estáticos desde "Sistema de Archivos"
 app.useStaticAssets(join(__dirname, '..', 'Sistema de Archivos'), {
  prefix: '/archivos',
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream'; // Tipo por defecto
    res.setHeader('Content-Type', mimeType);
  },
});

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Servicio de Documentos')
    .setDescription('API para la gestión y carga de documentos')
    .setVersion('1.0')
    .addTag('Gestion de Documentos')
    .build();
  const document = SwaggerModule.createDocument(app, config,{
    include:[DocumentosModule],
  });
  
  SwaggerModule.setup('api', app, document);

  // Iniciar el servidor
  await app.listen(process.env.PORT || 3000);
  //console.log(`API ejecutándose en: http://localhost:3000/api`);
  //console.log(`Archivos accesibles en: http://localhost:3000/archivos`);
}
bootstrap();
