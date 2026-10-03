import Link from "next/link";

const cards = [
  { title: "Feeding", text: "Add your lab-approved procedure here." },
  { title: "Cleaning", text: "Add your lab-approved procedure here." },
  {
    title: "Bringing fish to the lab",
    text: "Shop details, transport guidance and what to do once you are back in the lab.",
    href: "/fish-care/bringing-fish",
  },
  { title: "Predator guide", text: "Add your lab-approved procedure here." },
];

export default function FishCare(){
  return (
    <>
      <h1 className="page-title">Fish Care</h1>
      <p className="subtitle">Approved husbandry information and lab-specific guidance.</p>

      <div className="grid fish-care-grid" style={{marginTop:20}}>
        {cards.map((card) =>
          card.href ? (
            <Link className="card fish-care-card fish-care-link" href={card.href} key={card.title}>
              <h3>{card.title}</h3>
              <p className="small">{card.text}</p>
              <span className="text-link">Open guide →</span>
            </Link>
          ) : (
            <div className="card fish-care-card" key={card.title}>
              <h3>{card.title}</h3>
              <p className="small">{card.text}</p>
            </div>
          )
        )}
      </div>
    </>
  );
}
