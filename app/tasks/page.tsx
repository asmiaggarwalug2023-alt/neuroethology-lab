import { TaskBoard } from "../../components/TaskBoard";
import { NotificationSettings } from "../../components/NotificationSettings";

export default function Tasks(){
  return <>
    <h1 className="page-title">Lab responsibilities</h1>
    <p className="subtitle">Sign up for the daily rota, add your slot to Google Calendar, and set reminders.</p>
    <TaskBoard/>
    <NotificationSettings/>
  </>;
}
