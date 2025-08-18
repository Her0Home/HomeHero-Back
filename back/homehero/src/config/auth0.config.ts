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
      // Configuramos la ruta después de la autenticación a nuestro controlador personalizado
      postLoginUrl: '/auth0/callback-redirect',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/'
    },
    
    afterCallback: async (req, res, session) => {
      try {
        let userPayload = null;
        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          return session;
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // Guardamos los datos en la sesión para que estén disponibles en el controlador
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
          needs_profile_completion: !user.dni
        };
        
        return session;
      } catch (error) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        return session;
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};