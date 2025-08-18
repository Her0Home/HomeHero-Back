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
  app.use(cookieParser()); // Usamos cookie-parser para leer las cookies

  // --- MIDDLEWARE DE VERIFICACIÓN --- 
  // Este middleware se ejecuta ANTES que el de Auth0 para inspeccionar la petición.
  app.use((req, res, next) => {
    if (req.path.includes('/auth0/callback')) {
      console.log('--- DEBUG: INCOMING REQUEST TO CALLBACK ---');
      console.log('Headers:', JSON.stringify(req.headers, null, 2));
      // Gracias a cookie-parser, req.cookies estará poblado.
      console.log('Cookies:', JSON.stringify(req.cookies, null, 2));
      console.log('--- END DEBUG ---');
    }
    next(); // Pasamos la petición al siguiente middleware (el de Auth0)
  });

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
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}

bootstrap();
