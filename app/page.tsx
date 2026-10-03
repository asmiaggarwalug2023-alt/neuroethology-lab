import Link from "next/link";

const quick = [
  {title:"Feeding", text:"See the feeding rota and sign up for a slot.", href:"/tasks", action:"Sign up for feeding", icon:"◌"},
  {title:"Protocols", text:"Find established procedures and approved experimental protocols.", href:"/handbook", action:"Find a protocol", icon:"⌁"},
  {title:"Lab setups", text:"Find how a setup works, where it lives, and what goes with it.", href:"/setups", action:"Find a setup", icon:"◇"},
  {title:"People", text:"Find current lab members, collaborators and alumni.", href:"/people", action:"Find someone", icon:"◎"}
];

export default function Home(){
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">WELCOME TO THE LAB</span>
          <h1 className="page-title">Make yourself at sea.</h1>
          <p className="hero-copy">Everything the lab needs to stay coordinated — without making fish care feel like project management.</p>
        </div>
        <div className="hero-wave" aria-hidden="true">≈ ≈ ≈</div>
      </section>

      <section className="quick-grid">
        {quick.map(q => (
          <Link href={q.href} className="quick-card" key={q.title}>
            <span className="quick-icon">{q.icon}</span>
            <div><h3>{q.title}</h3><p>{q.text}</p><span className="text-link">{q.action} →</span></div>
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="card roomy">
          <div className="section-heading"><div><span className="eyebrow">THIS WEEK</span><h2>Coming up</h2></div><Link href="/calendar" className="text-link">Full calendar →</Link></div>
          <div className="event-row"><div className="date-chip"><b>MON</b><span>9:30</span></div><div><strong>ASP Thesis Meeting</strong><p>Every Monday · 9:30–10:30 AM</p></div></div>
          <div className="event-row"><div className="date-chip"><b>WED</b><span>1:30</span></div><div><strong>Lab Meeting</strong><p>Every Wednesday · 1:30–2:30 PM</p></div></div>
        </div>

        <div className="card roomy sea-card">
          <span className="eyebrow">LAB NOTE</span>
          <h2>A shared home, not another spreadsheet.</h2>
          <p>Projects, lab knowledge, people, tasks and stock can all live here as the app grows.</p>
          <div className="mini-fish" aria-hidden="true">🐟</div>
        </div>
      </section>
    </>
  );
}
