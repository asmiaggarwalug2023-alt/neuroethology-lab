"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";
import { usePathname } from "next/navigation";

type Personality="Friendly"|"Chaotic"|"Sleepy"|"Encouraging"|"Dramatic"|"Nerdy scientist";
type Hat="None"|"Lab cap"|"Graduation cap"|"Crown"|"Party hat"|"Beanie";
type Outfit="None"|"Lab coat"|"Bow tie"|"Scarf"|"Glasses"|"Backpack";

type BuddyPrefs={
  name:string;
  personality:Personality;
  hat:Hat;
  outfit:Outfit;
  mood:string;
  lastFedAt?:string;
};

const defaults:BuddyPrefs={
  name:"Fish Buddy",
  personality:"Friendly",
  hat:"None",
  outfit:"None",
  mood:"curious"
};

const facts=[
  "Zebrafish are social animals and often prefer being near other zebrafish.",
  "Zebrafish are diurnal, which means they are most active during the day.",
  "Zebrafish embryos are transparent, making early development easy to observe.",
  "Zebrafish can learn visual discriminations and remember rewarded choices.",
  "Zebrafish can distinguish colours, which can matter in behavioural experiments.",
  "Adult zebrafish can regenerate damaged heart tissue.",
  "Zebrafish are widely used in neuroscience, genetics, development and behaviour research."
];

const puns=[
  "I’m having a fin-tastic day.",
  "I’m just here for the current events.",
  "This lab has excellent school spirit.",
  "No need to be koi about your data.",
  "I’m trying to make a splash in science.",
  "That result sounds pretty fish-cinating.",
  "Just keep swimming… and recording the behaviour."
];

const helloByPersonality:Record<Personality,string[]>={
  "Friendly":["Hi! I’m so happy to see you!","Hello hello! How’s the lab going?","Hi human! Ready for some fish science?"],
  "Chaotic":["HELLO HUMAN. I HAVE ZOOMIES.","HI. I HAVE SEVERAL IMPORTANT SPLASHES TO MAKE.","HELLO! SCIENCE! SNACKS! SPEED!"],
  "Sleepy":["Hiii… I was definitely not napping.","Hello. Five more minutes?","Oh, hi. I’m awake-ish."],
  "Encouraging":["Hi! You’ve got this.","Hello! One task at a time — you’re doing great.","Hi! I believe in you and your data."],
  "Dramatic":["At last… you have returned.","HELLO. The aquarium has awaited your arrival.","Ah! A visitor! The plot thickens."],
  "Nerdy scientist":["Greetings. Would you like a zebrafish fact?","Hello. I am ready to discuss behavioural data.","Salutations. Current hypothesis: snacks improve morale."]
};

const feedByPersonality:Record<Personality,string[]>={
  "Friendly":["Yum! Thank you for the flakes.","Snack accepted. Thank you!","That was delicious!"],
  "Chaotic":["SNACK ACQUIRED. ZOOM MODE ACTIVATED.","FOOD! POWER! SCIENCE!","I HAVE CONSUMED THE EVIDENCE."],
  "Sleepy":["Thanks… snack, then nap.","Yum. That was worth waking up for.","Food acquired. Returning to low-power mode."],
  "Encouraging":["Thank you! Now you deserve a snack too.","Delicious. Great job remembering to feed me!","Snack accepted — excellent work today."],
  "Dramatic":["At last! Sustenance!","The feast has arrived.","I shall remember this act of generosity."],
  "Nerdy scientist":["Nutrient intake complete.","Snack acquisition successful.","Feeding event recorded. Satisfaction: high."]
};

const hats:Record<Hat,string>={
  "None":"",
  "Lab cap":"🧢",
  "Graduation cap":"🎓",
  "Crown":"👑",
  "Party hat":"🥳",
  "Beanie":"🧶"
};

const outfits:Record<Outfit,string>={
  "None":"",
  "Lab coat":"🥼",
  "Bow tie":"🎀",
  "Scarf":"🧣",
  "Glasses":"👓",
  "Backpack":"🎒"
};

function pick<T>(arr:T[]){return arr[Math.floor(Math.random()*arr.length)]}

