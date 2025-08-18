

import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';

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
    routes: {
      callback: '/auth0/callback',
      
      postLoginRedirect: '/auth0/redirect',
    },
    afterCallback: async (req, res, session) => {
      try {
       
        if (!session.user) {
          console.error('Auth0 afterCallback: El objeto session.user no fue encontrado.');
         
          session.app_metadata = { error: 'user_session_not_found' };
          return session;
        }

        
        const { user, token } = await auth0Service.processAuth0User(session.user);
        
      
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
          needs_profile_completion: !user.dni,
          user_name: user.name,
        };
        

        return session;

      } catch (error) {
        console.error('Error en el hook afterCallback:', error);
        session.app_metadata = { error: 'processing_error' };
        return session;
      }
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};