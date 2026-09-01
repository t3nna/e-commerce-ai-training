import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: "completed";
  createdAt: string;
};

export class OrderStorageError extends Error {
  constructor() {
    super("Order storage is unavailable.");
  }
}

const ordersFilePath = path.join(process.cwd(), "data", "orders.json");

function parseOrders(contents: string): Order[] {
  try {
    const parsed: unknown = JSON.parse(contents);
    if (!Array.isArray(parsed)) {
      throw new OrderStorageError();
    }
    return parsed as Order[];
  } catch (error) {
    if (error instanceof OrderStorageError) {
      throw error;
    }
    throw new OrderStorageError();
  }
}

export async function readOrders(): Promise<Order[]> {
  try {
    return parseOrders(await readFile(ordersFilePath, "utf8"));
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }
    if (error instanceof OrderStorageError) {
      throw error;
    }
    throw new OrderStorageError();
  }
}

export async function appendOrder(order: Omit<Order, "id" | "createdAt" | "status">): Promise<Order> {
  try {
    await mkdir(path.dirname(ordersFilePath), { recursive: true });

    let orders: Order[];
    try {
      orders = parseOrders(await readFile(ordersFilePath, "utf8"));
    } catch (error) {
      if (!isMissingFileError(error)) {
        throw error;
      }
      await writeFile(ordersFilePath, "[]\n", "utf8");
      orders = [];
    }

    const newOrder: Order = {
      ...order,
      id: randomUUID(),
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    await writeFile(ordersFilePath, `${JSON.stringify(orders, null, 2)}\n`, "utf8");

    return newOrder;
  } catch (error) {
    if (error instanceof OrderStorageError) {
      throw error;
    }
    throw new OrderStorageError();
  }
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
