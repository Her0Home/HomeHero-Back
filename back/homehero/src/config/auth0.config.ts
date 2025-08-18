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
      // La propiedad postLoginRedirect ha sido eliminada.
    },
    afterCallback: async (req, res, session) => {
      const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';

      try {
        if (!session.user) {
          console.error('Auth0 afterCallback: El objeto session.user no fue encontrado.');
          const errorParams = new URLSearchParams({ error: 'true', message: 'user_session_not_found' }).toString();
          // Le decimos a la librería a dónde redirigir en caso de error.
          session.returnTo = `${frontendUrl}?${errorParams}`;
          return session;
        }

        // 1. Procesamos el usuario y generamos el token
        const { user, token } = await auth0Service.processAuth0User(session.user);
        
        // 2. Construimos la URL de éxito final
        const successParams = new URLSearchParams();
        successParams.append('token', token);
        successParams.append('needsProfileCompletion', String(!user.dni));
        successParams.append('userName', user.name);
        
        // 3. Le decimos a la librería a dónde redirigir al usuario.
        session.returnTo = `${frontendUrl}?${successParams.toString()}`;
        return session;

      } catch (error) {
        console.error('Error en el hook afterCallback:', error);
        const errorParams = new URLSearchParams({ error: 'true', message: 'processing_error' }).toString();
        session.returnTo = `${frontendUrl}?${errorParams}`;
        return session;
      }
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};
