import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { POST } from "@/app/api/checkout/route";
import { GET } from "@/app/api/orders/route";
import { GET as getProducts } from "@/app/api/products/route";

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");
let originalContents: string | undefined;

async function requestCheckout(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(async () => {
  try {
    originalContents = await readFile(ordersFilePath, "utf8");
  } catch {
    originalContents = undefined;
  }
  await mkdir(path.dirname(ordersFilePath), { recursive: true });
  await rm(ordersFilePath, { force: true });
});

afterEach(async () => {
  if (originalContents === undefined) {
    await rm(ordersFilePath, { force: true });
    return;
  }
  await writeFile(ordersFilePath, originalContents, "utf8");
});

describe("order routes", () => {
  test("returns an empty array before checkout creates order storage", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
    await expect(access(ordersFilePath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("persists a completed, catalogue-priced order and returns its ID", async () => {
    const response = await requestCheckout({
      userId: "guest-123",
      items: [{ productId: "prod-001", quantity: 2, price: 0.01 }],
    });
    const body = (await response.json()) as { id: string; total: number };

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ id: expect.any(String), total: 25 });

    const savedOrders = await GET();
    expect(savedOrders.status).toBe(200);
    await expect(savedOrders.json()).resolves.toEqual([
      {
        id: body.id,
        userId: "guest-123",
        items: [
          {
            productId: "prod-001",
            name: "Enamel Mug",
            quantity: 2,
            unitPrice: 12.5,
          },
        ],
        subtotal: 25,
        discount: 0,
        total: 25,
        status: "completed",
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      },
    ]);
  });

  test("returns the exact product catalogue", async () => {
    const response = await getProducts();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      { id: "prod-001", name: "Enamel Mug", price: 12.5 },
      { id: "prod-002", name: "Canvas Tote", price: 18 },
      { id: "prod-003", name: "Wool Beanie", price: 22.75 },
    ]);
  });

  test.each([
    ["missing userId", { items: [{ productId: "prod-001", quantity: 1 }] }],
    ["empty userId", { userId: "", items: [{ productId: "prod-001", quantity: 1 }] }],
    ["non-string userId", { userId: 1, items: [{ productId: "prod-001", quantity: 1 }] }],
    ["missing items", { userId: "guest" }],
    ["empty items", { userId: "guest", items: [] }],
    ["unknown product", { userId: "guest", items: [{ productId: "unknown", quantity: 1 }] }],
    ["zero quantity", { userId: "guest", items: [{ productId: "prod-001", quantity: 0 }] }],
    ["negative quantity", { userId: "guest", items: [{ productId: "prod-001", quantity: -1 }] }],
    ["fractional quantity", { userId: "guest", items: [{ productId: "prod-001", quantity: 1.5 }] }],
    ["missing quantity", { userId: "guest", items: [{ productId: "prod-001" }] }],
  ])("rejects %s", async (_description, body) => {
    const response = await requestCheckout(body);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  test("rejects malformed request JSON", async () => {
    const malformedJson = await POST(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
    );

    expect(malformedJson.status).toBe(400);
    await expect(malformedJson.json()).resolves.toMatchObject({ error: expect.any(String) });
  });

  test("returns a safe error and preserves malformed storage", async () => {
    await writeFile(ordersFilePath, "{ not valid JSON", "utf8");

    const getResponse = await GET();
    const checkoutResponse = await requestCheckout({
      userId: "guest",
      items: [{ productId: "prod-001", quantity: 1 }],
    });

    expect(getResponse.status).toBe(500);
    await expect(getResponse.json()).resolves.toEqual({ error: "Unable to access order storage." });
    expect(checkoutResponse.status).toBe(500);
    await expect(checkoutResponse.json()).resolves.toEqual({ error: "Unable to access order storage." });
    await expect(readFile(ordersFilePath, "utf8")).resolves.toBe("{ not valid JSON");
  });

  test("returns a safe error and preserves non-array storage", async () => {
    await writeFile(ordersFilePath, '{"not":"an array"}', "utf8");

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Unable to access order storage." });
    await expect(readFile(ordersFilePath, "utf8")).resolves.toBe('{"not":"an array"}');
  });
});
