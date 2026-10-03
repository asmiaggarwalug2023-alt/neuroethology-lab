"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login(){
  const router=useRouter();
  const [mode,setMode]=useState<"login"|"signup">("signup");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");

  function submit(e:FormEvent){
    e.preventDefault();
    if(!email.trim() || !password.trim() || (mode==="signup" && !name.trim())){
      setMessage("Please fill in all required fields.");
      return;
    }
    if(mode==="signup"){
      localStorage.setItem("neuroethology-account",JSON.stringify({name:name.trim(),email:email.trim(),password}));
      localStorage.setItem("neuroethology-user",JSON.stringify({name:name.trim(),email:email.trim()}));
      window.dispatchEvent(new Event("neuro-auth"));
      router.push("/");
      return;
    }
    const raw=localStorage.getItem("neuroethology-account");
    if(!raw){setMessage("No account found on this browser yet. Create an account first.");return;}
    const acc=JSON.parse(raw);
    if(acc.email!==email.trim() || acc.password!==password){setMessage("Email or password does not match.");return;}
    localStorage.setItem("neuroethology-user",JSON.stringify({name:acc.name,email:acc.email}));
    window.dispatchEvent(new Event("neuro-auth"));
    router.push("/");
  }

  return <div className="auth-wrap"><div className="auth-card">
    <span className="eyebrow">{mode==="signup"?"JOIN THE LAB":"WELCOME BACK"}</span>
    <h1>{mode==="signup"?"Create account":"Log in"}</h1>
    <p className="subtitle">{mode==="signup"?"No approval step for this prototype.":"Use the account you created on this browser."}</p>
    <form className="stack" style={{marginTop:18}} onSubmit={submit}>
      {mode==="signup" && <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} />}
      <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {message && <p className="form-message">{message}</p>}
      <button className="btn" type="submit">{mode==="signup"?"Create account":"Log in"}</button>
      <button className="btn secondary" type="button" onClick={()=>{setMode(mode==="signup"?"login":"signup");setMessage("");}}>
        {mode==="signup"?"Already have an account? Log in":"Need an account? Sign up"}
      </button>
    </form>
  </div></div>
}
