import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';
// Node.js 18+ ya incluye 'fetch'. Si usas una versión anterior,
// necesitarás instalar 'node-fetch' (npm i node-fetch) y descomentar la siguiente línea:
// import fetch from 'node-fetch';

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
    attemptSilentLogin: false, // ¡AÑADIDO! Desactiva el silent login para evitar el conflicto.
    
    session: {
      cookie: {
        domain: 'homehero-back.onrender.com', 
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
        const FRONTEND_URL = 'https://home-hero-front-cc1o.vercel.app';
        const ISSUER_BASE_URL = process.env.AUTH0_ISSUER_BASE_URL;

        let userPayload = session?.user ?? req?.oidc?.user ?? null;

        if (!userPayload && session?.access_token) {
          try {
            const userInfoResponse = await fetch(`${ISSUER_BASE_URL}/userinfo`, {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (userInfoResponse.ok) {
              userPayload = await userInfoResponse.json();
            }
          } catch (err) {
            console.error('Error fetching userinfo:', err);
          }
        }

        if (!userPayload) {
          console.error('afterCallback: No se pudo obtener el perfil del usuario.');
          return res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
        }

        await auth0Service.processAuth0User(userPayload);

        return res.redirect(FRONTEND_URL);

      } catch (error) {
        console.error('Critical error inside afterCallback:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://home-hero-front-cc1o.vercel.app'}/?error=internal_error`);
      }
    },

    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
      connection: 'google-oauth2',
    },
  };
};