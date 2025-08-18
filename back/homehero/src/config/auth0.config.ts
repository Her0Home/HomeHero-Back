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
      absoluteDuration: 60 * 60 * 24, // 1 día en segundos
    },

    routes: {
      callback: '/auth0/callback',
      postLogoutRedirect: 'https://home-hero-front-cc1o.vercel.app/',
    },
    
    afterCallback: async (req, res, session) => {
      try {
        let userPayload: any = null;
        if (session.id_token) {
          userPayload = jwtDecode(session.id_token);
        } else {
          userPayload = session.user || session.id_token_claims;
        }

        if (!userPayload) {
          const errorUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
          errorUrl.searchParams.set('error', 'true');
          errorUrl.searchParams.set('message', 'user_data_not_found');
          res.redirect(errorUrl.toString());
          return false as any; 
        } 

        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        const frontendUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        frontendUrl.searchParams.set('token', token);
        frontendUrl.searchParams.set('needsProfileCompletion', String(!user.dni));
        frontendUrl.searchParams.set('userName', user.name || '');
        
        
        res.redirect(frontendUrl.toString());
        
   
        return false as any;
        
      } catch (error) {
       
        const errorUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
        errorUrl.searchParams.set('error', 'true');
        errorUrl.searchParams.set('message', 'internal_processing_error');
        res.redirect(errorUrl.toString());
        return false as any; 
      }
    },
    
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
  };
};