import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './tappaydatabase.db',
  entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/migrations/*{.ts,.js}')],
  synchronize: false, // Set this to false to use migrations
  logging: false,
});

