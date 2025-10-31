import { fastify } from 'fastify'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { staticRoutes } from './routes/static-routes.js';
import { apiRoutes } from './routes/api-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const server = fastify();


await staticRoutes(server);
await apiRoutes(server);

server.listen({ host: '0.0.0.0', port: process.env.PORT ?? 3333 });



