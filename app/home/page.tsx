import Link from "next/link";
import { ZebrafishResearchFeed } from "../../components/ZebrafishResearchFeed";
import { HomeNewsBar } from "../../components/HomeNewsBar";

const quick = [
  {title:"Feeding", text:"See the feeding rota and sign up for a slot.", href:"/tasks", action:"Sign up for feeding", icon:"◌"},
  {title:"Protocols", text:"Find established procedures and approved lab guidance.", href:"/handbook", action:"Find a procedure", icon:"⌁"},
  {title:"Lab setups", text:"Find how a setup works, where it lives, and who is using it.", href:"/setups", action:"Find a setup", icon:"◇"},
  {title:"People", text:"Find current lab members, collaborators and alumni.", href:"/people", action:"Find someone", icon:"◎"}
];

const meetings=[
  {day:"MON",time:"9:30",title:"ASP Thesis Meeting",when:"Every Monday · 9:30–10:30 AM",url:"https://calendar.google.com/calendar/render?action=TEMPLATE&text=ASP%20Thesis%20Meeting&dates=20261005T093000/20261005T103000&ctz=Asia%2FKolkata&details=Weekly%20ASP%20thesis%20meeting%20for%20the%20Neuroethology%20Lab.&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DMO"},
  {day:"WED",time:"1:30",title:"Lab Meeting",when:"Every Wednesday · 1:30–2:30 PM",url:"https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lab%20Meeting&dates=20261007T133000/20261007T143000&ctz=Asia%2FKolkata&details=Weekly%20Neuroethology%20Lab%20meeting.&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DWE"}
];

export default function HomeDashboard(){
  return (
    <>
      <HomeNewsBar />

      <section className="hero artwork-hero">
        <div>
          <span className="eyebrow">WELCOME TO THE LAB</span>
          <h1 className="page-title">Make yourself at sea.</h1>
          <p className="hero-copy">Everything the lab needs to stay coordinated, find resources, and keep track of what is happening.</p>
        </div>
        <div className="homepage-artwork-lockup">
          <div className="homepage-artwork-crop">
            <img className="homepage-artwork" src="/lab-artwork.webp" alt="Hand-drawn blue zebrafish swimming together." width="960" height="1281" />
          </div>
        </div>
      </section>

      <section className="quick-grid">
        {quick.map(q => (
          <Link href={q.href} className="quick-card" key={q.title}>
            <span className="quick-icon">{q.icon}</span>
            <div>
              <h3>{q.title}</h3>
              <p>{q.text}</p>
              <span className="text-link">{q.action} →</span>
            </div>
          </Link>
        ))}
      </section>

      <ZebrafishResearchFeed />

      <section className="dashboard-grid">
        <div className="card roomy">
          <div className="section-heading">
            <div><span className="eyebrow">THIS WEEK</span><h2>Coming up</h2></div>
            <Link href="/calendar" className="text-link">Full calendar →</Link>
          </div>
          {meetings.map(m=>(
            <div className="event-row" key={m.title}>
              <div className="date-chip"><b>{m.day}</b><span>{m.time}</span></div>
              <div className="event-copy">
                <strong>{m.title}</strong>
                <p>{m.when}</p>
                <a className="text-link" href={m.url} target="_blank" rel="noreferrer">Add to Google Calendar →</a>
              </div>
            </div>
          ))}
        </div>

        <div className="card roomy sea-card">
          <span className="eyebrow">LAB NOTE</span>
          <h2>Share something with the lab!</h2>
          <div className="actions centered-actions">
            <Link className="btn secondary" href="/projects">Projects</Link>
            <Link className="btn secondary" href="/research">Research</Link>
            <Link className="btn secondary" href="/people">People</Link>
          </div>
          <div className="mini-fish" aria-hidden="true">🐟</div>
        </div>
      </section>
    </>
  );
}
