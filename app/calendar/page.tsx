const events = [
  {
    name: "ASP Thesis Meeting",
    when: "Every Monday · 9:30–10:30 AM",
    googleUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=ASP%20Thesis%20Meeting&dates=20261005T093000/20261005T103000&ctz=Asia%2FKolkata&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DMO",
  },
  {
    name: "Lab Meeting",
    when: "Every Wednesday · 1:30–2:30 PM",
    googleUrl:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lab%20Meeting&dates=20261007T133000/20261007T143000&ctz=Asia%2FKolkata&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DWE",
  },
];

export default function Calendar() {
  return (
    <>
      <h1 className="page-title">Lab calendar</h1>
      <p className="subtitle">Meetings, thesis sessions, conferences and deadlines.</p>

      <div className="card" style={{ marginTop: 20, padding: 24 }}>
        <div className="list">
          {events.map((event) => (
            <div
              className="item"
              key={event.name}
              style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}
            >
              <div>
                <strong style={{ fontSize: 20 }}>{event.name}</strong>
                <div className="small">{event.when}</div>
              </div>

              <a
                className="btn secondary"
                href={event.googleUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Add ${event.name} to Google Calendar`}
              >
                Add to Google Calendar
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
