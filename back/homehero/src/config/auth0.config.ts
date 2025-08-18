

import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';
import { jwtDecode } from 'jwt-decode';

dotenvConfig({ path: '.env.development' });

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
        sameSite: 'None',
      },
    },

    routes: {
      callback: '/auth0/callback',
    },
    afterCallback: async (req, res, session) => {
      const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';

      try {
        let userPayload = null;
        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          const errorParams = new URLSearchParams({ error: 'true', message: 'user_data_not_found' }).toString();
          return res.redirect(`${frontendUrl}?${errorParams}`);
        }

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        const successParams = new URLSearchParams();
        successParams.append('token', token);
        successParams.append('needsProfileCompletion', String(!user.dni));
        successParams.append('userName', user.name);
        
        // Redirección directa y final.
        return res.redirect(`${frontendUrl}?${successParams.toString()}`);

      } catch (error) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        console.error('Stack Trace:', error.stack);
        
        const errorParams = new URLSearchParams({ error: 'true', message: 'processing_error' }).toString();
        // Redirección directa y final en caso de error.
        return res.redirect(`${frontendUrl}?${errorParams}`);
      }
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};