"use client";

import { FormEvent, useState } from "react";
import { products } from "@/lib/products";

export default function CheckoutPage() {
  const [message, setMessage] = useState<string>();
  const [isError, setIsError] = useState(false);

  async function submitCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "guest",
        items: [
          {
            productId: formData.get("productId"),
            quantity: Number(formData.get("quantity")),
          },
        ],
      }),
    });
    const body: { id?: string; total?: number; error?: string } = await response.json();
    setIsError(!response.ok);
    setMessage(
      response.ok
        ? `Order ${body.id} completed. Total: $${body.total}`
        : body.error ?? "Checkout failed.",
    );
  }

  return (
    <main className="container">
      <form className="card" onSubmit={submitCheckout}>
        <p className="eyebrow">Checkout</p>
        <h1>Place your order</h1>
        <label>
          Product
          <select name="productId" defaultValue={products[0].id}>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — ${product.price}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" min="1" step="1" defaultValue="1" required />
        </label>
        <button className="button" type="submit">
          Submit order
        </button>
        {message ? <p className={`result ${isError ? "error" : ""}`}>{message}</p> : null}
      </form>
    </main>
  );
}
