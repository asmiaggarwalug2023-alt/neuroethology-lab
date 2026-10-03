"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const tasks=["Feeding","Cleaning","Other lab tasks"];

export function TaskBoard(){
  const [signed,setSigned]=useState<Record<string,string>>({});
  const [user,setUser]=useState<{name:string,email:string}|null>(null);

  useEffect(()=>{
    const s=localStorage.getItem("neuroethology-task-signups");
    if(s) setSigned(JSON.parse(s));
    const u=localStorage.getItem("neuroethology-user");
    if(u) setUser(JSON.parse(u));
  },[]);

  function toggle(task:string){
    if(!user) return;
    const next={...signed};
    if(next[task]) delete next[task]; else next[task]=user.name;
    setSigned(next);
    localStorage.setItem("neuroethology-task-signups",JSON.stringify(next));
  }

  return <div className="grid" style={{marginTop:20}}>
    {tasks.map(task=><div className="card task-card" key={task}>
      <h3>{task}</h3>
      <p>{signed[task]?<><strong>{signed[task]}</strong> is signed up.</>:"No one signed up yet."}</p>
      {user ? <button className={signed[task]?"btn secondary":"btn"} onClick={()=>toggle(task)}>{signed[task]?"Undo signup":"Sign up"}</button>
      : <Link href="/login" className="btn">Log in to sign up</Link>}
    </div>)}
  </div>
}
