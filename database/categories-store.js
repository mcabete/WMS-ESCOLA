// categories-store.js
import { sql } from './db.js'; // <= IMPORTANTE!

export const categoriesStore = {

  async truncate() {
      await sql`TRUNCATE TABLE categories;`;
      console.log("Categories cleared!!");
  },

  async set(newData) {
    await sql`INSERT INTO categories (dados) VALUES (${newData});`.then(() => {

        console.log("Categories Reseted:", newData);
    })
  },

  async get() {
    const struct = await sql`SELECT dados FROM categories`;

    if (!struct.length || !struct[0]?.dados) {
      // Se o resultado está vazio ou inválido
      console.log("No data found in categories.");
      return {}; // Retorna um objeto vazio, não um array
    }

    // Caso exista um registro válido
    return struct[0].dados;
  }
};

export async function loadCategories() {
  const products = await sql`SELECT category, subcategory FROM products;`;

  const result = {};

  products.forEach(({ category, subcategory }) => {
    if (!category) return;
    if (!result[category]) result[category] = new Set();
    if (subcategory) result[category].add(subcategory);
  });

  // Transformar Sets em arrays
  const finalResult = {};
  for (const [category, subSet] of Object.entries(result)) {
    finalResult[category] = Array.from(subSet);
  }


  await categoriesStore.truncate();
  await categoriesStore.set(finalResult)

  //categoriesStore.set(finalResult); // salva no "global store"
}
