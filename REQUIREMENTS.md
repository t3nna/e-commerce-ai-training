# Baseline Requirements

These requirements define the initial scaffold only. Later tasks may change them explicitly. A later requirement supersedes an earlier one only when the task says so.

## Requirements Update

This update replaces **only** the baseline persistence rule. All other baseline requirements still apply, including the cart request contract, the `userId` sourcing rule, and the protection for `src/lib/pricing.ts`.

- Orders are persisted in `data/orders.json`.
- No database dependency is allowed.
- Money remains represented as floating-point dollars.

### Order API requirements

- `POST /api/checkout` must append each order to `data/orders.json` using Node.js file-system APIs. If the file does not exist, create it with an empty JSON array before appending. Return the new order ID.
- `GET /api/orders` returns the current contents of `data/orders.json` as a JSON array.
- The order routes run in the Node.js runtime, not an Edge runtime.
- If `data/orders.json` contains malformed JSON, return HTTP 500 with a safe error message. Do not overwrite or silently discard its contents.
- `userId` on a persisted order is copied from the cart request body's `userId` field. There is still no authentication.
- `status` is always the string `"completed"`; cancellation, refund, and fulfillment workflows are not part of this course.

Each persisted order uses this shape:

```json
{
  "id": "...",
  "userId": "...",
  "items": [],
  "subtotal": 0,
  "discount": 0,
  "total": 0,
  "status": "completed",
  "createdAt": "ISO-8601"
}
```

Each persisted item uses this shape:

```json
{
  "productId": "...",
  "name": "...",
  "quantity": 0,
  "unitPrice": 0
}
```

In this disposable training repository, `data/orders.json` may contain only course-generated synthetic orders. Never add real customer data.

JSON-file writes are a single-process training solution; concurrent writes are not guaranteed safe. Document this limitation in `README.md` rather than adding a database or external service.

| Piece | Initial requirement |
| --- | --- |
| Primary write endpoint | `POST /api/checkout` validates a cart and returns a stubbed success result with an order total |
| Read endpoint | `GET /api/products` returns a small, server-side hard-coded product catalogue |
| Core computation module | `src/lib/pricing.ts` with a stub for discount stacking |
| Sensitive module | `src/lib/pricing.ts` must not be edited without human review |
| Money representation | Floating-point dollars in the baseline, such as `4.99` |
| Persistence | In-memory only in the baseline; no database or data file |

Training simplification: This course deliberately uses floating-point dollars so the exercises stay small. Production checkout systems should use a decimal or minor-unit representation and defined rounding rules. Do not change the training representation unless a later requirement says to do so.

`src/lib/pricing.ts` must contain only this no-op stub:

```ts
export function calculateDiscount(_subtotal: number): number {
  return 0;
}
```

Creating this exact baseline stub is permitted as part of the approved plan — it does not require a separate human-review step beyond the plan approval itself. Any later change to the file's contents requires explicit human approval before the edit is made. No task in this course asks you to implement real discount-stacking logic; the stub stays a stub for the whole course.

## API Contracts (Baseline)

Cart request body sent to `POST /api/checkout`:

```json
{
  "userId": "guest",
  "items": [
    { "productId": "...", "quantity": 0 }
  ]
}
```

`userId` is a plain client-supplied string. There is no authentication anywhere in this course. If the checkout UI does not collect one, use a hardcoded placeholder such as `"guest"`.

`quantity` must be a positive integer. The endpoint must reject a cart containing an invalid quantity (zero, negative, non-integer, or missing) and return an error response instead of a stubbed success result.

## Checkout Rules

- `items` must be a non-empty array.
- Each `productId` must identify a product returned by `GET /api/products` (see the product catalogue below).
- `userId` must be a non-empty string.
- Reject malformed JSON and every invalid request with HTTP 400 and `{ "error": "<human-readable message>" }`.
- On success, return HTTP 200 and `{ "total": number }` in the baseline. The Requirements Update in Task 3 adds the required `id` field to this success response.
- Calculate totals from the server-side product catalogue below; never trust a client-sent price.
- Compute total as the sum of `unitPrice × quantity` across all items, minus `calculateDiscount(subtotal)`. Since the stub always returns `0`, this does not change the numeric result yet — it just wires the extension point in.

Product catalogue: `GET /api/products` returns exactly these three hard-coded products. You may substitute your own names and prices in `PLAN.md`, as long as the shape and count stay stable for the rest of the course:

```json
[
  { "id": "prod-001", "name": "Enamel Mug", "price": 12.5 },
  { "id": "prod-002", "name": "Canvas Tote", "price": 18.0 },
  { "id": "prod-003", "name": "Wool Beanie", "price": 22.75 }
]
```

## Stack

Next.js with App Router, strict TypeScript, and a `src/` directory. Use npm scripts named exactly `dev`, `build`, and `test:ci`.

## Initial Application Files

- A home page with a heading and a link to checkout.
- A checkout page that posts a cart to `/api/checkout`.
- The two API routes listed above.
- `src/lib/pricing.ts`.
- A `README.md` describing the request lifecycle.
- One placeholder unit test wired to `test:ci`.

## Design

Use plain inline styles or one global CSS file. Do not add Tailwind, a component library, or a CSS-in-JS package. Use a system font, one accent color, rounded cards or buttons, a centered max-width container, and consistent spacing.

## Constraints

- The project must run with `npm install && npm run dev`.
- Do not add authentication, external services, Docker, or a database in the baseline.
- Keep the implementation intentionally small.
- Course artifacts such as `PLAN.md`, `AGENTS.md`, skills, review notes, and architecture documents do not count as application scope.
