import Link from "next/link";

export default function BringingFish(){
  return (
    <>
      <Link href="/fish-care" className="text-link">← Back to Fish Care</Link>

      <section className="guide-hero">
        <span className="eyebrow">FISH ACQUISITION & TRANSPORT</span>
        <h1 className="page-title guide-title">Bringing zebrafish to the lab</h1>
        <p className="hero-copy">
          Lab-specific notes compiled from the team’s WhatsApp instructions and voice notes.
        </p>

        <div className="guide-actions">
          <a
            className="btn"
            href="https://share.google/jkoDHqN9JjYatiJ6o"
            target="_blank"
            rel="noreferrer"
          >
            Open directions
          </a>
          <a className="btn secondary" href="tel:+918766293938">
            Call 87662 93938
          </a>
        </div>
      </section>

      <div className="notice-card">
        <strong>Before you go</strong>
        <p>
          Call the aquarium shop first to confirm that they are open and that they have the
          number of zebrafish you need.
        </p>
      </div>

      <div className="guide-grid">
        <section className="card guide-card">
          <span className="step-number">01</span>
          <h2>At the aquarium shop</h2>
          <ul>
            <li>Fish are usually collected from Sea World Aquarium, Daryaganj.</li>
            <li>Ask the shop to pack the zebrafish in oxygenated plastic bags.</li>
            <li>From previous experience, younger zebrafish are commonly supplied.</li>
            <li>Ask them not to overcrowd the bags.</li>
            <li>If reimbursement will be needed, have the bill made in Professor Bittu’s name and keep it safely.</li>
          </ul>
        </section>

        <section className="card guide-card">
          <span className="step-number">02</span>
          <h2>Packing & transport</h2>
          <ul>
            <li>One recorded transport used 21 fish per oxygenated bag.</li>
            <li>The bags were filled roughly one-third with water, with the remaining space filled with oxygen.</li>
            <li>Two bags were supported inside a cardboard box with paper strips and the box was taped shut.</li>
            <li>Keep the box stable during the car journey, ideally on the back-centre seat.</li>
            <li>Minimise unnecessary movement because splashing can stress or injure fish.</li>
          </ul>
        </section>

        <section className="card guide-card">
          <span className="step-number">03</span>
          <h2>Entering campus & the lab</h2>
          <ul>
            <li>Tell the guards that the box contains live fish for lab work if they ask.</li>
            <li>They may ask for proof or for Professor Bittu to be contacted.</li>
            <li>Do not put the fish box through the scanner.</li>
            <li>Once in the lab, begin the transfer and acclimatisation steps promptly.</li>
          </ul>
        </section>

        <section className="card guide-card">
          <span className="step-number">04</span>
          <h2>Temperature acclimatisation</h2>
          <ul>
            <li>Place the sealed fish bags into containers holding system water.</li>
            <li>In the recorded procedure, system water was 28.5°C.</li>
            <li>The bags were left there for 20–25 minutes to acclimatise to system-water temperature.</li>
          </ul>
        </section>

        <section className="card guide-card">
          <span className="step-number">05</span>
          <h2>Recorded methylene-blue step</h2>
          <p className="procedure-warning">
            This is a record of what the lab did on that occasion. Confirm that it is still part
            of the current approved lab SOP before using it.
          </p>
          <ul>
            <li>The fish were quickly netted and dipped for 10 seconds.</li>
            <li>The recorded solution was 1.5 L water with 12 mL methylene blue.</li>
            <li>They were then moved into fresh system-water containers.</li>
            <li>This occurred about 2.5 hours after transport began.</li>
          </ul>
        </section>

        <section className="card guide-card">
          <span className="step-number">06</span>
          <h2>Once settled in the lab</h2>
          <ul>
            <li>Because the temporary containers became blue, the team waited about 7 minutes and then moved the fish again.</li>
            <li>The previous containers were scrubbed and refilled with fresh system water.</li>
            <li>After another 10–15 minutes, the fish were fed.</li>
            <li>The tanks were covered with mosquito net secured with a rubber band and left overnight.</li>
          </ul>
        </section>
      </div>
    </>
  );
}
