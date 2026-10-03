import Link from "next/link";

export default function CleaningGuide(){
  return (
    <>
      <Link href="/fish-care" className="text-link">← Back to Fish Care</Link>

      <section className="guide-hero">
        <span className="eyebrow">FISH CARE</span>
        <h1 className="page-title">Cleaning</h1>
        <p className="hero-copy">
          Please contact housekeeping if anything needs to be cleaned, or to clean out the dustbin!
        </p>
      </section>

      <section className="card roomy cleaning-contact-card">
        <span className="eyebrow">HOUSEKEEPING CONTACT</span>
        <h2>+91 7496-967703</h2>
        <p>Please contact housekeeping if anything needs to be cleaned, or to clean out the dustbin!</p>
        <a className="btn" href="tel:+917496967703">Call housekeeping</a>
      </section>
    </>
  );
}
