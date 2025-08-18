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
        secure: true, // Debe ser true en producción con HTTPS
        sameSite: 'None', // 'None' (mayúscula inicial) es el valor canónico
      },
    },

    routes: {
      callback: '/auth0/callback',
      // Es buena práctica definir explícitamente a dónde volver después del logout
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    afterCallback: async (req, res, session) => {
      try {
        let userPayload: any = null;

        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          // Fallback por si el id_token no está presente directamente en la sesión
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          const errorUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
          errorUrl.searchParams.set('error', 'true');
          errorUrl.searchParams.set('message', 'user_data_not_found');
          session.returnTo = errorUrl.toString();
          return session;
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // Guardamos datos importantes en la sesión para que la librería los persista
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
        };
        
     
        const frontendUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        frontendUrl.searchParams.set('token', token);
        frontendUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
        frontendUrl.searchParams.set('userName', user.name || ''); // Aseguramos que no sea null

        console.log(`Estableciendo session.returnTo para la redirección final: ${frontendUrl.toString()}`);
        session.returnTo = frontendUrl.toString();
        

        return session;
        
      } catch (error) {
        console.error('--- ERROR CRÍTICO DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error instanceof Error ? error.message : String(error));
        

        const errorUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        errorUrl.searchParams.set('error', 'true');
        errorUrl.searchParams.set('message', 'internal_processing_error');
        
        session.returnTo = errorUrl.toString();
        return session;
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};