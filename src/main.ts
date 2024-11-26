import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Convertir la aplicación a NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilitar archivos estáticos desde "Sistema de Archivos"
  app.useStaticAssets(join(__dirname, '..', 'Sistema de Archivos'), {
    prefix: '/archivos', // Prefijo para acceder a los archivos en las URLs públicas
  });

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
  console.log(`Archivos accesibles en: http://localhost:3000/archivos`);
}
bootstrap();
