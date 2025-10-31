import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { categoriesStore, loadCategories } from '../database/categories-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export async function staticRoutes(server) {
  // Servir arquivos estáticos
  server.register(fastifyStatic, {
    root: join(__dirname, '../public'),
    prefix: '/', 
  });

  // Rotas de páginas HTML
  server.get('/', (req, reply) => {
    return reply.sendFile('main/main.html');
  });

  //server.get('/produtos', (req, reply) => {
  //  return reply.sendFile('products-list/products-list.html');
  //});

  server.get('/produtos/view/:id', (req, reply) => {
    return reply.sendFile('product-view/product-view.html');
  });
}
