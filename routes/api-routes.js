import fastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { DatabasePostgres } from '../database/database-postgres.js';
import { categoriesStore, loadCategories } from '../database/categories-store.js';

const database = new DatabasePostgres();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export async function apiRoutes(server) {

  // Criar produto (com verificação de duplicado)
  server.post('/api/produtos', async (request, reply) => {
    const { name, description, weight, price, category, subcategory } = request.body;

    try {
      const result = await database.create({ name, description, weight, price, category, subcategory });

      // Caso o produto já exista
      if (!result.success) {
        return reply.status(400).send({ success: false, message: result.message });
      }

      // Caso criado com sucesso
      return reply.status(201).send({ success: true, message: result.message });

    } catch (err) {
      console.error("Erro na rota /api/produtos:", err);
      return reply.status(500).send({ success: false, message: "Erro interno no servidor." });
    }
  });

  // Listar produtos (com filtro opcional)
  server.get('/api/produtos', async (request) => {
    const search = request.query.search;
    const produtos = await database.list(search);
    return produtos;
  });

  // Atualizar produto
  server.put('/api/produtos/:id', async (request, reply) => {
    const { name, description, weight, price, category, subcategory } = request.body;
    const produtoID = request.params.id;

    await database.update(produtoID, { name, description, weight, price, category, subcategory });
    return reply.status(204).send();
  });

  // Deletar produto
  server.delete('/api/produtos/:id', async (request, reply) => {
    const produtoID = request.params.id;
    await database.delete(produtoID);
    return reply.status(204).send();
  });

  // Listar categorias
  server.get('/api/categorias', async () => {
    const categories = await database.categories();
    return categories;
  });

  // ⚙️ Atualiza quantidade de um produto (entrada/saída) — usa DatabasePostgres.adjustStock
  server.post('/api/produtos/:id/stock', async (request, reply) => {
    const id = request.params.id;
    const { delta } = request.body;

    if (typeof delta !== 'number') return reply.status(400).send({ message: 'Delta inválido' });

    try {
      // usa o método da classe DatabasePostgres que já atualiza products + registra movements
      const updated = await database.adjustStock(id, delta, delta >= 0 ? 'entrada' : 'saida');

      return reply.send({ success: true, product: updated });
    } catch (err) {
      console.error('Erro ao ajustar estoque:', err);
      return reply.status(500).send({ message: 'Erro ao ajustar estoque' });
    }
  });


  // GET /api/estoque?page=1&limit=20&search=...
  server.get('/api/estoque', async (request, reply) => {
    try {
      const search = request.query.search || null;
      const page = Math.max(1, Number(request.query.page) || 1);
      const limit = Math.min(100, Number(request.query.limit) || 20);
      const offset = (page - 1) * limit;

      // busca todos (database.list já existe)
      const allProdutos = await database.list(search);

      // paginar no backend de forma simples (se quiser, depois fazemos SQL com LIMIT/OFFSET)
      const items = Array.isArray(allProdutos) ? allProdutos.slice(offset, offset + limit) : [];

      return reply.send({ page, limit, items });
    } catch (err) {
      console.error('Erro ao carregar /api/estoque:', err);
      return reply.status(500).send({ message: 'Erro ao listar estoque' });
    }
  });

// Entrada / Saída em lote
server.post('/api/estoque/bulk', async (request, reply) => {
  const { ids, delta, reason, type } = request.body;

  // Validações básicas
  if (!Array.isArray(ids) || ids.length === 0)
    return reply.status(400).send({ message: 'Nenhum ID informado.' });
  if (typeof delta !== 'number' || delta === 0)
    return reply.status(400).send({ message: 'Delta inválido.' });

  try {
    // Aplica a alteração de estoque em cada produto
    for (const id of ids) {
      // Atualiza o produto
      await database.adjustStock(id, delta, type || (delta > 0 ? 'entrada' : 'saida'));

      // Se quiser registrar o motivo em movements:
      if (reason) {
        await database.sql`
          UPDATE movements
          SET reason = ${reason}
          WHERE product_id = ${id}
          ORDER BY id DESC
          LIMIT 1;
        `;
      }
    }

    return reply.send({ success: true, message: 'Movimentação em lote concluída.' });
  } catch (err) {
    console.error('Erro no bulk:', err);
    return reply.status(500).send({ success: false, message: 'Erro no bulk' });
  }
});


}
