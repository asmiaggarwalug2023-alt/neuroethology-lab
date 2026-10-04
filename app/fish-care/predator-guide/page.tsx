import Link from "next/link";

export default function PredatorGuide(){
  return (
    <>
      <Link href="/fish-care" className="text-link">← Back to Fish Care</Link>

      <section className="guide-hero">
        <span className="eyebrow">FISH CARE</span>
        <h1 className="page-title">Predator guide</h1>
        <p className="hero-copy">Quick reference for predator purchase and lab planning.</p>
      </section>

      <div className="guide-grid">
        <section className="card guide-card">
          <span className="step-number">01</span>
          <h2>Predator species options</h2>
          <p><strong>Oscar Cichlid</strong></p>
          <p className="small">Approximate cost: ₹200</p>
        </section>

        <section className="card guide-card">
          <span className="step-number">02</span>
          <h2>Buy in pairs</h2>
          <p>Purchase predator fish in pairs rather than individually.</p>
        </section>
      </div>
    </>
  );
}
