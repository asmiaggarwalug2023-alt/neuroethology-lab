"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "../../lib/supabaseBrowser";

export default function Login(){
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();setError("");setMessage("");
    if(!email.trim() || !password.trim() || (mode==="signup" && !name.trim())){setError("Please fill in all required fields.");return;}
    if(password.length<6){setError("Password must be at least 6 characters.");return;}
    const supabase=getSupabaseBrowser();
    if(!supabase){setError("Shared sign-in is not connected yet. Connect the app database to finish account setup.");return;}
    setBusy(true);
    try{
      if(mode==="signup"){
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()}}});
        if(error) throw error;
        if(data.session){setMessage("Account created. You are signed in.");router.push("/");router.refresh();}
        else setMessage("Account created. Check your email if confirmation is required, then log in.");
      }else{
        const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        setMessage("Signed in successfully.");router.push("/");router.refresh();
      }
    }catch(e:any){setError(e.message||"Sign-in failed.");}
    finally{setBusy(false);}
  }

  return <div className="auth-wrap"><div className="auth-card">
    <span className="eyebrow">{mode==="signup"?"JOIN THE LAB":"WELCOME BACK"}</span>
    <h1>{mode==="signup"?"Create account":"Log in"}</h1>
    <p className="subtitle">{mode==="signup"?"Create your Neuroethology Lab account. No lab-admin approval step.":"Sign in to your Neuroethology Lab account."}</p>
    <form className="stack" style={{marginTop:18}} onSubmit={submit}>
      {mode==="signup" && <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />}
      <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy?"Please wait…":mode==="signup"?"Create account":"Log in"}</button>
      <button className="btn secondary" type="button" onClick={()=>{setMode(mode==="signup"?"login":"signup");setError("");setMessage("");}}>
        {mode==="signup"?"Already have an account? Log in":"Need an account? Sign up"}
      </button>
    </form>
  </div></div>
}
