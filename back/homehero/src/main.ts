import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect';
import {config as auth0Config} from './config/auth0.config';
import * as express from 'express';
import session from 'express-session';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerDocument = new DocumentBuilder()
  .setTitle('HomeHero')
  .setVersion('1.0.0')
  .setDescription('Documentacion de Home Hero')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app,swaggerDocument);
  SwaggerModule.setup('api', app, document);

  
app.use(
    session({
      secret: process.env.SESSION_SECRET || 'default_session_secret', 
      resave: false,
      saveUninitialized: false,
    }),
  );

  
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
  app.use(auth(auth0Config));
  app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }));
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}

bootstrap();
