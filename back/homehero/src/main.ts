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

  app.use((req, res, next) => {
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    console.log(`--- REDIRECT interceptado a: ${url} ---`);
    return originalRedirect.call(this, url);
  };
  next();
});



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

  app.getHttpAdapter().getInstance().get('/', (req, res) => {
    console.log('--- HANDLER DE RAÍZ INVOCADO ---');
    
    if (!req.oidc || !req.oidc.session) {
      console.log('ERROR: El objeto req.oidc.session no existe.');
      return res.send('Hello World! Session object not found.');
    }

    console.log('Contenido completo de la sesión en la raíz:', JSON.stringify(req.oidc.session));

    if (req.oidc.session.isAuthenticatedAndProcessed) {
      console.log('ÉXITO: Se encontró la bandera isAuthenticatedAndProcessed. Procediendo a la redirección final.');
      
      const finalUrl = req.oidc.session.finalRedirectUrl;
      
      delete req.oidc.session.isAuthenticatedAndProcessed;
      delete req.oidc.session.finalRedirectUrl;
      
      if (finalUrl) {
        console.log(`Redirigiendo a la URL final: ${finalUrl}`);
        return res.redirect(finalUrl);
      } else {
        console.log('ERROR: La bandera estaba presente, pero finalRedirectUrl no. Algo salió mal.');
        return res.send('Error: Final URL not found in session.');
      }
    }
    
    console.log('INFO: No se encontró la bandera de sesión. Es una visita normal a la raíz.');
    return res.send('Hello World! Welcome to HomeHero Backend.');
  });
  app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }));
  await app.listen(process.env.PORT ?? 3000);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}

bootstrap();
