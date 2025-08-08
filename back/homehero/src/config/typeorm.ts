import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';

dotenvConfig({ path: '.env.development' });
const config = {
  type: 'postgres',
  url: process.env.DB_URL,
  autoLoadEntities: true,
  synchronize: true,
  dropSchema: true,
<<<<<<< HEAD
  logging: false,
=======
  // logging: true,
>>>>>>> a9fbb6f1ed94b0afd88d59d7587bbb471c454f03
  ssl: {
    rejectUnauthorized: false,
  },
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
