import db from '../config/database';
import { Product, CreateProductInput, UpdateProductInput } from '../types/product';
import { notFound, conflict } from '../middleware/httpError';

// all SQL lives here. prepared + bound params => no injection
const stmtGetAll = db.prepare('SELECT * FROM products ORDER BY id');
const stmtGetById = db.prepare('SELECT * FROM products WHERE id = ?');
const stmtGetBySku = db.prepare('SELECT * FROM products WHERE sku = ?');
const stmtInsert = db.prepare(`
  INSERT INTO products (name, sku, quantity, price)
  VALUES (@name, @sku, @quantity, @price)
`);
const stmtDelete = db.prepare('DELETE FROM products WHERE id = ?');

export function getAllProducts(): Product[] {
  return stmtGetAll.all() as Product[];
}

export function getProductById(id: number): Product {
  const product = stmtGetById.get(id) as Product | undefined;
  if (!product) throw notFound(`Product ${id} not found`);
  return product;
}

export function createProduct(input: CreateProductInput): Product {
  // check sku ourselves so we return 409, not a raw constraint 500
  const existing = stmtGetBySku.get(input.sku) as Product | undefined;
  if (existing) throw conflict(`A product with sku '${input.sku}' already exists`);

  const result = stmtInsert.run(input);
  return getProductById(Number(result.lastInsertRowid));
}

export function updateProduct(id: number, input: UpdateProductInput): Product {
  const current = getProductById(id); // 404s if missing

  if (input.sku && input.sku !== current.sku) {
    const clash = stmtGetBySku.get(input.sku) as Product | undefined;
    if (clash) throw conflict(`A product with sku '${input.sku}' already exists`);
  }

  // merge so a PATCH on one field doesn't wipe the rest
  const merged = { ...current, ...input };
  db.prepare(`
    UPDATE products
    SET name = @name, sku = @sku, quantity = @quantity,
        price = @price, updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    name: merged.name,
    sku: merged.sku,
    quantity: merged.quantity,
    price: merged.price,
  });

  return getProductById(id);
}

export function deleteProduct(id: number): void {
  const result = stmtDelete.run(id);
  if (result.changes === 0) throw notFound(`Product ${id} not found`);
}
