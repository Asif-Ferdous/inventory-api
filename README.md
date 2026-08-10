# Inventory API

A small REST API for managing product inventory, written in **TypeScript** on **Express**. It's a compact, production-shaped service: a layered architecture, input validation, centralised error handling, and parameterised SQL — kept deliberately small so the structure is easy to read end to end.

## Why it's built this way

- **Layered separation.** Routes → controllers → services → database. Each layer has one job. Controllers speak HTTP; services hold the logic and own every SQL statement; the database module owns the connection. Swapping the storage engine would touch only the service and config layers.
- **TypeScript in strict mode.** Shared interfaces (`src/types`) keep the request body, the service functions, and the database rows in agreement, so a shape mismatch is a compile error rather than a runtime surprise.
- **Validation as middleware.** Payloads are checked before they reach a controller, so controllers can assume clean input. The same validator runs in "full" mode for `POST` and "partial" mode for `PATCH`.
- **One place for errors.** Anything can `throw` a typed `HttpError`; a single error-handling middleware turns it into the right status and JSON body. Handlers stay free of scattered `res.status(...)` calls.
- **Safe SQL.** All queries use prepared statements with bound parameters — user input is always passed as data, never concatenated into a query, which closes off SQL injection.

## Tech choices

**SQLite (via `better-sqlite3`)** is used for storage so the project runs immediately after a clone with no database server to install or configure. The data-access layer is isolated in `src/services`, so moving to MySQL/Postgres for a larger deployment would be a localised change rather than a rewrite. `better-sqlite3` is synchronous, which keeps the service code simple; a write-heavy, high-concurrency workload would be the point to switch to a pooled async driver.

## Project structure

```
src/
  config/       database connection + schema
  types/        shared TypeScript interfaces
  middleware/   validation, typed errors, error handler
  services/     business logic + all SQL
  controllers/  request/response handling
  routes/       endpoint definitions
  app.ts        builds and wires the Express app
  server.ts     boots the app and listens
```

## Getting started

Requires Node.js 18+.

```bash
npm install
cp .env.example .env      # optional; sensible defaults are built in
npm run dev               # start with live reload
```

Build and run the compiled output:

```bash
npm run build
npm start
```

The server listens on `http://localhost:3000` by default.

## API

Base path: `/api/products`

| Method | Path      | Description                    | Success |
|--------|-----------|--------------------------------|---------|
| GET    | `/`       | List all products              | 200     |
| GET    | `/:id`    | Get one product                | 200     |
| POST   | `/`       | Create a product               | 201     |
| PATCH  | `/:id`    | Update one or more fields      | 200     |
| DELETE | `/:id`    | Delete a product               | 204     |

There's also a `GET /health` liveness endpoint.

### Product shape

```json
{
  "id": 1,
  "name": "Copper Filter Drier",
  "sku": "FD-032",
  "quantity": 150,
  "price": 2.75,
  "created_at": "2026-08-10 05:54:35",
  "updated_at": "2026-08-10 05:54:35"
}
```

`name` and `sku` are required strings; `quantity` and `price` are numbers ≥ 0. `sku` is unique.

### Examples

Create:

```bash
curl -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Copper Filter Drier","sku":"FD-032","quantity":150,"price":2.75}'
```

Update a single field:

```bash
curl -X PATCH http://localhost:3000/api/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"quantity":140}'
```

### Error responses

Errors come back as `{ "error": "message" }` with a matching status code:

- `400` — invalid body (each failing field is named in the message)
- `404` — no product with that id, or unknown route
- `409` — a product with that `sku` already exists

## Possible next steps

Pagination and filtering on the list endpoint, a test suite (the app is factored so `createApp()` can be imported without opening a port), and swapping SQLite for a pooled client behind the same service interface.
