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
    },
    afterCallback: async (req, res, session) => {
      const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';
      const finalRedirectUrl = new URL(frontendUrl);

      try {
        let userPayload = null;
        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          finalRedirectUrl.searchParams.set('error', 'true');
          finalRedirectUrl.searchParams.set('message', 'user_data_not_found');
        } else {
            const { user, token } = await auth0Service.processAuth0User(userPayload);
            // Guardamos los datos en la sesión para que el endpoint /profile los pueda leer
            (session as any).app_metadata = {
                jwt_token: token,
                user_id: user.id,
                user_role: user.role,
            };
            finalRedirectUrl.searchParams.set('token', token);
            finalRedirectUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
            finalRedirectUrl.searchParams.set('userName', user.name);
        }
      } catch (error) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        finalRedirectUrl.searchParams.set('error', 'true');
        finalRedirectUrl.searchParams.set('message', 'processing_error');
      }

      // Guardamos la URL final en la sesión y redirigimos a nuestro propio endpoint.
      if (session) {
        (session as any).finalRedirectUrl = finalRedirectUrl.toString();
      }
      session.returnTo = '/auth0/finish';
      return session;
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};
