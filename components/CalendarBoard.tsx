"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { authFetch } from "../lib/authFetch";

type EventData={title:string;date:string;start:string;end:string;details:string;category:string};
type EventRow={id:string;data:EventData};
const weekdays=["SUN","MON","TUE","WED","THU","FRI","SAT"];
const blank:EventData={title:"",date:"",start:"",end:"",details:"",category:"Other"};

function monthDays(year:number,month:number){
  const first=new Date(year,month,1);
  const last=new Date(year,month+1,0);
  const cells:(Date|null)[]=Array(first.getDay()).fill(null);
  for(let d=1;d<=last.getDate();d++) cells.push(new Date(year,month,d));
  while(cells.length%7) cells.push(null);
  return cells;
}
function iso(d:Date){
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function compact(d:string,t:string){
  return d.replaceAll("-","")+"T"+(t||"09:00").replace(":","")+"00";
}
function gcal(data:EventData){
  const start=data.start||"09:00";
  const end=data.end||start;
  const p=new URLSearchParams({
    action:"TEMPLATE",
    text:data.title,
    dates:`${compact(data.date,start)}/${compact(data.date,end)}`,
    ctz:"Asia/Kolkata",
    details:data.details||"Neuroethology Lab event"
  });
  return "https://calendar.google.com/calendar/render?"+p.toString();
}

export function CalendarBoard(){
  const now=new Date();
  const [cursor,setCursor]=useState(new Date(now.getFullYear(),now.getMonth(),1));
  const [rows,setRows]=useState<EventRow[]>([]);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [form,setForm]=useState<EventData>(blank);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    setError("");
    const r=await authFetch("/api/records?kind=calendar_events",{cache:"no-store"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not load calendar.");return;}
    setRows(j.records||[]);
  }
  useEffect(()=>{load()},[]);

  const cells=useMemo(()=>monthDays(cursor.getFullYear(),cursor.getMonth()),[cursor]);
  const monthLabel=new Intl.DateTimeFormat("en-US",{month:"long",year:"numeric"}).format(cursor).toUpperCase();

  function recurringFor(day:Date){
    const out:{title:string;time:string}[]=[];
    if(day.getDay()===1) out.push({title:"ASP Thesis Meeting",time:"9:30–10:30 AM"});
    if(day.getDay()===3) out.push({title:"Lab Meeting",time:"1:30–2:30 PM"});
    return out;
  }
  function customFor(day:Date){const s=iso(day);return rows.filter(r=>r.data.date===s);}

  function beginAdd(date?:string){
    setEditing(null);setForm({...blank,date:date||""});setMessage("");setError("");setOpen(true);
  }
  function beginEdit(row:EventRow){setEditing(row.id);setForm({...blank,...row.data});setMessage("");setError("");setOpen(true);}
  async function save(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!form.title.trim()||!form.date){setError("Title and date are required.");return;}
    const r=await authFetch("/api/records",{
      method:editing?"PATCH":"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(editing?{id:editing,data:form}:{kind:"calendar_events",data:form})
    });
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not save event.");return;}
    setMessage(editing?"Event updated.":"Event added.");
    setOpen(false);setEditing(null);setForm(blank);await load();
  }
  async function remove(){
    if(!editing||!confirm("Delete this calendar event?")) return;
    const r=await authFetch("/api/records?id="+encodeURIComponent(editing),{method:"DELETE"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not delete event.");return;}
    setMessage("Event deleted.");setOpen(false);setEditing(null);setForm(blank);await load();
  }

  return <>
    <div className="calendar-toolbar">
      <button className="btn secondary" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))}>← Previous</button>
      <h2>{monthLabel}</h2>
      <button className="btn secondary" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))}>Next →</button>
    </div>
    <div className="actions centered-actions calendar-add-row"><button className="btn" onClick={()=>beginAdd()}>Add calendar event</button></div>
    {message&&<div className="success-message">{message}</div>}
    {error&&!open&&<div className="error-message">{error}</div>}

    <div className="month-calendar-wrap">
      <div className="month-calendar">
        {weekdays.map(w=><div className="calendar-weekday" key={w}>{w}</div>)}
        {cells.map((day,i)=>day?<button className="calendar-day" key={i} onClick={()=>beginAdd(iso(day))}>
          <span className="calendar-day-number">{day.getDate()}</span>
          <div className="calendar-day-events">
            {recurringFor(day).map(x=><span className="calendar-event-chip recurring" key={x.title}><b>{x.title}</b><small>{x.time}</small></span>)}
            {customFor(day).map(row=><span className="calendar-event-chip custom" key={row.id} onClick={e=>{e.stopPropagation();beginEdit(row)}}><b>{row.data.title}</b>{row.data.start&&<small>{row.data.start}</small>}</span>)}
          </div>
        </button>:<div className="calendar-day empty" key={i}/>)}
      </div>
    </div>

    <section className="calendar-legend card roomy">
      <h3>Weekly recurring meetings</h3>
      <p><strong>ASP Thesis Meeting:</strong> every Monday, 9:30–10:30 AM</p>
      <p><strong>Lab Meeting:</strong> every Wednesday, 1:30–2:30 PM</p>
    </section>

    {open&&<div className="modal-backdrop"><div className="modal-card">
      <h2>{editing?"Edit calendar event":"Add calendar event"}</h2>
      <form className="stack" onSubmit={save}>
        <label className="form-field"><span>Title *</span><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label className="form-field"><span>Date *</span><input className="input" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <div className="calendar-time-pair">
          <label className="form-field"><span>Start</span><input className="input" type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label>
          <label className="form-field"><span>End</span><input className="input" type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label>
        </div>
        <label className="form-field"><span>Category</span><select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Meeting</option><option>Deadline</option><option>Conference</option><option>Experiment</option><option>Other</option></select></label>
        <label className="form-field"><span>Details</span><textarea className="input" rows={4} value={form.details} onChange={e=>setForm({...form,details:e.target.value})}/></label>
        {form.title&&form.date&&<a className="btn secondary" href={gcal(form)} target="_blank" rel="noreferrer">Add to Google Calendar</a>}
        {error&&<div className="error-message">{error}</div>}
        <div className="actions centered-actions"><button className="btn" type="submit">Save</button>{editing&&<button className="btn secondary danger" type="button" onClick={remove}>Delete</button>}<button className="btn secondary" type="button" onClick={()=>{setOpen(false);setEditing(null);setForm(blank);setError("")}}>Cancel</button></div>
      </form>
    </div></div>}
  </>;
}
