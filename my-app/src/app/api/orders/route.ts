import { OrderStorageError, readOrders } from "@/lib/orders";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(await readOrders());
  } catch (error) {
    if (error instanceof OrderStorageError) {
      return Response.json({ error: "Unable to access order storage." }, { status: 500 });
    }
    return Response.json({ error: "Unable to retrieve orders." }, { status: 500 });
  }
}
