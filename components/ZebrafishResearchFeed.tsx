"use client";
import { useEffect, useState } from "react";

type Paper={id:string;title:string;authors:string;journal:string;date:string;url:string};

export function ZebrafishResearchFeed(){
  const [papers,setPapers]=useState<Paper[]>([]);
  const [updatedAt,setUpdatedAt]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/research-feed",{cache:"no-store"})
      .then(async r=>{
        const j=await r.json();
        setPapers(j.papers||[]);
        setUpdatedAt(j.updatedAt||"");
        if(j.error) setError(j.error);
      })
      .catch(()=>setError("Fresh research is temporarily unavailable."))
      .finally(()=>setLoading(false));
  },[]);

  return <section className="card roomy research-pulse">
    <span className="eyebrow">ZEBRAFISH BEHAVIOURAL NEUROSCIENCE</span>
    <h2>What&apos;s new with zebrafish research?</h2>
    <p className="research-refresh">Fresh papers are checked automatically every 12 hours.</p>

    {loading?<p>Checking the latest research…</p>:papers.length===0?<p>{error||"No recent papers found right now."}</p>:
      <div className="research-paper-list">
        {papers.slice(0,2).map(p=><a className="research-paper" href={p.url} target="_blank" rel="noreferrer" key={p.id}>
          <strong>{p.title}</strong>
          {(p.journal||p.date)&&<span>{[p.journal,p.date].filter(Boolean).join(" · ")}</span>}
          {p.authors&&<small>{p.authors}</small>}
          <em>Read paper →</em>
        </a>)}
      </div>}
    {updatedAt&&<span className="small research-updated">Last checked: {new Date(updatedAt).toLocaleString()}</span>}
  </section>;
}
