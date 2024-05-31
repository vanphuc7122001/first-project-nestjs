import * as compression from 'compression';
import helmet from 'helmet';
import { CONFIG_VAR, DEFAULT_PORT } from '@config/index';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function getApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();
  app.use(compression());
  app.use(helmet());

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  return app;
}

async function seedData(app: INestApplication) {
  // Create default admin
  // const authService = app.get(AuthService);
  // await authService.createDefaultAdmin();
}

// function setupSwagger(nestApp: INestApplication) {
//   if (process.env.NODE_ENV !== Environment.PRODUCTION) {
//     const config = new DocumentBuilder()
//       .setTitle('Only Tips API')
//       .setDescription('API specification for Only Tips')
//       .setVersion('1.0')
//       .addBearerAuth()
//       .build();
//     const document = SwaggerModule.createDocument(nestApp, config);
//     SwaggerModule.setup('docs', nestApp, document, {
//       swaggerOptions: {
//         tagsSorter: 'alpha',
//         displayOperationId: true,
//         displayRequestDuration: true,
//         filter: true,
//       },
//     });
//   }
// }

async function bootstrapServer() {
  const app = await getApp();

  // Seed data
  await seedData(app);

  // Setup Swagger
  // setupSwagger(app);

  // Start server
  const configService = app.get(ConfigService);
  const port = configService.get(CONFIG_VAR.PORT, DEFAULT_PORT);

  await app.listen(port, () => {
    const logger = new Logger(AppModule.name);
    logger.log(`Application is running on port ${port}`);
  });
}

bootstrapServer();
