import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';

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
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: true,
        sameSite: 'lax',
      },
    },

    routes: {

      login: '/login',

      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    afterCallback: async (req, res, session) => {
      try {
        const userPayload = session.user;

        if (!userPayload) {
          return res.redirect('https://home-hero-front-cc1o.vercel.app/?error=auth_failed');
        } 

        
        await auth0Service.processAuth0User(userPayload);
        
       
        res.redirect('https://home-hero-front-cc1o.vercel.app/profile'); // O a la página que necesiten
        
        return session;
        
      } catch (error) {
        console.error("Error en afterCallback:", error);
        return res.redirect('https://home-hero-front-cc1o.vercel.app/?error=internal_error');
      }
    },

    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
      connection: 'google-oauth2', // Redirige directamente a Google
    },
  };
};