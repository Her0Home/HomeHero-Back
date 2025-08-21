import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { auth } from 'express-openid-connect';
import { getAuth0Config } from './config/auth0.config';
import * as express from 'express';
import { Auth0Service } from './auth0/auth0.service';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: [
      'http://localhost:3000', 
      'https://home-hero-front-cc1o.vercel.app'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const swaggerDocument = new DocumentBuilder()
  .setTitle('HomeHero')
  .setVersion('1.0.0')
  .setDescription('Documentacion de Home Hero')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app,swaggerDocument);
  SwaggerModule.setup('api', app, document);


  
  app.use('/stripe/webhooks', express.raw({ type: 'application/json' }));
  
  const auth0Service = app.get(Auth0Service);
  const auth0Config = getAuth0Config(auth0Service);


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
