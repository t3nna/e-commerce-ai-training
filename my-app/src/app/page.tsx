import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="card">
        <p className="eyebrow">Training checkout</p>
        <h1>Simple, server-priced orders.</h1>
        <p>Choose a catalogue item and submit a small cart to see its total.</p>
        <Link className="button" href="/checkout">
          Go to checkout
        </Link>
      </section>
    </main>
  );
}
