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
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    afterCallback: async (req, res, session) => {
      const frontendBaseUrl = 'https://home-hero-front-cc1o.vercel.app/';
      
      try {
        let userPayload: any = null;

        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          const errorUrl = new URL(frontendBaseUrl);
          errorUrl.searchParams.set('error', 'true');
          errorUrl.searchParams.set('message', 'user_data_not_found');
          // Devolvemos la URL de error directamente para forzar la redirección
          return errorUrl.toString();
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // --- Flujo de Redirección Forzada ---

        // 1. Construimos la URL de redirección final
        const frontendUrl = new URL(frontendBaseUrl);
        frontendUrl.searchParams.set('token', token);
        frontendUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
        frontendUrl.searchParams.set('userName', user.name || '');
        
        console.log(`Forzando redirección final a: ${frontendUrl.toString()}`);
        
        // 2. Devolvemos la URL como un string. Esto anula cualquier otra
        //    lógica de redirección de la librería y rompe el bucle.
        return frontendUrl.toString();
        
      } catch (error) {
        console.error('--- ERROR CRÍTICO DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error instanceof Error ? error.message : String(error));
        
        const errorUrl = new URL(frontendBaseUrl);
        errorUrl.searchParams.set('error', 'true');
        errorUrl.searchParams.set('message', 'internal_processing_error');
        
        // Devolvemos la URL de error directamente
        return errorUrl.toString();
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};