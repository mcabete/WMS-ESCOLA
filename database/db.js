import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

// Cria o cliente SQL usando a variável do .env
export const sql = neon(process.env.DATABASE_URL);
