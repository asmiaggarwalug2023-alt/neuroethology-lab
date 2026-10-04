"use client";
import { authFetch } from "../lib/authFetch";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Project={id:string;data:{title?:string}};
type Person={id:string;data:{name?:string;role?:string;email?:string;projectIds?:string[];status?:string;notes?:string;photo?:string}};

const blank={name:"",role:"",email:"",projectIds:[] as string[],status:"",notes:"",photo:""};

export function PeopleBoard(){
  const [people,setPeople]=useState<Person[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [form,setForm]=useState(blank);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<string|null>(null);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");

  async function load(){
    setError("");
    try{
      const [pr,pp]=await Promise.all([
        authFetch("/api/records?kind=people",{cache:"no-store"}),
        authFetch("/api/records?kind=projects",{cache:"no-store"})
      ]);
      const [jr,jp]=await Promise.all([pr.json(),pp.json()]);
      if(!pr.ok) throw new Error(jr.error||"Could not load people.");
      if(!pp.ok) throw new Error(jp.error||"Could not load projects.");
      setPeople(jr.records||[]);
      setProjects(jp.records||[]);
    }catch(e:any){setError(e.message);}
  }
  useEffect(()=>{load()},[]);

  async function addPhoto(e:ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];
    if(!file) return;
    setError("");
    try{
      const photo=await new Promise<string>((resolve,reject)=>{
        const reader=new FileReader();
        reader.onerror=()=>reject(new Error("Could not read that image."));
        reader.onload=()=>{
          const img=new Image();
          img.onerror=()=>reject(new Error("Could not process that image."));
          img.onload=()=>{
            const max=700;
            const scale=Math.min(1,max/Math.max(img.width,img.height));
            const canvas=document.createElement("canvas");
            canvas.width=Math.round(img.width*scale);
            canvas.height=Math.round(img.height*scale);
            const ctx=canvas.getContext("2d");
            if(!ctx){reject(new Error("Could not process that image."));return;}
            ctx.drawImage(img,0,0,canvas.width,canvas.height);
            resolve(canvas.toDataURL("image/jpeg",0.78));
          };
          img.src=String(reader.result);
        };
        reader.readAsDataURL(file);
      });
      setForm(f=>({...f,photo}));
    }catch(err:any){setError(err.message||"Could not add photo.");}
    e.target.value="";
  }

  function toggleProject(id:string){
    setForm(f=>({...f,projectIds:f.projectIds.includes(id)?f.projectIds.filter(x=>x!==id):[...f.projectIds,id]}));
  }

  function add(){setEditing(null);setForm(blank);setError("");setMessage("");setOpen(true)}
  function edit(p:Person){setEditing(p.id);setForm({...blank,...p.data,projectIds:p.data.projectIds||[]});setOpen(true);setError("");setMessage("")}
  function cancel(){setOpen(false);setEditing(null);setForm(blank);setError("")}

  async function save(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!form.name.trim()){setError("Name is required.");return;}
    if(!form.role.trim()){setError("Role is required.");return;}
    const r=await authFetch("/api/records",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing?{id:editing,data:form}:{kind:"people",data:form})});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not save person.");return;}
    setMessage(editing?"Person updated.":"Person added.");setOpen(false);setEditing(null);setForm(blank);await load();
  }

  async function remove(id:string){
    if(!confirm("Delete this person?")) return;
    const r=await authFetch("/api/records?id="+encodeURIComponent(id),{method:"DELETE"});
    const j=await r.json();
    if(!r.ok){setError(j.error||"Could not delete person.");return;}
    setMessage("Person deleted.");await load();
  }

  return <>
    <div className="actions centered-actions" style={{margin:"18px 0"}}><button className="btn" onClick={add}>Add person</button></div>
    {message&&<div className="success-message">{message}</div>}
    {error&&<div className="error-message">{error}</div>}
    {open&&<div className="modal-backdrop"><div className="modal-card">
      <h2>{editing?"Edit person":"Add person"}</h2>
      <form className="stack" onSubmit={save}>
        <div className="form-field">
          <span>Photo</span>
          {form.photo&&<div className="person-photo-preview"><img src={form.photo} alt="Person preview"/></div>}
          <label className="image-upload-button">
            <input type="file" accept="image/*" onChange={addPhoto}/>
            <span>{form.photo?"Change picture":"Add picture"}</span>
          </label>
          {form.photo&&<button className="btn secondary" type="button" onClick={()=>setForm({...form,photo:""})}>Remove picture</button>}
        </div>
        <label className="form-field"><span>Name *</span><input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label className="form-field"><span>Role *</span><input className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}/></label>
        <label className="form-field"><span>Email</span><input className="input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <div className="form-field"><span>Projects</span>
          <div className="project-picker">
            {projects.length===0?<p className="small">Add projects first, then link them here.</p>:projects.map(p=><label className="project-choice" key={p.id}>
              <input type="checkbox" checked={form.projectIds.includes(p.id)} onChange={()=>toggleProject(p.id)}/>
              <span>{p.data.title||"Untitled project"}</span>
            </label>)}
          </div>
        </div>
        <label className="form-field"><span>Status</span><select className="input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="">Choose…</option><option>Current member</option><option>Collaborator</option><option>Alumni</option></select></label>
        <label className="form-field"><span>Notes</span><textarea className="input" rows={4} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
        {error&&<div className="error-message">{error}</div>}
        <div className="actions centered-actions"><button className="btn" type="submit">Save</button><button className="btn secondary" type="button" onClick={cancel}>Cancel</button></div>
      </form>
    </div></div>}

    <div className="grid crud-grid">
      {people.map(p=><div className="card crud-card person-card" key={p.id}>
        {p.data.photo?<img className="person-photo" src={p.data.photo} alt={p.data.name||"Lab member"}/>:<div className="person-photo person-photo-placeholder" aria-hidden="true">{(p.data.name||"?").slice(0,1).toUpperCase()}</div>}
        <h3>{p.data.name}</h3>
        {p.data.role&&<p><strong>Role:</strong> {p.data.role}</p>}
        {p.data.email&&<p><strong>Email:</strong> {p.data.email}</p>}
        {(p.data.projectIds||[]).length>0&&<div className="person-projects"><strong>Projects:</strong><div className="project-chip-row">
          {(p.data.projectIds||[]).map(id=>{
            const project=projects.find(x=>x.id===id);
            return project?<Link key={id} href={"/projects/"+id} className="project-chip">{project.data.title||"Untitled project"}</Link>:null;
          })}
        </div></div>}
        {p.data.status&&<p><strong>Status:</strong> {p.data.status}</p>}
        {p.data.notes&&<p><strong>Notes:</strong> {p.data.notes}</p>}
        <div className="actions centered-actions"><button className="btn secondary" onClick={()=>edit(p)}>Edit</button><button className="btn secondary danger" onClick={()=>remove(p.id)}>Delete</button></div>
      </div>)}
    </div>
  </>;
}
