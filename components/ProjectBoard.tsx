"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Row={id:string;data:{title?:string;summary?:string;team?:string;methods?:string;progress?:string;updates?:string;status?:string}};
const blank={title:"",summary:"",team:"",methods:"",progress:"",updates:"",status:""};

export function ProjectBoard(){
  const [rows,setRows]=useState<Row[]>([]);
  const [form,setForm]=useState(blank);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const r=await fetch("/api/records?kind=projects",{cache:"no-store"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not load projects.");return;}
    setRows(j.records||[]);
  }
  useEffect(()=>{load()},[]);

  async function save(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!form.title.trim()){setError("Project title is required.");return;}
    if(!form.summary.trim()){setError("Summary is required.");return;}
    const r=await fetch("/api/records",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing?{id:editing,data:form}:{kind:"projects",data:form})});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not save project.");return;}
    setMessage(editing?"Project updated.":"Project added.");setOpen(false);setEditing(null);setForm(blank);await load();
  }

  async function remove(id:string){
    if(!confirm("Delete this project?")) return;
    const r=await fetch("/api/records?id="+encodeURIComponent(id),{method:"DELETE"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not delete project.");return;}
    setMessage("Project deleted.");await load();
  }

  return <>
    <div className="actions centered-actions" style={{margin:"18px 0"}}><button className="btn" onClick={()=>{setEditing(null);setForm(blank);setOpen(true);setError("");}}>Add project</button></div>
    {message&&<div className="success-message">{message}</div>}
    {error&&<div className="error-message">{error}</div>}
    {open&&<div className="modal-backdrop"><div className="modal-card">
      <h2>{editing?"Edit project":"Add project"}</h2>
      <form className="stack" onSubmit={save}>
        <label className="form-field"><span>Project title *</span><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label className="form-field"><span>Summary *</span><textarea className="input" rows={4} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></label>
        <label className="form-field"><span>Team</span><input className="input" value={form.team} onChange={e=>setForm({...form,team:e.target.value})}/></label>
        <label className="form-field"><span>Methods</span><textarea className="input" rows={4} value={form.methods} onChange={e=>setForm({...form,methods:e.target.value})}/></label>
        <label className="form-field"><span>Progress / current stage</span><input className="input" value={form.progress} onChange={e=>setForm({...form,progress:e.target.value})}/></label>
        <label className="form-field"><span>Latest update</span><textarea className="input" rows={4} value={form.updates} onChange={e=>setForm({...form,updates:e.target.value})}/></label>
        <label className="form-field"><span>Status</span><select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="">Choose…</option><option>Planning</option><option>Active</option><option>Paused</option><option>Completed</option></select></label>
        <div className="actions centered-actions"><button className="btn">Save</button><button type="button" className="btn secondary" onClick={()=>setOpen(false)}>Cancel</button></div>
      </form>
    </div></div>}
    <div className="grid crud-grid">{rows.map(row=><div className="card crud-card" key={row.id}>
      <span className="pill">Project hub</span><h3>{row.data.title||"Untitled project"}</h3><p>{row.data.summary}</p>
      <div className="actions centered-actions"><Link className="btn" href={"/projects/"+row.id}>Open project</Link><button className="btn secondary" onClick={()=>{setEditing(row.id);setForm({...blank,...row.data});setOpen(true);setError("");}}>Edit</button><button className="btn secondary danger" onClick={()=>remove(row.id)}>Delete</button></div>
    </div>)}</div>
  </>;
}
