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
    attemptSilentLogin: false, // Previene conflictos de headers
    
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
          // Solo sincronizamos al usuario con nuestra base de datos.
          await auth0Service.processAuth0User(userPayload);
        }

        // Devolvemos la sesión para que el middleware continúe su flujo
        // (crear cookie y redirigir a la baseURL, es decir, '/').
        return session;

      } catch (error) {
        console.error('Critical error inside afterCallback:', error);
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