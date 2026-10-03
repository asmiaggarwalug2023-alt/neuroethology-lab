const events=[
  {name:"ASP Thesis Meeting",when:"Every Monday · 9:30–10:30 AM"},
  {name:"Lab Meeting",when:"Every Wednesday · 1:30–2:30 PM"}
];
export default function Calendar(){return <><h1 className="page-title">Lab calendar</h1><p className="subtitle">Meetings, thesis sessions, conferences and deadlines.</p><div className="card" style={{marginTop:20}}><div className="list">{events.map(e=><div className="item" key={e.name}><strong>{e.name}</strong><div className="small">{e.when}</div></div>)}</div><div className="actions" style={{marginTop:16}}><button className="btn secondary">Add to Google Calendar</button></div></div></>}
