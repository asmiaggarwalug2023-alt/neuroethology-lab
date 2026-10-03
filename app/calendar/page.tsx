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

      <div className="calendar-events">
        {events.map((event) => (
          <section className="card calendar-event-card" key={event.name}>
            <div className="calendar-copy">
              <h2>{event.name}</h2>
              <p className="calendar-when">{event.when}</p>
              <p className="calendar-details">{event.details}</p>
            </div>
            <div className="calendar-action-row">
              <a
                className="btn secondary calendar-google-btn"
                href={event.googleUrl}
                target="_blank"
                rel="noreferrer"
              >
                Add to Google Calendar
              </a>
            </div>
          </section>
        ))}
      </div>

      <NotificationSettings />
    </>
  );
}
