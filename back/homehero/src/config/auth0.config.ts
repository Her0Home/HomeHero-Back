import { Auth0Service } from '../auth0/auth0.service';
import { config as dotenvConfig } from 'dotenv';
import { jwtDecode } from 'jwt-decode'; // Importamos la nueva librería

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
        partitioned: true,
      },
    },
    // -----------------------------------------

    routes: {
      callback: '/auth0/callback',
    },
    afterCallback: async (req, res, session) => {
  const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';

  console.log('--- INICIANDO CALLBACK DE AUTH0 ---');
  console.log('Keys disponibles en session:', Object.keys(session));

  try {
    // --- LÓGICA MEJORADA CON LOGS PARA OBTENER EL USUARIO ---
    interface Auth0UserPayload {
      email?: string;
      sub?: string;
      name?: string;
      [key: string]: any;
    }

    let userPayload: Auth0UserPayload | null = null;
    
    if (session.id_token) {
      console.log('ID token encontrado, intentando decodificar');
      try {
        userPayload = jwtDecode<Auth0UserPayload>(session.id_token);
        console.log('Token decodificado exitosamente:', JSON.stringify(userPayload, null, 2));
      } catch (error) {
        console.error('Error al decodificar el token:', error.message);
      }
    } else {
      console.log('No se encontró id_token en la sesión');
      // Como respaldo, mantenemos la lógica anterior
      if (session.user) {
        console.log('Usando session.user como respaldo');
        userPayload = session.user as Auth0UserPayload;
      } else if (session.id_token_claims) {
        console.log('Usando session.id_token_claims como respaldo');
        userPayload = session.id_token_claims as Auth0UserPayload;
      }
    }

    if (!userPayload) {
      console.error('Auth0 afterCallback: No se encontraron datos del usuario en la sesión.');
      const errorParams = new URLSearchParams({ error: 'true', message: 'user_data_not_found' }).toString();
      session.returnTo = `${frontendUrl}?${errorParams}`;
      return session;
    }

    console.log('Datos de usuario encontrados. Email:', userPayload.email, 'Sub:', userPayload.sub);

        // Pasamos el payload encontrado a nuestro servicio
        const { user, token } = await auth0Service.processAuth0User(userPayload);
        
        const successParams = new URLSearchParams();
        successParams.append('token', token);
        successParams.append('needsProfileCompletion', String(!user.dni));
        successParams.append('userName', user.name);
        
        session.returnTo = `${frontendUrl}?${successParams.toString()}`;
        return session;

      } catch (error) {
        // --- LOGS DE ERROR MEJORADOS ---
        console.error('--- ERROR DETECTADO EN afterCallback ---');
        console.error('Mensaje de Error:', error.message);
        console.error('Stack Trace:', error.stack);
        console.error('Objeto de Error Completo:', JSON.stringify(error, null, 2));
        console.error('--- FIN DEL REPORTE DE ERROR ---');
        // ------------------------------------
        
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