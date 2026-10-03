"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectDetail(){
  const params=useParams<{id:string}>();
  const [record,setRecord]=useState<any>(null);
  const [error,setError]=useState("");
  useEffect(()=>{
    fetch("/api/records?id="+encodeURIComponent(params.id),{cache:"no-store"})
      .then(async r=>{const j=await r.json();if(!r.ok)throw new Error(j.error||"Could not load project.");setRecord(j.record);})
      .catch(e=>setError(e.message));
  },[params.id]);
  if(error)return <><Link href="/projects" className="text-link">← Back to Projects</Link><div className="error-message">{error}</div></>;
  if(!record)return <p>Loading…</p>;
  const d=record.data||{};
  return <>
    <Link href="/projects" className="text-link">← Back to Projects</Link>
    <section className="guide-hero"><span className="eyebrow">PROJECT HUB</span><h1 className="page-title guide-title">{d.title||"Untitled project"}</h1>{d.summary&&<p className="hero-copy">{d.summary}</p>}</section>
    <div className="guide-grid">
      {d.team&&<section className="card guide-card"><h2>Team</h2><p>{d.team}</p></section>}
      {d.methods&&<section className="card guide-card"><h2>Methods</h2><p>{d.methods}</p></section>}
      {d.progress&&<section className="card guide-card"><h2>Progress</h2><p>{d.progress}</p></section>}
      {d.updates&&<section className="card guide-card"><h2>Latest update</h2><p>{d.updates}</p></section>}
      {d.status&&<section className="card guide-card"><h2>Status</h2><p>{d.status}</p></section>}
    </div>
  </>;
}
