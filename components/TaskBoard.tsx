"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";
import { authFetch } from "../lib/authFetch";

type CommitmentRow={
  id:string;
  data:{
    task:string;
    name:string;
    email?:string;
    date:string;
    start:string;
    end:string;
    notes?:string;
    completedAt?:string;
    completedBy?:string;
  }
};

type DayRow={date:string;displayDate:string;day:string};

const slots=[
  {task:"Switching on lights",label:"Switching on lights",time:"10:00",end:"10:15"},
  {task:"Feeding fishes",label:"Feeding fishes",time:"11:00",end:"11:15"},
  {task:"Switching off lights",label:"Switching off lights",time:"22:00",end:"22:15"},
];

function indiaDateParts(date=new Date()){
  const parts=new Intl.DateTimeFormat("en-CA",{
    timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"
  }).formatToParts(date);
  const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return {year:Number(map.year),month:Number(map.month),day:Number(map.day)};
}

function rollingDates(count=14):DayRow[]{
  const p=indiaDateParts();
  const start=new Date(Date.UTC(p.year,p.month-1,p.day));
  return Array.from({length:count},(_,i)=>{
    const d=new Date(start.getTime()+i*86400000);
    const yyyy=d.getUTCFullYear();
    const mm=String(d.getUTCMonth()+1).padStart(2,"0");
    const dd=String(d.getUTCDate()).padStart(2,"0");
    const iso=`${yyyy}-${mm}-${dd}`;
    const display=`${dd}/${mm}/${yyyy}`;
    const day=new Intl.DateTimeFormat("en-US",{weekday:"long",timeZone:"UTC"}).format(d);
    return {date:iso,displayDate:display,day};
  });
}

function googleCalendarUrl(row:CommitmentRow){
  const compact=(d:string,t:string)=>d.replaceAll("-","")+"T"+t.replace(":","")+"00";
  const p=new URLSearchParams({
    action:"TEMPLATE",
    text:`Neuroethology Lab — ${row.data.task}`,
    dates:`${compact(row.data.date,row.data.start)}/${compact(row.data.date,row.data.end)}`,
    ctz:"Asia/Kolkata",
    details:`Lab responsibility: ${row.data.task}. Assigned to ${row.data.name}.`
  });
  return "https://calendar.google.com/calendar/render?"+p.toString();
}