export function FishBuddy(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [customizing,setCustomizing]=useState(false);
  const [prefs,setPrefs]=useState<BuddyPrefs>(defaults);
  const [draft,setDraft]=useState<BuddyPrefs>(defaults);
  const [message,setMessage]=useState("Click hello, feed me, or ask me for a fact!");
  const [saving,setSaving]=useState(false);
  const [signedIn,setSignedIn]=useState(false);

  const fishTitle=useMemo(()=>prefs.name.trim()||"Fish Buddy",[prefs.name]);

  useEffect(()=>{
    const supabase=getSupabaseBrowser();
    const local=localStorage.getItem("neuro-fish-buddy");
    if(local){
      try{
        const saved={...defaults,...JSON.parse(local)};
        setPrefs(saved);setDraft(saved);
      }catch{}
    }
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>{
      const user=data.session?.user;
      setSignedIn(!!user);
      const remote=user?.user_metadata?.fish_buddy;
      if(remote){
        const saved={...defaults,...remote};
        setPrefs(saved);setDraft(saved);
        localStorage.setItem("neuro-fish-buddy",JSON.stringify(saved));
      }
    });
    const {data:sub}=supabase.auth.onAuthStateChange((_event,session)=>{
      setSignedIn(!!session?.user);
      const remote=session?.user?.user_metadata?.fish_buddy;
      if(remote){
        const saved={...defaults,...remote};
        setPrefs(saved);setDraft(saved);
      }
    });
    return()=>sub.subscription.unsubscribe();
  },[]);

  async function persist(next:BuddyPrefs,successText?:string){
    setPrefs(next);
    setDraft(next);
    localStorage.setItem("neuro-fish-buddy",JSON.stringify(next));
    const supabase=getSupabaseBrowser();
    if(supabase && signedIn){
      setSaving(true);
      const {error}=await supabase.auth.updateUser({data:{fish_buddy:next}});
      setSaving(false);
      if(error){
        setMessage("Saved on this device, but cloud sync failed: "+error.message);
        return;
      }
    }
    if(successText) setMessage(successText);
  }

  async function saveCustomization(){
    if(!draft.name.trim()){
      setMessage("Give your zebrafish a name first.");
      return;
    }
    await persist({...draft,name:draft.name.trim()},"Customization saved!");
    setCustomizing(false);
  }

  async function feed(){
    const next={...prefs,lastFedAt:new Date().toISOString(),mood:"happy"};
    await persist(next,pick(feedByPersonality[prefs.personality]));
  }

  function hello(){setMessage(pick(helloByPersonality[prefs.personality]))}
  function fact(){setMessage(pick(facts))}
  function pun(){setMessage(pick(puns))}

  if(pathname==="/" || pathname.startsWith("/fish-land")) return null;

  return (
    <div className="fish-buddy-wrap">
      {open&&(
        <div className="fish-buddy-card buddy-expanded" role="dialog" aria-label="Fish Buddy">
          <div className="fish-buddy-head">
            <strong>{fishTitle}</strong>
            <button className="icon-btn" onClick={()=>setOpen(false)} aria-label="Close Fish Buddy">×</button>
          </div>

          <div className="zebra-stage">
            <div className="zebrafish" aria-label="Cartoon zebrafish">
              <div className="zebra-tail"/>
              <div className="zebra-body">
                <span className="zebra-stripe s1"/><span className="zebra-stripe s2"/><span className="zebra-stripe s3"/><span className="zebra-stripe s4"/>
                <span className="zebra-eye"/>
                {prefs.outfit==="Glasses"&&<span className="fish-glasses">👓</span>}
              </div>
              {prefs.hat!=="None"&&<span className="fish-hat">{hats[prefs.hat]}</span>}
              {prefs.outfit!=="None"&&prefs.outfit!=="Glasses"&&<span className="fish-outfit">{outfits[prefs.outfit]}</span>}
            </div>
          </div>

          <p className="buddy-speech">{message}</p>

          {!customizing?(
            <>
              <div className="buddy-action-grid">
                <button className="buddy-more" onClick={hello}>Say hello</button>
                <button className="buddy-more" onClick={feed}>Feed</button>
                <button className="buddy-more" onClick={fact}>Tell me a fact</button>
                <button className="buddy-more" onClick={pun}>Tell me a pun</button>
              </div>
              <button className="buddy-customize" onClick={()=>{setDraft(prefs);setCustomizing(true)}}>Customize {fishTitle}</button>
              {prefs.lastFedAt&&<span className="buddy-fed-note">Last fed: {new Date(prefs.lastFedAt).toLocaleString()}</span>}
            </>
          ):(
            <div className="buddy-custom-panel">
              <label><span>Name</span><input className="input" value={draft.name} maxLength={24} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
              <label><span>Personality</span><select className="input" value={draft.personality} onChange={e=>setDraft({...draft,personality:e.target.value as Personality})}>
                {Object.keys(helloByPersonality).map(x=><option key={x}>{x}</option>)}
              </select></label>
              <label><span>Hat</span><select className="input" value={draft.hat} onChange={e=>setDraft({...draft,hat:e.target.value as Hat})}>
                {(Object.keys(hats) as Hat[]).map(x=><option key={x}>{x}</option>)}
              </select></label>
              <label><span>Outfit / accessory</span><select className="input" value={draft.outfit} onChange={e=>setDraft({...draft,outfit:e.target.value as Outfit})}>
                {(Object.keys(outfits) as Outfit[]).map(x=><option key={x}>{x}</option>)}
              </select></label>
              <div className="actions centered-actions">
                <button className="btn" onClick={saveCustomization} disabled={saving}>{saving?"Saving…":"Save"}</button>
                <button className="btn secondary" onClick={()=>{setDraft(prefs);setCustomizing(false)}}>Cancel</button>
              </div>
              <span className="buddy-fed-note">{signedIn?"Saved to your account.":"Sign in to sync customization across devices."}</span>
            </div>
          )}
        </div>
      )}

      <button className="fish-buddy" onClick={()=>setOpen(v=>!v)} aria-label="Open your zebrafish buddy" title={fishTitle}>
        <span className="buddy-fish-mini">
          <span className="mini-zebra-body"><i/><i/><i/></span>
          <span className="mini-zebra-tail"/>
        </span>
        <span>{fishTitle}</span>
      </button>
    </div>
  );
}
