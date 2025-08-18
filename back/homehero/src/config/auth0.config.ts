import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';
const jwtDecode = require('jwt-decode');


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
        sameSite: 'none', // usar 'none' minúscula
      },
    },

    routes: {
      callback: '/auth0/callback',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
  
    afterCallback: async (req, res, session) => {
      const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';
      const payload = jwtDecode(session.id_token);

      try {
        let userPayload: any = null;

        if (session?.id_token) {
          // jwtDecode puede lanzar si no es un JWT válido; envolver en try/catch si fuera necesario
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session?.user ?? session?.id_token_claims;
        }

        if (!userPayload) {
          console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
          const errorParams = new URLSearchParams({ error: 'true', message: 'user_data_not_found' }).toString();
          // Devuelve la URL en lugar de hacer res.redirect
          return `${frontendUrl}?${errorParams}`;
        }

        const { user, token } = await auth0Service.processAuth0User(userPayload);

        // Opcional: si quieres persistir algo en la sesión, puedes modificar `session` aquí
        // session.app_metadata = { jwt_token: token, user_id: user.id, user_role: user.role };

        const params = new URLSearchParams({
          token: token,
          needsProfileCompletion: String(!user.dni),
          userName: user.name ?? '',
        }).toString();

        console.log(`Configurando redirección a: ${frontendUrl}?${params}`);
        // DEVUELVE la URL (no usar res.redirect)
        return `${frontendUrl}?${params}`;

      } catch (error: any) {
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error?.message ?? error);
        const errorParams = new URLSearchParams({ error: 'true', message: 'processing_error' }).toString();
        return `${frontendUrl}?${errorParams}`;
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
    
  };
  
};
