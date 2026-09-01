import { appendOrder, OrderStorageError, type OrderItem } from "@/lib/orders";
import { calculateDiscount } from "@/lib/pricing";
import { products } from "@/lib/products";

type CartItem = { productId?: unknown; quantity?: unknown };
type CheckoutRequest = { userId?: unknown; items?: unknown };

export const runtime = "nodejs";

function invalidRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let cart: CheckoutRequest;

  try {
    cart = await request.json();
  } catch {
    return invalidRequest("Request body must be valid JSON.");
  }

  if (!cart || typeof cart !== "object" || typeof cart.userId !== "string" || !cart.userId.trim()) {
    return invalidRequest("userId must be a non-empty string.");
  }

  if (!Array.isArray(cart.items) || cart.items.length === 0) {
    return invalidRequest("items must be a non-empty array.");
  }

  let subtotal = 0;
  const orderItems: OrderItem[] = [];
  for (const item of cart.items as CartItem[]) {
    if (!item || typeof item !== "object" || typeof item.productId !== "string") {
      return invalidRequest("Each item must include a known productId.");
    }
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return invalidRequest("Each item quantity must be a positive integer.");
    }

    const product = products.find(({ id }) => id === item.productId);
    if (!product) {
      return invalidRequest("Each item must include a known productId.");
    }
    subtotal += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }

  const discount = calculateDiscount(subtotal);
  const total = subtotal - discount;

  try {
    const order = await appendOrder({
      userId: cart.userId,
      items: orderItems,
      subtotal,
      discount,
      total,
    });
    return Response.json({ id: order.id, total });
  } catch (error) {
    if (error instanceof OrderStorageError) {
      return Response.json({ error: "Unable to access order storage." }, { status: 500 });
    }
    return Response.json({ error: "Unable to complete checkout." }, { status: 500 });
  }
}
