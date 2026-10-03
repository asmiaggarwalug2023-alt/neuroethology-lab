"use client";
import { useEffect, useState } from "react";

const choices=[5,10,15,30,60];

export function NotificationSettings(){
  const [supported,setSupported]=useState<boolean|null>(null);
  const [permission,setPermission]=useState<NotificationPermission>("default");
  const [enabled,setEnabled]=useState(false);
  const [lead,setLead]=useState(15);

  useEffect(()=>{
    const ok=typeof window!=="undefined" && "Notification" in window;
    setSupported(ok);
    if(ok) setPermission(Notification.permission);
    setEnabled(localStorage.getItem("neuro-notifications-enabled")==="true");
    const saved=Number(localStorage.getItem("neuro-reminder-minutes"));
    if(choices.includes(saved)) setLead(saved);
  },[]);

  async function enable(){
    if(!supported) return;
    const result=await Notification.requestPermission();
    setPermission(result);
    const on=result==="granted";
    setEnabled(on);
    localStorage.setItem("neuro-notifications-enabled",String(on));
    window.dispatchEvent(new Event("neuro-notifications"));
  }

  function changeLead(value:number){
    setLead(value);
    localStorage.setItem("neuro-reminder-minutes",String(value));
    window.dispatchEvent(new Event("neuro-notifications"));
  }

  return <section className="card notification-card">
    <span className="eyebrow">REMINDERS</span>
    <h2>Notifications</h2>
    <p>Google Calendar reminders work even after this site is closed. This deployment can also show browser notifications while the app is open.</p>
    <p className="notification-limit">Closed-app web push is <strong>not enabled</strong> on the current Render setup because the app does not yet have a push-delivery service and background scheduler.</p>
    {supported===false ? <p>Your browser does not support web notifications.</p> : <>
      <div className="settings-row">
        <button className="btn" onClick={enable} disabled={permission==="granted" && enabled}>
          {permission==="granted" && enabled ? "Notifications enabled" : "Enable notifications"}
        </button>
        <label className="reminder-select">
          <span>Remind me</span>
          <select className="input" value={lead} onChange={e=>changeLead(Number(e.target.value))}>
            {choices.map(n=><option value={n} key={n}>{n} minutes before</option>)}
          </select>
        </label>
      </div>
      {permission==="denied" && <p className="form-message">Notifications are blocked in this browser. Change the site permission in your browser settings to enable them.</p>}
    </>}
  </section>
}
