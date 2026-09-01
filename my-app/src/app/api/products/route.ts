import { products } from "@/lib/products";

export function GET() {
  return Response.json(products);
}
