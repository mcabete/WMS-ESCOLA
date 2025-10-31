import { sql } from './db.js';

console.log("🧹 Resetando tabelas...");

await sql`DROP TABLE IF EXISTS movements;`;
await sql`DROP TABLE IF EXISTS products;`;
await sql`DROP TABLE IF EXISTS categories;`;

console.log("📦 Criando tabelas...");

await sql`
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  weight DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0, -- 🔥 novo campo
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;


await sql`
CREATE TABLE categories (
  dados JSONB
);
`;

await sql`
CREATE TABLE movements (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  type VARCHAR(10) CHECK (type IN ('entrada', 'saida')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

console.log("✅ Tabelas criadas com sucesso.");
