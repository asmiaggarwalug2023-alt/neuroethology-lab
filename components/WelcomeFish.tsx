"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";

type BuddyPrefs={
  name:string;
  hat:string;
  outfit:string;
};

const defaults:BuddyPrefs={name:"Fish Buddy",hat:"None",outfit:"None"};

const hats:Record<string,string>={
  "None":"",
  "Lab cap":"🧢",
  "Graduation cap":"🎓",
  "Crown":"👑",
  "Party hat":"🥳",
  "Beanie":"🧶"
};

const outfits:Record<string,string>={
  "None":"",
  "Lab coat":"🥼",
  "Bow tie":"🎀",
  "Scarf":"🧣",
  "Glasses":"👓",
  "Backpack":"🎒"
};

export function WelcomeFish(){
  const [prefs,setPrefs]=useState<BuddyPrefs>(defaults);

  useEffect(()=>{
    const local=localStorage.getItem("neuro-fish-buddy");
    if(local){
      try{setPrefs({...defaults,...JSON.parse(local)});}catch{}
    }

    const supabase=getSupabaseBrowser();
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>{
      const remote=data.session?.user?.user_metadata?.fish_buddy;
      if(remote) setPrefs({...defaults,...remote});
    });
  },[]);

  return (
    <div className="welcome-fish-block">
      <div className="welcome-zebra-stage" aria-label={prefs.name || "Personalized zebrafish"}>
        <div className="zebrafish welcome-zebrafish">
          <div className="zebra-tail"/>
          <div className="zebra-body">
            <span className="zebra-stripe s1"/><span className="zebra-stripe s2"/><span className="zebra-stripe s3"/><span className="zebra-stripe s4"/>
            <span className="zebra-eye"/>
            {prefs.outfit==="Glasses"&&<span className="fish-glasses">👓</span>}
          </div>
          {prefs.hat!=="None"&&<span className="fish-hat">{hats[prefs.hat]||""}</span>}
          {prefs.outfit!=="None"&&prefs.outfit!=="Glasses"&&<span className="fish-outfit">{outfits[prefs.outfit]||""}</span>}
        </div>
      </div>

      <p className="welcome-fish-name">{prefs.name || "Fish Buddy"}</p>

      <div className="logo-welcome-actions">
        <Link className="btn logo-enter" href="/home">Enter the lab</Link>
        <Link className="btn secondary logo-login" href="/login">Log in</Link>
      </div>
    </div>
  );
}
