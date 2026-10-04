"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { authFetch } from "../lib/authFetch";

type ProtocolData={
  category:"Established Procedure"|"Experimental Protocol";
  name:string;
  purpose:string;
  equipment:string;
  perform:string;
  analyse:string;
  images:string[];
};

type Row={id:string;data:ProtocolData};

const blank:ProtocolData={
  category:"Established Procedure",
  name:"",
  purpose:"",
  equipment:"",
  perform:"",
  analyse:"",
  images:[]
};

async function compressImage(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Could not read image."));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("Could not process image."));
      img.onload=()=>{
        const max=1200;
        const scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.round(img.width*scale);
        canvas.height=Math.round(img.height*scale);
        const ctx=canvas.getContext("2d");
        if(!ctx){reject(new Error("Could not process image."));return;}
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",0.72));
      };
      img.src=String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProtocolBoard(){
  const [rows,setRows]=useState<Row[]>([]);
  const [form,setForm]=useState<ProtocolData>(blank);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [imageBusy,setImageBusy]=useState(false);

  async function load(){
    setLoading(true);setError("");
    try{
      const r=await authFetch("/api/records?kind=protocols",{cache:"no-store"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not load procedures.");
      setRows(j.records||[]);
    }catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{load()},[]);

  function beginAdd(category:ProtocolData["category"]){
    setEditing(null);
    setForm({...blank,category,images:[]});
    setMessage("");setError("");setOpen(true);
  }

  function beginEdit(row:Row){
    setEditing(row.id);
    setForm({...blank,...row.data,images:row.data.images||[]});
    setMessage("");setError("");setOpen(true);
  }

  function cancel(){
    setOpen(false);setEditing(null);setForm(blank);setError("");
  }

  async function addImages(e:ChangeEvent<HTMLInputElement>){
    const files=Array.from(e.target.files||[]);
    if(!files.length) return;
    if(form.images.length+files.length>3){
      setError("Please keep each procedure to 3 images or fewer.");
      e.target.value="";
      return;
    }
    setImageBusy(true);setError("");
    try{
      const images=await Promise.all(files.map(compressImage));
      setForm(prev=>({...prev,images:[...prev.images,...images]}));
    }catch(err:any){setError(err.message||"Could not add image.");}
    finally{setImageBusy(false);e.target.value="";}
  }

  async function save(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!form.name.trim()){setError("Name of procedure is required.");return;}
    if(!form.purpose.trim()){setError("Purpose / Variable is required.");return;}
    if(!form.perform.trim()){setError("How to perform? is required.");return;}
    try{
      const r=await authFetch("/api/records",{
        method:editing?"PATCH":"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(editing?{id:editing,data:form}:{kind:"protocols",data:form})
      });
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not save procedure.");
      setMessage(editing?"Procedure updated.":"Procedure added.");
      setOpen(false);setEditing(null);setForm(blank);
      await load();
    }catch(e:any){setError(e.message);}
  }

  async function remove(id:string){
    if(!confirm("Delete this procedure?")) return;
    setError("");setMessage("");
    try{
      const r=await authFetch("/api/records?id="+encodeURIComponent(id),{method:"DELETE"});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"Could not delete procedure.");
      setMessage("Procedure deleted.");
      await load();
    }catch(e:any){setError(e.message);}
  }

  const established=rows.filter(r=>r.data.category==="Established Procedure");
  function section(title:ProtocolData["category"],items:Row[]){
    return <section className="protocol-section">
      <div className="section-heading">
        <div><span className="eyebrow">{title==="Established Procedure"?"ROUTINE LAB KNOWLEDGE":"APPROVED EXPERIMENTAL METHODS"}</span><h2>{title==="Established Procedure"?"Established Procedures":"Experimental Protocols"}</h2></div>
        <button className="btn" onClick={()=>beginAdd(title)}>Add {title==="Established Procedure"?"procedure":"protocol"}</button>
      </div>
      {items.length===0?<div className="card roomy"><p>No {title==="Established Procedure"?"established procedures":"experimental protocols"} have been added yet.</p></div>:
      <div className="grid protocol-grid">{items.map(row=><article className="card protocol-card" key={row.id}>
        <span className="pill">{row.data.category}</span>
        <h3>{row.data.name}</h3>
        <div className="protocol-detail"><strong>Purpose / Variable</strong><p>{row.data.purpose}</p></div>
        {row.data.equipment&&<div className="protocol-detail"><strong>Equipment required</strong><p>{row.data.equipment}</p></div>}
        <div className="protocol-detail"><strong>How to perform?</strong><p>{row.data.perform}</p></div>
        {row.data.analyse&&<div className="protocol-detail"><strong>How to analyse?</strong><p>{row.data.analyse}</p></div>}
        {!!row.data.images?.length&&<div className="protocol-images">{row.data.images.map((src,i)=><img src={src} alt={`${row.data.name} reference ${i+1}`} key={i}/>)}</div>}
        <div className="actions centered-actions">
          <button className="btn secondary" onClick={()=>beginEdit(row)}>Edit</button>
          <button className="btn secondary danger" onClick={()=>remove(row.id)}>Delete</button>
        </div>
      </article>)}</div>}
    </section>;
  }

  return <>
    {message&&<div className="success-message">{message}</div>}
    {error&&!open&&<div className="error-message">{error}</div>}
    {section("Established Procedure",established)}

    {open&&<div className="modal-backdrop">
      <div className="modal-card protocol-modal" role="dialog" aria-modal="true">
        <h2>{editing?"Edit":"Add"} Established Procedure</h2>
        <form className="stack" onSubmit={save}>
          <label className="form-field"><span>Name of procedure *</span><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label className="form-field"><span>Purpose / Variable *</span><textarea className="input" rows={3} value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></label>
          <label className="form-field"><span>Equipment required</span><textarea className="input" rows={3} value={form.equipment} onChange={e=>setForm({...form,equipment:e.target.value})}/></label>
          <label className="form-field"><span>How to perform? *</span><textarea className="input" rows={6} value={form.perform} onChange={e=>setForm({...form,perform:e.target.value})}/></label>
          <label className="form-field"><span>How to analyse?</span><textarea className="input" rows={5} value={form.analyse} onChange={e=>setForm({...form,analyse:e.target.value})}/></label>

          <div className="form-field">
            <span>Relevant images</span>
            <label className="image-upload-button">
              <input type="file" accept="image/*" multiple onChange={addImages} disabled={imageBusy}/>
              <span>{imageBusy?"Processing images…":"Add images"}</span>
            </label>
            <span className="small">Up to 3 images. Images are compressed before saving.</span>
            {!!form.images.length&&<div className="protocol-image-editor">{form.images.map((src,i)=><div className="image-preview" key={i}>
              <img src={src} alt={`Preview ${i+1}`}/>
              <button type="button" onClick={()=>setForm({...form,images:form.images.filter((_,index)=>index!==i)})}>Remove</button>
            </div>)}</div>}
          </div>

          {error&&<div className="error-message">{error}</div>}
          <div className="actions centered-actions"><button className="btn" type="submit" disabled={imageBusy}>Save</button><button className="btn secondary" type="button" onClick={cancel}>Cancel</button></div>
        </form>
      </div>
    </div>}
  </>;
}