export function TaskBoard(){
  const [rows,setRows]=useState<CommitmentRow[]>([]);
  const [dates,setDates]=useState<DayRow[]>([]);
  const [user,setUser]=useState<{name:string,email:string}|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busyKey,setBusyKey]=useState("");

  async function load(){
    setError("");
    try{
      const r=await authFetch("/api/records?kind=commitments",{cache:"no-store"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not load sign-ups.");
      setRows(j.records||[]);
    }catch(e:any){setError(e.message);}
  }

  useEffect(()=>{
    setDates(rollingDates(14));
    load();
    const supabase=getSupabaseBrowser();
    supabase?.auth.getSession().then(({data})=>{
      const u=data.session?.user;
      if(u) setUser({name:String(u.user_metadata?.full_name||u.email||"Lab member"),email:u.email||""});
    });
    let subscription:any=null;
    if(supabase){
      const result=supabase.auth.onAuthStateChange((_e,s)=>{
        const u=s?.user;
        setUser(u?{name:String(u.user_metadata?.full_name||u.email||"Lab member"),email:u.email||""}:null);
      });
      subscription=result.data.subscription;
    }
    return()=>subscription?.unsubscribe?.();
  },[]);

  function findCommitment(date:string,task:string){
    return rows.find(r=>r.data.date===date && r.data.task===task);
  }

  async function signUp(day:DayRow,slot:typeof slots[number]){
    if(!user) return;
    const key=`${day.date}-${slot.task}`;
    setBusyKey(key);setError("");setMessage("");
    if(findCommitment(day.date,slot.task)){
      setError("That slot has already been taken.");
      setBusyKey("");
      return;
    }
    try{
      const r=await authFetch("/api/records",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          kind:"commitments",
          data:{
            task:slot.task,
            name:user.name,
            email:user.email,
            date:day.date,
            start:slot.time,
            end:slot.end,
            notes:"Responsibility rota sign-up"
          }
        })
      });
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not save sign-up.");
      setMessage(`You are signed up for ${slot.label} on ${day.displayDate}.`);
      await load();
    }catch(e:any){setError(e.message);}
    finally{setBusyKey("");}
  }

  async function complete(row:CommitmentRow){
    if(!user) return;
    setBusyKey(row.id+"-complete");setError("");setMessage("");
    try{
      const next={
        ...row.data,
        completedAt:new Date().toISOString(),
        completedBy:user.name
      };
      const r=await authFetch("/api/records",{
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:row.id,data:next})
      });
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not mark task complete.");
      setMessage(`${row.data.task} marked complete.`);
      await load();
    }catch(e:any){setError(e.message);}
    finally{setBusyKey("");}
  }

  async function release(row:CommitmentRow){
    if(!confirm("Release this slot?")) return;
    setBusyKey(row.id);setError("");setMessage("");
    try{
      const r=await authFetch("/api/records?id="+encodeURIComponent(row.id),{method:"DELETE"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not release slot.");
      setMessage("Slot released.");
      await load();
    }catch(e:any){setError(e.message);}
    finally{setBusyKey("");}
  }

  return <>
    <div className="rota-note">
      <strong>Rolling 14-day responsibility rota</strong>
      <span>The dates update automatically each day.</span>
    </div>

    {message&&<div className="success-message">{message}</div>}
    {error&&<div className="error-message">{error}</div>}

    {!user&&<div className="notice-card"><p><Link className="text-link" href="/login">Log in or create an account</Link> to sign up for a responsibility slot.</p></div>}

    <div className="rota-scroll">
      <table className="rota-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            {slots.map(slot=><th key={slot.task}>{slot.label}<span>{slot.time==="22:00"?"10 pm":slot.time==="11:00"?"11 am":"10 am"}</span></th>)}
          </tr>
        </thead>
        <tbody>
          {dates.map(day=><tr key={day.date}>
            <td className="rota-date">{day.displayDate}</td>
            <td>{day.day}</td>
            {slots.map(slot=>{
              const row=findCommitment(day.date,slot.task);
              const key=`${day.date}-${slot.task}`;
              if(!row){
                return <td key={slot.task}>
                  {user
                    ? <button className="slot-button" disabled={busyKey===key} onClick={()=>signUp(day,slot)}>{busyKey===key?"Saving…":"Sign up"}</button>
                    : <Link className="slot-button slot-link" href="/login">Sign in</Link>}
                </td>;
              }
              const mine=!!user && user.email===row.data.email;
              return <td key={slot.task} className={`slot-taken ${row.data.completedAt?"slot-complete":""}`}>
                <strong>{row.data.name}</strong>
                {row.data.completedAt&&<span className="task-complete-label">✓ Completed</span>}
                <div className="slot-actions">
                  <a className="mini-action" href={googleCalendarUrl(row)} target="_blank" rel="noreferrer">Google Calendar</a>
                  {!row.data.completedAt&&user&&<button className="mini-action complete-link" disabled={busyKey===row.id+"-complete"} onClick={()=>complete(row)}>{busyKey===row.id+"-complete"?"Saving…":"Mark complete"}</button>}
                  {mine&&<button className="mini-action danger-link" disabled={busyKey===row.id} onClick={()=>release(row)}>{busyKey===row.id?"Removing…":"Release"}</button>}
                </div>
              </td>;
            })}
          </tr>)}
        </tbody>
      </table>
    </div>

    <p className="rota-footnote">Calendar events are created as 15-minute responsibility blocks beginning at the rota time. You can edit the duration in Google Calendar before saving.</p>
  </>;
}
