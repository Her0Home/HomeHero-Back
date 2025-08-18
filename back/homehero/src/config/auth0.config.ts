import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env.development' });

export const Auth0Config = (auth0Service: Auth0Service) => {
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
    },
   
    afterCallback: async (req, res, session) => {
      try {
       
        const { user, token } = await auth0Service.processAuth0User(session.user);
        
       
        session.app_metadata = {
          jwt_token: token,
          user_id: user.id,
          user_role: user.role,
        };
        
        
        const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';
        const params = new URLSearchParams();
        params.append('token', token);
        params.append('needsProfileCompletion', String(!user.dni));
        params.append('userName', user.name);

        res.redirect(`${frontendUrl}?${params.toString()}`);
        return session;

      } catch (error) {
        console.error('Error en el hook afterCallback:', error);
        res.redirect('https://home-hero-front-cc1o.vercel.app/login-error');
        return session;
      }
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};