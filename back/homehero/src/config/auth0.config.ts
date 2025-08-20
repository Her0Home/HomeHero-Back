import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';


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
        proxy: true,
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

        // 1. Intenta obtener el perfil del usuario desde múltiples fuentes, en orden de fiabilidad.
        let userPayload = session?.user ?? req?.oidc?.user ?? null;

        // 2. Si no se encontró el perfil y tenemos un access_token, lo pedimos al endpoint /userinfo.
        //    Este es el método de respaldo más robusto.
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

        // 3. Si después de todos los intentos no tenemos un perfil, la autenticación falló.
        if (!userPayload) {
          console.error('afterCallback: No se pudo obtener el perfil del usuario.');
          return res.redirect(`${FRONTEND_URL}/?error=auth_failed`);
        }

        // 4. Sincronizamos al usuario con nuestra base de datos.
        await auth0Service.processAuth0User(userPayload);

        // 5. Redirigimos al frontend a una URL limpia. La sesión ya está en la cookie.
        return res.redirect(`${FRONTEND_URL}/profile`);

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