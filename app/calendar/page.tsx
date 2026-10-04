import { CalendarBoard } from "../../components/CalendarBoard";
import { NotificationSettings } from "../../components/NotificationSettings";

export default function Calendar(){
  return <>
    <h1 className="page-title">Lab calendar</h1>
    <p className="subtitle">Click any day to add what is happening in the lab.</p>
    <CalendarBoard/>
    <NotificationSettings/>
  </>;
}
