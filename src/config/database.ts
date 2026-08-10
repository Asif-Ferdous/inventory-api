import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'inventory.db');
const db = new Database(dbPath);

// WAL: readers don't block on the writer
db.pragma('journal_mode = WAL');

function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      sku        TEXT    NOT NULL UNIQUE,
      quantity   INTEGER NOT NULL DEFAULT 0,
      price      REAL    NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// run on import, before any service prepares a statement
initSchema();

export default db;
