"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";

type Row={id:string;data:{task:string;name:string;email?:string;date:string;start:string;end:string;notes?:string}};
const tasks=["Feeding","Cleaning","Other lab tasks"];

function googleUrl(row:Row){
  const compact=(d:string,t:string)=>d.replaceAll("-","")+"T"+t.replace(":","")+"00";
  const p=new URLSearchParams({
    action:"TEMPLATE",
    text:`Neuroethology Lab — ${row.data.task}`,
    dates:`${compact(row.data.date,row.data.start)}/${compact(row.data.date,row.data.end)}`,
    ctz:"Asia/Kolkata",
    details:`Assigned to ${row.data.name}.${row.data.notes?" "+row.data.notes:""}`
  });
  return "https://calendar.google.com/calendar/render?"+p.toString();
}

export function TaskBoard(){
  const [rows,setRows]=useState<Row[]>([]);
  const [user,setUser]=useState<{name:string,email:string}|null>(null);
  const [draft,setDraft]=useState<Record<string,{date:string;start:string;end:string;notes:string}>>({});
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    setError("");
    try{
      const r=await fetch("/api/records?kind=commitments",{cache:"no-store"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not load commitments.");
      setRows(j.records||[]);
    }catch(e:any){setError(e.message);}
  }

  useEffect(()=>{
    load();
    const supabase=getSupabaseBrowser();
    supabase?.auth.getSession().then(({data})=>{
      const u=data.session?.user;
      if(u) setUser({name:String(u.user_metadata?.full_name||u.email||"Lab member"),email:u.email||""});
    });
    const {data:sub}=supabase?.auth.onAuthStateChange((_e,s)=>{
      const u=s?.user;setUser(u?{name:String(u.user_metadata?.full_name||u.email||"Lab member"),email:u.email||""}:null);
    })||{data:{sub:null as any}};
    return()=>sub?.subscription?.unsubscribe?.();
  },[]);

  function patch(task:string,key:"date"|"start"|"end"|"notes",value:string){
    setDraft(p=>({...p,[task]:{date:p[task]?.date||"",start:p[task]?.start||"09:00",end:p[task]?.end||"10:00",notes:p[task]?.notes||"",[key]:value}}));
  }

  async function add(task:string){
    if(!user) return;
    const d=draft[task]||{date:"",start:"09:00",end:"10:00",notes:""};
    if(!d.date){setError("Choose a date before signing up.");return;}
    setError("");setMessage("");
    const r=await fetch("/api/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"commitments",data:{task,name:user.name,email:user.email,...d}})});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not save commitment.");return;}
    setMessage("Commitment saved.");setDraft({...draft,[task]:{date:"",start:"09:00",end:"10:00",notes:""}});await load();
  }

  async function remove(id:string){
    if(!confirm("Delete this commitment?")) return;
    const r=await fetch("/api/records?id="+encodeURIComponent(id),{method:"DELETE"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not delete commitment.");return;}
    setMessage("Commitment deleted.");await load();
  }

  return <>
    {message&&<div className="success-message">{message}</div>}
    {error&&<div className="error-message">{error}</div>}
    <div className="grid task-grid" style={{marginTop:20}}>
      {tasks.map(task=>{
        const mine=rows.filter(r=>r.data.task===task);
        const d=draft[task]||{date:"",start:"09:00",end:"10:00",notes:""};
        return <div className="card task-card" key={task}>
          <h3>{task}</h3>
          {mine.length>0?<div className="commitment-list">{mine.map(row=><div className="commitment" key={row.id}>
            <strong>{row.data.name}</strong>
            <span>{row.data.date} · {row.data.start}–{row.data.end}</span>
            {row.data.notes&&<span>{row.data.notes}</span>}
            <div className="actions centered-actions">
              <a className="btn secondary" href={googleUrl(row)} target="_blank" rel="noreferrer">Add to Google Calendar</a>
              {user?.email===row.data.email&&<button className="btn secondary danger" onClick={()=>remove(row.id)}>Delete</button>}
            </div>
          </div>)}</div>:<p>No commitments yet.</p>}
          {user?<div className="task-entry">
            <label><span>Date</span><input className="input" type="date" value={d.date} onChange={e=>patch(task,"date",e.target.value)}/></label>
            <label><span>Start</span><input className="input" type="time" value={d.start} onChange={e=>patch(task,"start",e.target.value)}/></label>
            <label><span>End</span><input className="input" type="time" value={d.end} onChange={e=>patch(task,"end",e.target.value)}/></label>
            <label className="wide-field"><span>Notes</span><input className="input" value={d.notes} onChange={e=>patch(task,"notes",e.target.value)} placeholder="Optional details"/></label>
            <button className="btn" onClick={()=>add(task)}>Sign up</button>
          </div>:<Link className="btn" href="/login">Log in to sign up</Link>}
        </div>
      })}
    </div>
  </>
}
