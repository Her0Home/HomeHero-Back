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
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/'
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
          // Modificamos la sesión existente en lugar de devolver un nuevo objeto
          session.returnTo = `${frontendUrl}?error=true&message=user_data_not_found`;
          return session;
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // Guardamos los datos en la sesión
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
        };
        
        // Construimos la URL con parámetros
        const params = new URLSearchParams({
          token: token,
          needsProfileCompletion: String(!user.dni),
          userName: user.name
        }).toString();
        
        console.log(`Configurando redirección a: ${frontendUrl}?${params}`);
        
        // Configuramos returnTo en la sesión existente
        session.returnTo = `${frontendUrl}?${params}`;
        
        return session;
        
      } catch (error) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        
        session.returnTo = `${frontendUrl}?error=true&message=processing_error`;
        return session;
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};