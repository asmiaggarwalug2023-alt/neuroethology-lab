import Link from "next/link";

const steps = [
  ["1", "Get the flakes", "Take the flake food from the drawer next to the zebrafish system."],
  ["2", "Use the green mortar", "Put the flakes into the green mortar."],
  ["3", "Crush to a powder", "Use the crusher/pestle until the flakes are finely powdered."],
  ["4", "Measure the food", "For a tank with 5–10 fish, use the small blue feeding spoon and match the lab reference amount: a small mound at the tip of the spoon."],
  ["5", "Check the tank label", "If the tank says “Do Not Feed”, do not feed that tank."],
  ["6", "Feed the fish", "Feed the measured powdered food to the 5–10 fish in the tank."],
];

export default function FeedingGuide(){
  return (
    <>
      <Link href="/fish-care" className="text-link">← Back to Fish Care</Link>
      <section className="guide-hero feeding-hero">
        <span className="eyebrow">DAILY HUSBANDRY</span>
        <h1 className="page-title guide-title">Feeding guide</h1>
        <p className="hero-copy">For tanks with 5–10 zebrafish. Always check the tank label before feeding.</p>
      </section>

      <div className="feeding-steps">
        {steps.map(([num,title,text]) => (
          <section className="card feeding-step" key={num}>
            <div className="feeding-number">{num}</div>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
              {num === "4" && (
                <figure className="feeding-reference">
                  <img
                    src="/fish-food-reference.jpeg"
                    alt="Reference amount of powdered fish food on the blue feeding spoon for a tank with 5 to 10 fish"
                  />
                  <figcaption>Reference quantity for 5–10 fish.</figcaption>
                </figure>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="feeding-warning">
        <span className="warning-mark">!</span>
        <div>
          <strong>Always check tank labels before feeding.</strong>
          <p>“Do Not Feed” means exactly that — skip the tank.</p>
        </div>
      </div>
    </>
  );
}
