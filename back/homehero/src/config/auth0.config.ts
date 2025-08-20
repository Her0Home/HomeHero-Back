import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';

// Cuidado con la ruta del .env en producción, Render usa variables de entorno directamente.
dotenvConfig({ path: '.development.env' });

export const getAuth0Config = (auth0Service: Auth0Service) => {
  return {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    
    session: {
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: 'None',
        proxy: true, 
      },
    },

    routes: {
      login: '/login',
      callback: '/callback',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    afterCallback: async (req, res, session) => {
      // ---- INICIO DE CÓDIGO DE DIAGNÓSTICO ----
      console.log('--- Auth0: afterCallback triggered ---');
      console.log('Session object received:', JSON.stringify(session, null, 2));
      // ---- FIN DE CÓDIGO DE DIAGNÓSTICO ----

      try {
        const userPayload = session.user;

        if (!userPayload) {
          // Si llegamos aquí, el log anterior nos dirá por qué la sesión está vacía.
          console.error('Error: session.user is missing. Redirecting with auth_failed.');
          return res.redirect('https://home-hero-front-cc1o.vercel.app/?error=auth_failed');
        } 

        console.log('session.user found. Processing user in database...');
        await auth0Service.processAuth0User(userPayload);
        
        console.log('User processed successfully. Redirecting to frontend profile.');
        res.redirect('https://home-hero-front-cc1o.vercel.app/profile');
        
        return session;
        
      } catch (error) {
        console.error("Critical error inside afterCallback:", error);
        return res.redirect('https://home-hero-front-cc1o.vercel.app/?error=internal_error');
      }
    },

    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
      connection: 'google-oauth2',
    },
  };
};