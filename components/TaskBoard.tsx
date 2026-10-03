"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Signup = { name:string; date:string; start:string; end:string };
const tasks=["Feeding","Cleaning","Other lab tasks"];

function googleCalendarUrl(task:string, signup:Signup){
  const compact=(date:string,time:string)=>date.replaceAll("-","")+"T"+time.replace(":","")+"00";
  const params=new URLSearchParams({
    action:"TEMPLATE",
    text:`Neuroethology Lab — ${task}`,
    dates:`${compact(signup.date,signup.start)}/${compact(signup.date,signup.end)}`,
    ctz:"Asia/Kolkata",
    details:`Assigned lab task: ${task}. Signed up by ${signup.name}.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function TaskBoard(){
  const [signed,setSigned]=useState<Record<string,Signup>>({});
  const [user,setUser]=useState<{name:string,email:string}|null>(null);
  const [drafts,setDrafts]=useState<Record<string,{date:string;start:string;end:string}>>({});

  useEffect(()=>{
    const s=localStorage.getItem("neuroethology-task-signups");
    if(s){ try{ setSigned(JSON.parse(s)); }catch{} }
    const u=localStorage.getItem("neuroethology-user");
    if(u){ try{ setUser(JSON.parse(u)); }catch{} }
  },[]);

  function updateDraft(task:string,field:"date"|"start"|"end",value:string){
    setDrafts(prev=>({...prev,[task]:{date:prev[task]?.date||"",start:prev[task]?.start||"09:00",end:prev[task]?.end||"10:00",[field]:value}}));
  }

  function signup(task:string){
    if(!user) return;
    const draft=drafts[task] || {date:"",start:"09:00",end:"10:00"};
    if(!draft.date){ alert("Choose the task date first."); return; }
    if(!draft.start || !draft.end){ alert("Choose a start and end time."); return; }
    const next={...signed,[task]:{name:user.name,date:draft.date,start:draft.start,end:draft.end}};
    setSigned(next);
    localStorage.setItem("neuroethology-task-signups",JSON.stringify(next));
    window.dispatchEvent(new Event("neuro-tasks"));
  }

  function undo(task:string){
    const next={...signed};
    delete next[task];
    setSigned(next);
    localStorage.setItem("neuroethology-task-signups",JSON.stringify(next));
    window.dispatchEvent(new Event("neuro-tasks"));
  }

  return <div className="grid task-grid" style={{marginTop:20}}>
    {tasks.map(task=>{
      const assignment=signed[task];
      const draft=drafts[task] || {date:"",start:"09:00",end:"10:00"};
      return <div className="card task-card" key={task}>
        <h3>{task}</h3>
        {assignment ? <>
          <p><strong>{assignment.name}</strong> is signed up.</p>
          <p className="small">{assignment.date} · {assignment.start}–{assignment.end}</p>
          <div className="actions centered-actions">
            <a className="btn" href={googleCalendarUrl(task,assignment)} target="_blank" rel="noreferrer">Add to Google Calendar</a>
            {user?.name===assignment.name && <button className="btn secondary" onClick={()=>undo(task)}>Undo signup</button>}
          </div>
        </> : user ? <>
          <p>Choose when you are taking this task, then sign up.</p>
          <div className="task-time-grid">
            <label><span>Date</span><input className="input" type="date" value={draft.date} onChange={e=>updateDraft(task,"date",e.target.value)} /></label>
            <label><span>Start</span><input className="input" type="time" value={draft.start} onChange={e=>updateDraft(task,"start",e.target.value)} /></label>
            <label><span>End</span><input className="input" type="time" value={draft.end} onChange={e=>updateDraft(task,"end",e.target.value)} /></label>
          </div>
          <button className="btn" onClick={()=>signup(task)}>Sign up</button>
        </> : <Link href="/login" className="btn">Log in to sign up</Link>}
      </div>
    })}
  </div>
}
