/*
 * ----------------------------------------------------------------
 * ARCHIVO 1: auth0.config.ts (VERSIÓN FINAL MEJORADA)
 * ----------------------------------------------------------------
 * Combinamos la configuración de cookies con una búsqueda de usuario
 * más robusta para máxima compatibilidad.
 */

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
    
    // --- CONFIGURACIÓN CLAVE DE LA SESIÓN ---
    session: {
      cookie: {
        secure: true,
        sameSite: 'None',
        domain: 'homehero-back.onrender.com',
      },
    },
    // -----------------------------------------

    routes: {
      callback: '/auth0/callback',
    },
    afterCallback: async (req, res, session) => {
      const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';

      try {
        // --- LÓGICA DE BÚSQUEDA DE USUARIO MEJORADA ---
        // Buscamos los datos del usuario en session.user (versiones antiguas)
        // o en session.id_token_claims (versiones más recientes).
        const userPayload = session.user || session.id_token_claims;

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en session.user ni en session.id_token_claims.');
          const errorParams = new URLSearchParams({ error: 'true', message: 'user_data_not_found' }).toString();
          session.returnTo = `${frontendUrl}?${errorParams}`;
          return session;
        }

        // Pasamos el payload encontrado a nuestro servicio
        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        const successParams = new URLSearchParams();
        successParams.append('token', token);
        successParams.append('needsProfileCompletion', String(!user.dni));
        successParams.append('userName', user.name);
        
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