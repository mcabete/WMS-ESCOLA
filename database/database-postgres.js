
import { randomUUID } from "node:crypto"
import { sql } from './db.js'
import { duplexPair } from "node:stream"

import { categoriesStore, loadCategories } from '../database/categories-store.js';

export class DatabasePostgres {

    async list(search) {
        
        let produtos

        if (search) {
            produtos = await sql`select * from products where name ilike ${'%' + search + '%'}`
        }else{

            produtos = await sql`select * from products`
        }  

        return produtos
    }

    async categories() {
        
        let cat = categoriesStore.get();
        console.log(cat);
        return cat
    }

    async create(produto) {
        const { name, description, weight, price, category, subcategory } = produto;

        try {
            // 1️⃣ Verifica se já existe produto com mesmo nome
            const existing = await sql`
            SELECT id FROM products WHERE LOWER(name) = LOWER(${name})
            `;

            if (existing.length > 0) {
            console.warn(`Produto "${name}" já existe. Nenhum registro criado.`);
            return { success: false, message: `Produto "${name}" já existe.` };
            }

            // 2️⃣ Gera ID incremental
            const quantity = await sql`SELECT COUNT(*) AS count FROM products`;
            const produtoId = String(parseInt(quantity[0].count) + 1).padStart(4, '0');

            // 3️⃣ Insere produto
            await sql`
            INSERT INTO products (id, name, description, weight, price, category, subcategory)
            VALUES (${produtoId}, ${name}, ${description}, ${weight}, ${price}, ${category}, ${subcategory})
            `;

            console.log('Produto inserido com ID:', produtoId);

            // 4️⃣ Atualiza cache de categorias
            await loadCategories();

            return { success: true, message: `Produto "${name}" criado com sucesso.` };

        } catch (err) {
            console.error("Erro ao criar produto:", err);
            return { success: false, message: "Erro ao criar produto." };
        }
    }


    async update(id, produto) {
        
        const {name, description, weight, price, category, subcategory} = produto;

        await sql`update products set name = ${name}, description = ${description}, weight = ${weight}, price = ${price}, category = ${category}, subcategory = ${subcategory} WHERE id = ${id}`
    }

    async delete(id) {

        await sql`delete from products where id = ${id}`
    }


    async adjustStock(id, delta, type) {
        try {
            // Inicia transação manual
            await sql`BEGIN`;

            // Atualiza a quantidade do produto
            const [updated] = await sql`
            UPDATE products
            SET quantity = quantity + ${delta}
            WHERE id = ${id}
            RETURNING *;
            `;

            if (!updated) throw new Error("Produto não encontrado");

            // Registra a movimentação no histórico
            await sql`
            INSERT INTO movements (product_id, delta, type)
            VALUES (${id}, ${delta}, ${type});
            `;

            // Confirma transação
            await sql`COMMIT`;

            return updated;
        } catch (err) {
            console.error("Erro ao ajustar estoque:", err);
            await sql`ROLLBACK`;
            throw err;
        }
    }

    // Retorna produto por ID
    async getById(id) {
        const res = await sql`SELECT * FROM products WHERE id = ${id}`;
        return res[0] || null;
    }
}