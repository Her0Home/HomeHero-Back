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
      // Añadimos una duración absoluta a la sesión. A veces, ser más explícito
      // con la configuración de la sesión ayuda a que se comporte como se espera.
      absoluteDuration: 60 * 60 * 24, // 1 día en segundos
    },

    routes: {
      callback: '/auth0/callback',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    // Esta función ahora cumple con la firma de tipos de la librería,
    // devolviendo siempre un objeto `Session` o una promesa que resuelve a uno.
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
          session.returnTo = errorUrl.toString();
          return session;
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // --- Flujo de Redirección Correcto (según la librería) ---

        // 1. Construimos la URL de redirección final
        const frontendUrl = new URL(frontendBaseUrl);
        frontendUrl.searchParams.set('token', token);
        frontendUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
        frontendUrl.searchParams.set('userName', user.name || '');
        
        console.log(`Estableciendo session.returnTo para la redirección final: ${frontendUrl.toString()}`);
        
        // 2. Asignamos la URL a `session.returnTo`. Esta es la forma oficial
        //    de decirle a la librería a dónde redirigir después del callback.
        session.returnTo = frontendUrl.toString();
        
        // 3. Devolvemos el objeto `session` para que la librería continúe su flujo.
        return session;
        
      } catch (error) {
        console.error('--- ERROR CRÍTICO DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error instanceof Error ? error.message : String(error));
        
        const errorUrl = new URL(frontendBaseUrl);
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