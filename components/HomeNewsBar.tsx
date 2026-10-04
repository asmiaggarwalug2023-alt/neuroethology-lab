"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { authFetch } from "../lib/authFetch";

type CalendarRow={id:string;data:{title:string;date:string;start?:string}};
type NewsRow={id:string;data:{text:string;date?:string}};
const fmt=new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short"});

function todayStart(){
  const d=new Date();d.setHours(0,0,0,0);return d;
}
function upcomingRecurring(){
  const out:{date:Date;text:string}[]=[];
  const base=todayStart();
  for(let i=0;i<14;i++){
    const d=new Date(base);d.setDate(base.getDate()+i);
    if(d.getDay()===1) out.push({date:new Date(d),text:"ASP Thesis Meeting · 9:30 AM"});
    if(d.getDay()===3) out.push({date:new Date(d),text:"Lab Meeting · 1:30 PM"});
  }
  return out;
}

export function HomeNewsBar(){
  const [events,setEvents]=useState<CalendarRow[]>([]);
  const [news,setNews]=useState<NewsRow[]>([]);
  const [open,setOpen]=useState(false);
  const [text,setText]=useState("");
  const [error,setError]=useState("");

  async function load(){
    try{
      const [a,b]=await Promise.all([
        authFetch("/api/records?kind=calendar_events",{cache:"no-store"}),
        authFetch("/api/records?kind=news",{cache:"no-store"})
      ]);
      const [ja,jb]=await Promise.all([a.json(),b.json()]);
      if(a.ok) setEvents(ja.records||[]);
      if(b.ok) setNews(jb.records||[]);
    }catch{}
  }
  useEffect(()=>{load()},[]);

  const items=useMemo(()=>{
    const now=todayStart();
    const eventItems=events
      .map(r=>({date:new Date(r.data.date+"T00:00:00"),text:`${r.data.title}${r.data.start?" · "+r.data.start:""}`}))
      .filter(x=>x.date>=now)
      .sort((a,b)=>a.date.getTime()-b.date.getTime())
      .slice(0,3);
    const recurring=upcomingRecurring().slice(0,2);
    const updates=news.slice(0,2).map(n=>({date:n.data.date?new Date(n.data.date+"T00:00:00"):now,text:n.data.text}));
    return [...updates,...eventItems,...recurring].slice(0,5);
  },[events,news]);

  async function save(e:FormEvent){
    e.preventDefault();setError("");
    if(!text.trim()){setError("Write an update first.");return;}
    const d=new Date();
    const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
    const r=await authFetch("/api/records",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"news",data:{text:text.trim(),date}})});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not share update.");return;}
    setText("");setOpen(false);await load();
  }

  return <>
    <div className="home-news-bar">
      <strong>News:</strong>
      <div className="home-news-content">
        {items.length?items.map((item,i)=><span key={i}>{item.date?fmt.format(item.date)+" — ":""}{item.text}</span>):<span>No updates yet.</span>}
      </div>
      <button onClick={()=>setOpen(true)}>Share update</button>
    </div>
    {open&&<div className="modal-backdrop"><div className="modal-card">
      <h2>Share a lab update</h2>
      <form className="stack" onSubmit={save}>
        <label className="form-field"><span>Update</span><textarea className="input" rows={4} value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. Lab meeting cancelled due to biology seminar"/></label>
        {error&&<div className="error-message">{error}</div>}
        <div className="actions centered-actions"><button className="btn" type="submit">Publish</button><button className="btn secondary" type="button" onClick={()=>{setOpen(false);setError("")}}>Cancel</button></div>
      </form>
    </div></div>}
  </>;
}
