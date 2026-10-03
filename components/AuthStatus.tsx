"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type User = {name:string,email:string};

export function AuthStatus(){
  const [user,setUser]=useState<User|null>(null);
  useEffect(()=>{
    const raw=localStorage.getItem("neuroethology-user");
    if(raw){ try{ setUser(JSON.parse(raw)); }catch{} }
    const sync=()=>{const v=localStorage.getItem("neuroethology-user"); setUser(v?JSON.parse(v):null)};
    window.addEventListener("storage",sync);
    window.addEventListener("neuro-auth",sync as EventListener);
    return()=>{window.removeEventListener("storage",sync);window.removeEventListener("neuro-auth",sync as EventListener)};
  },[]);
  if(!user) return <Link href="/login" className="header-login">Log in / Sign up</Link>;
  return <div className="auth-status"><span>Hi, {user.name}</span><button onClick={()=>{localStorage.removeItem("neuroethology-user");window.dispatchEvent(new Event("neuro-auth"));}} className="header-login">Log out</button></div>;
}
