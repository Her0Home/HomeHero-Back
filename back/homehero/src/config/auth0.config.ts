import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';
// Node.js 18+ ya incluye 'fetch'.

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
        secure: true,
        httpOnly: true,
        sameSite: 'None',
      },
    },

    routes: {
      login: '/login',
      callback: '/callback',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
      // ¡NUEVO! Ruta a la que se redirige después de que el callback se procesa.
      postCallback: '/auth0/redirect-to-front'
    },
    
    afterCallback: async (req, res, session) => {
      try {
        const ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL;
        let userPayload = session?.user ?? req?.oidc?.user ?? null;

        if (!userPayload && session?.access_token) {
          try {
            const userInfoResponse = await fetch(`${ISSUER_BASE_URL}/userinfo`, {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (userInfoResponse.ok) {
              userPayload = await userInfoResponse.json();
            }
          } catch (err) {
            console.error('Error fetching userinfo:', err);
          }
        }

        if (userPayload) {
          // Solo procesamos el usuario en la DB.
          await auth0Service.processAuth0User(userPayload);
        } else {
            console.error('afterCallback: No se pudo obtener el perfil del usuario.');
        }

        // ¡LA SOLUCIÓN CLAVE! Devolvemos la sesión para que el middleware continúe.
        // El middleware guardará la sesión y luego redirigirá a 'postCallback'.
        return session;

      } catch (error) {
        console.error('Critical error inside afterCallback:', error);
        // Aún así, devolvemos la sesión para que el middleware maneje el error.
        return session;
      }
    },

    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
      connection: 'google-oauth2',
    },
  };
};
