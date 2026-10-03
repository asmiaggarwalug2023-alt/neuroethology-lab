"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Field={key:string;label:string;required?:boolean;type?:"text"|"email"|"date"|"textarea"|"select";options?:string[]};
type RecordRow={id:string;kind:string;data:Record<string,string>};

export function CrudBoard({kind,fields,addLabel,emptyText}:{kind:string;fields:Field[];addLabel:string;emptyText:string}){
  const blank=useMemo(()=>Object.fromEntries(fields.map(f=>[f.key,""])),[fields]);
  const [records,setRecords]=useState<RecordRow[]>([]);
  const [form,setForm]=useState<Record<string,string>>(blank);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);setError("");
    try{
      const r=await fetch(`/api/records?kind=${encodeURIComponent(kind)}`,{cache:"no-store"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not load records.");
      setRecords(j.records||[]);
    }catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{load()},[kind]);

  function beginAdd(){setEditing(null);setForm(blank);setMessage("");setError("");setOpen(true)}
  function beginEdit(row:RecordRow){setEditing(row.id);setForm({...blank,...row.data});setMessage("");setError("");setOpen(true)}
  function cancel(){setOpen(false);setEditing(null);setForm(blank);setError("");}

  async function save(e:FormEvent){
    e.preventDefault();setMessage("");setError("");
    for(const f of fields){if(f.required && !String(form[f.key]||"").trim()){setError(`${f.label} is required.`);return;}}
    try{
      const r=await fetch("/api/records",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing?{id:editing,data:form}:{kind,data:form})});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not save.");
      setMessage(editing?"Changes saved.":"Saved successfully.");
      setOpen(false);setEditing(null);setForm(blank);await load();
    }catch(e:any){setError(e.message);}
  }

  async function remove(id:string){
    if(!confirm("Delete this item?")) return;
    setError("");setMessage("");
    try{
      const r=await fetch(`/api/records?id=${encodeURIComponent(id)}`,{method:"DELETE"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not delete.");
      setMessage("Deleted successfully.");await load();
    }catch(e:any){setError(e.message);}
  }

  return <>
    <div className="actions centered-actions" style={{margin:"18px 0"}}>
      <button className="btn" onClick={beginAdd}>{addLabel}</button>
    </div>
    {message && <div className="success-message">{message}</div>}
    {error && <div className="error-message">{error}</div>}

    {open && <div className="modal-backdrop" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true">
        <h2>{editing?"Edit":"Add"} {addLabel.replace(/^Add /,"").toLowerCase()}</h2>
        <form className="stack" onSubmit={save}>
          {fields.map(f=><label key={f.key} className="form-field">
            <span>{f.label}{f.required?" *":""}</span>
            {f.type==="textarea"?<textarea className="input" rows={4} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>:f.type==="select"?<select className="input" value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}><option value="">Choose…</option>{(f.options||[]).map(o=><option key={o}>{o}</option>)}</select>:<input className="input" type={f.type||"text"} value={form[f.key]||""} onChange={e=>setForm({...form,[f.key]:e.target.value})}/>}
          </label>)}
          {error && <div className="error-message">{error}</div>}
          <div className="actions centered-actions"><button className="btn" type="submit">Save</button><button className="btn secondary" type="button" onClick={cancel}>Cancel</button></div>
        </form>
      </div>
    </div>}

    {loading?<p>Loading…</p>:records.length===0?<div className="card roomy"><p>{emptyText}</p></div>:<div className="grid crud-grid">
      {records.map(row=><div className="card crud-card" key={row.id}>
        <h3>{row.data[fields[0].key]||"Untitled"}</h3>
        {fields.slice(1).map(f=>row.data[f.key]?<p key={f.key}><strong>{f.label}:</strong> {row.data[f.key]}</p>:null)}
        <div className="actions centered-actions"><button className="btn secondary" onClick={()=>beginEdit(row)}>Edit</button><button className="btn secondary danger" onClick={()=>remove(row.id)}>Delete</button></div>
      </div>)}
    </div>}
  </>;
}
