# Baseline Checkout

## Install and run

```sh
npm install
npm run dev
```

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run test:ci` runs the unit tests once.

## Endpoints

- `GET /api/products` returns the three-item in-memory catalogue.
- `POST /api/checkout` accepts a non-empty `userId` and cart. Each cart item needs a known `productId` and a positive integer `quantity`. It returns the completed order ID and total.
- `GET /api/orders` returns the persisted order list.

## Request lifecycle

The home page links to `/checkout`. The checkout form sends a cart with the placeholder user ID `guest` to `POST /api/checkout`. The server validates the request, resolves prices only from its in-memory catalogue, calculates the subtotal, applies the no-op discount stub, and appends a completed order to `data/orders.json`. Successful checkout returns `{ "id": string, "total": number }`; `GET /api/orders` returns the saved order array. Invalid or malformed requests return HTTP 400 with `{ "error": "..." }`.

## Order storage

Orders are stored as course-generated synthetic data only; never add real customer data to `data/orders.json`. JSON-file writes are a single-process training solution, so concurrent writes are not guaranteed safe. This project intentionally does not add a database or external service.

## Course evaluation tooling

The repository-local evaluation skill is located at `../.agents/skills/course-eval/SKILL.md`. Its independent read-only reviewer is configured at `../.codex/agents/course-reviewer.toml`.
