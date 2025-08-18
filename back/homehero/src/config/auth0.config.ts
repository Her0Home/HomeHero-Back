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
      // Removemos postLoginUrl que causa el error
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
          // Podemos manejar el error aquí si es necesario
          return session;
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        // Guardamos los datos en la sesión
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
        };
        
        // Importante: En lugar de configurar session.returnTo, vamos a redirigir directamente
        // usando res.redirect() aquí
        
        const frontendUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        frontendUrl.searchParams.set('token', token);
        frontendUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
        frontendUrl.searchParams.set('userName', user.name);
        
        console.log(`Redirigiendo directamente a: ${frontendUrl.toString()}`);
        res.redirect(frontendUrl.toString());
        
        // Retornamos false para evitar procesamiento adicional
        return false;
        
      } catch (error) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        
        // En caso de error, también redirigir al frontend con un mensaje de error
        const errorUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        errorUrl.searchParams.set('error', 'true');
        errorUrl.searchParams.set('message', 'processing_error');
        
        res.redirect(errorUrl.toString());
        return false;
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};