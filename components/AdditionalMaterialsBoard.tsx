"use client";
import { FormEvent, useEffect, useState } from "react";
import { authFetch } from "../lib/authFetch";

type MaterialData={title:string;driveUrl:string;description:string};
type Row={id:string;data:MaterialData};
const blank:MaterialData={title:"",driveUrl:"",description:""};

function validDriveUrl(value:string){
  try{
    const u=new URL(value);
    return ["drive.google.com","docs.google.com"].includes(u.hostname);
  }catch{return false;}
}

export function AdditionalMaterialsBoard(){
  const [rows,setRows]=useState<Row[]>([]);
  const [form,setForm]=useState<MaterialData>(blank);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    const r=await authFetch("/api/records?kind=materials",{cache:"no-store"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not load materials.");return;}
    setRows(j.records||[]);
  }
  useEffect(()=>{load()},[]);

  function add(){setEditing(null);setForm(blank);setError("");setMessage("");setOpen(true)}
  function edit(row:Row){setEditing(row.id);setForm({...blank,...row.data});setError("");setMessage("");setOpen(true)}
  async function save(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!form.title.trim()){setError("Title is required.");return;}
    if(!validDriveUrl(form.driveUrl)){setError("Please paste a Google Drive or Google Docs link.");return;}
    const r=await authFetch("/api/records",{
      method:editing?"PATCH":"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(editing?{id:editing,data:form}:{kind:"materials",data:form})
    });
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not save material.");return;}
    setMessage(editing?"Material updated.":"Material added.");
    setOpen(false);setEditing(null);setForm(blank);await load();
  }
  async function remove(id:string){
    if(!confirm("Delete this material link?")) return;
    const r=await authFetch("/api/records?id="+encodeURIComponent(id),{method:"DELETE"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not delete material.");return;}
    setMessage("Material deleted.");await load();
  }

  return <>
    <div className="actions centered-actions" style={{margin:"18px 0"}}><button className="btn" onClick={add}>Add Google Drive link</button></div>
    {message&&<div className="success-message">{message}</div>}
    {error&&!open&&<div className="error-message">{error}</div>}
    {rows.length===0?<div className="card roomy"><p>No additional material has been added yet.</p></div>:
      <div className="grid crud-grid">{rows.map(row=><article className="card crud-card" key={row.id}>
        <h3>{row.data.title}</h3>
        {row.data.description&&<p>{row.data.description}</p>}
        <a className="btn secondary" href={row.data.driveUrl} target="_blank" rel="noreferrer">Open in Google Drive</a>
        <div className="actions centered-actions"><button className="btn secondary" onClick={()=>edit(row)}>Edit</button><button className="btn secondary danger" onClick={()=>remove(row.id)}>Delete</button></div>
      </article>)}</div>}

    {open&&<div className="modal-backdrop"><div className="modal-card">
      <h2>{editing?"Edit material":"Add material"}</h2>
      <form className="stack" onSubmit={save}>
        <label className="form-field"><span>Title *</span><input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label className="form-field"><span>Google Drive / Google Docs link *</span><input className="input" type="url" value={form.driveUrl} onChange={e=>setForm({...form,driveUrl:e.target.value})} placeholder="https://drive.google.com/..."/></label>
        <label className="form-field"><span>Description</span><textarea className="input" rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
        <p className="small">PDF uploads are disabled. Add a Drive or Docs link instead.</p>
        {error&&<div className="error-message">{error}</div>}
        <div className="actions centered-actions"><button className="btn" type="submit">Save</button><button className="btn secondary" type="button" onClick={()=>{setOpen(false);setError("")}}>Cancel</button></div>
      </form>
    </div></div>}
  </>;
}
