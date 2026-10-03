import { NotificationSettings } from "../../components/NotificationSettings";

const events = [
  {
    name: "ASP Thesis Meeting",
    when: "Every Monday · 9:30–10:30 AM",
    details: "Weekly ASP thesis meeting for the Neuroethology Lab.",
    googleUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=ASP%20Thesis%20Meeting&dates=20261005T093000/20261005T103000&ctz=Asia%2FKolkata&details=Weekly%20ASP%20thesis%20meeting%20for%20the%20Neuroethology%20Lab.&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DMO",
  },
  {
    name: "Lab Meeting",
    when: "Every Wednesday · 1:30–2:30 PM",
    details: "Weekly Neuroethology Lab meeting.",
    googleUrl: "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Lab%20Meeting&dates=20261007T133000/20261007T143000&ctz=Asia%2FKolkata&details=Weekly%20Neuroethology%20Lab%20meeting.&recur=RRULE%3AFREQ%3DWEEKLY%3BBYDAY%3DWE",
  },
];

export default function Calendar() {
  return (
    <>
      <h1 className="page-title">Lab calendar</h1>
      <p className="subtitle">Meetings, thesis sessions, conferences and deadlines.</p>
      <div className="card calendar-card" style={{ marginTop: 20 }}>
        <div className="list">
          {events.map((event) => (
            <div className="item calendar-item" key={event.name}>
              <div>
                <strong className="calendar-title">{event.name}</strong>
                <div className="small">{event.when}</div>
                <div className="small">{event.details}</div>
              </div>
              <a className="btn secondary" href={event.googleUrl} target="_blank" rel="noreferrer">Add to Google Calendar</a>
            </div>
          ))}
        </div>
      </div>
      <NotificationSettings />
    </>
  );
}
