import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect';
import { getAuth0Config } from './config/auth0.config';
import * as express from 'express';
import { Auth0Service } from './auth0/auth0.service';
import cookieParser from 'cookie-parser'; // Importamos cookie-parser


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(cookieParser());

  const swaggerDocument = new DocumentBuilder()
  .setTitle('HomeHero')
  .setVersion('1.0.0')
  .setDescription('Documentacion de Home Hero')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app,swaggerDocument);
  SwaggerModule.setup('api', app, document);

  
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
  
  const auth0Service = app.get(Auth0Service);
  const auth0Config = getAuth0Config(auth0Service);

  
  app.use(auth(auth0Config));

  app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }));

    app.use((err, req, res, next) => {
    if (res.headersSent) {
      return;
    }
    res.status(500).send('Ocurrió un error interno en el servidor.');
  });
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}

bootstrap();
