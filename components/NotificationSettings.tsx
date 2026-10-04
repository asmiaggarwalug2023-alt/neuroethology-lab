"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";
import { authFetch } from "../lib/authFetch";

const choices=[5,10,15,30,60];

function urlBase64ToUint8Array(base64String:string){
  const padding="=".repeat((4-base64String.length%4)%4);
  const base64=(base64String+padding).replace(/-/g,"+").replace(/_/g,"/");
  const rawData=window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map(char=>char.charCodeAt(0)));
}

export function NotificationSettings(){
  const [supported,setSupported]=useState<boolean|null>(null);
  const [permission,setPermission]=useState<NotificationPermission>("default");
  const [enabled,setEnabled]=useState(false);
  const [lead,setLead]=useState(15);
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const ok=typeof window!=="undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(ok);
    if(ok) setPermission(Notification.permission);
    const saved=Number(localStorage.getItem("neuro-reminder-minutes"));
    if(choices.includes(saved)) setLead(saved);

    if(ok){
      navigator.serviceWorker.ready.then(reg=>reg.pushManager.getSubscription()).then(sub=>setEnabled(!!sub)).catch(()=>{});
    }
  },[]);

  async function syncSubscription(subscription:PushSubscription,minutes:number){
    const json=subscription.toJSON();
    const r=await authFetch("/api/push/subscribe",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({subscription:json,reminderMinutes:minutes})
    });
    const j=await r.json();
    if(!r.ok){
      const raw=String(j.error||"");
      if(raw.includes("push_subscriptions")) throw new Error("Push notifications need one final database setup step before they can be enabled.");
      throw new Error(raw||"Could not save push subscription.");
    }
  }

  async function enable(){
    if(!supported) return;
    setBusy(true);setStatus("");
    try{
      const supabase=getSupabaseBrowser();
      const {data}=await supabase?.auth.getSession() || {data:{session:null}};
      if(!data.session){
        setStatus("Please sign in first, then enable notifications.");
        return;
      }

      const result=await Notification.requestPermission();
      setPermission(result);
      if(result!=="granted"){
        setStatus("Notification permission was not granted.");
        return;
      }

      const registration=await navigator.serviceWorker.ready;
      let subscription=await registration.pushManager.getSubscription();
      if(!subscription){
        const publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if(!publicKey) throw new Error("Push key is missing from the app.");
        subscription=await registration.pushManager.subscribe({
          userVisibleOnly:true,
          applicationServerKey:urlBase64ToUint8Array(publicKey)
        });
      }

      await syncSubscription(subscription,lead);
      localStorage.setItem("neuro-reminder-minutes",String(lead));
      setEnabled(true);
      setStatus("App reminders are enabled on this device.");
    }catch(e:any){
      setStatus(e.message||"Could not enable app reminders.");
    }finally{
      setBusy(false);
    }
  }

  async function disable(){
    setBusy(true);setStatus("");
    try{
      const registration=await navigator.serviceWorker.ready;
      const subscription=await registration.pushManager.getSubscription();
      if(subscription){
        await authFetch("/api/push/subscribe",{
          method:"DELETE",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({endpoint:subscription.endpoint})
        });
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setStatus("App reminders are disabled on this device.");
    }catch(e:any){
      setStatus(e.message||"Could not disable app reminders.");
    }finally{
      setBusy(false);
    }
  }

  async function sendTest(){
    setBusy(true);setStatus("");
    try{
      const r=await authFetch("/api/push/test",{method:"POST"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not send test notification.");
      setStatus("Test notification sent — check this device.");
    }catch(e:any){
      setStatus(e.message||"Could not send test notification.");
    }finally{
      setBusy(false);
    }
  }

  async function changeLead(value:number){
    setLead(value);
    localStorage.setItem("neuro-reminder-minutes",String(value));
    if(enabled){
      try{
        const registration=await navigator.serviceWorker.ready;
        const subscription=await registration.pushManager.getSubscription();
        if(subscription) await syncSubscription(subscription,value);
        setStatus(`Reminder time updated to ${value} minutes before.`);
      }catch(e:any){
        setStatus(e.message||"Could not update reminder time.");
      }
    }
  }

  return <section className="card notification-card">
    <span className="eyebrow">REMINDERS</span>
    <h2>App notifications</h2>
    <p>Get a Neuroethology Lab notification for responsibilities you sign up for, even when the installed app is closed.</p>

    {supported===false ? <p>Your browser/device does not support web push notifications here. Google Calendar reminders are still available.</p> : <>
      <div className="settings-row">
        {!enabled
          ? <button className="btn" onClick={enable} disabled={busy}>{busy?"Enabling…":"Enable app notifications"}</button>
          : <>
              <button className="btn secondary" onClick={disable} disabled={busy}>{busy?"Updating…":"Disable app notifications"}</button>
              <button className="btn" onClick={sendTest} disabled={busy}>{busy?"Sending…":"Send test notification"}</button>
            </>}
        <label className="reminder-select">
          <span>Remind me</span>
          <select className="input" value={lead} onChange={e=>changeLead(Number(e.target.value))}>
            {choices.map(n=><option value={n} key={n}>{n} minutes before</option>)}
          </select>
        </label>
      </div>
      {permission==="denied"&&<p className="form-message">Notifications are blocked in this browser. Change the site permission and try again.</p>}
      {status&&<p className="small notification-note">{status}</p>}
      <p className="small notification-note">On iPhone/iPad, install the app to your Home Screen before enabling push notifications.</p>
    </>}
  </section>
}
