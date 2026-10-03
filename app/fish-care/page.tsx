import Link from "next/link";

const cards = [
  { title: "Feeding", text: "Step-by-step food preparation, quantity and tank-label checks.", href: "/fish-care/feeding" },
  { title: "Cleaning", text: "Lab cleaning guidance and routines.", href: "/fish-care/cleaning" },
  { title: "Bringing fish to the lab", text: "Shop details, transport guidance and what to do once you are back in the lab.", href: "/fish-care/bringing-fish" },
  { title: "Predator guide", text: "Predator-stimulus guidance for the lab.", href: "/fish-care/predator-guide" },
];

export default function FishCare(){
  return (
    <>
      <h1 className="page-title">Fish Care</h1>
      <p className="subtitle">Approved husbandry information and lab-specific guidance.</p>
      <div className="grid fish-care-grid" style={{marginTop:20}}>
        {cards.map((card) => (
          <Link className="card fish-care-card fish-care-link" href={card.href} key={card.title}>
            <h3>{card.title}</h3>
            <p className="small">{card.text}</p>
            <span className="text-link">Open guide →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
