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
    <p>
      For reminders that work after the web app is closed, add the commitment to Google Calendar.
      You can also enable browser reminders while this web app is open.
    </p>

    {supported===false ? <p>Your browser does not support browser notifications.</p> : <>
      <div className="settings-row">
        <button className="btn" onClick={enable} disabled={permission==="granted" && enabled}>
          {permission==="granted" && enabled ? "Browser notifications enabled" : "Enable browser notifications"}
        </button>
        <label className="reminder-select">
          <span>Remind me</span>
          <select className="input" value={lead} onChange={e=>changeLead(Number(e.target.value))}>
            {choices.map(n=><option value={n} key={n}>{n} minutes before</option>)}
          </select>
        </label>
      </div>
      {permission==="denied" && <p className="form-message">Notifications are blocked in this browser. Change the site permission in your browser settings to enable them.</p>}
      <p className="small notification-note">
        Background push while the app is fully closed is not active yet, so Google Calendar is the reliable closed-app reminder option.
      </p>
    </>}
  </section>
}
