"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";

export function AuthStatus(){
  const [name,setName]=useState<string|null>(null);
  useEffect(()=>{
    const supabase=getSupabaseBrowser();
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>{
      const u=data.session?.user;
      setName(u ? String(u.user_metadata?.full_name || u.email || "Lab member") : null);
    });
    const {data:sub}=supabase.auth.onAuthStateChange((_event,session)=>{
      const u=session?.user;
      setName(u ? String(u.user_metadata?.full_name || u.email || "Lab member") : null);
    });
    return()=>sub.subscription.unsubscribe();
  },[]);
  if(!name) return <Link href="/login" className="header-login">Log in / Sign up</Link>;
  return <div className="auth-status"><span>Hi, {name}</span><button onClick={async()=>{const s=getSupabaseBrowser();await s?.auth.signOut();}} className="header-login">Log out</button></div>;
}
