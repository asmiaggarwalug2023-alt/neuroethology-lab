"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";

type BuddyPrefs={name:string;hat:string;outfit:string;personality?:string};
type PresenceFish={id:string;name:string;location:string;hat?:string;outfit?:string};

const defaults:BuddyPrefs={name:"Fish Buddy",hat:"None",outfit:"None"};

const hats:Record<string,string>={
  "None":"","Lab cap":"🧢","Graduation cap":"🎓","Crown":"👑","Party hat":"🥳","Beanie":"🧶"
};
const outfits:Record<string,string>={
  "None":"","Lab coat":"🥼","Bow tie":"🎀","Scarf":"🧣","Glasses":"👓","Backpack":"🎒"
};

const locations=[
  {id:"beach",label:"Beach",emoji:"🏖️",desc:"Hang out by the water with other Fish Buddies."},
  {id:"park",label:"Park",emoji:"🌲",desc:"Take your fish for a slow swim-walk through the park."},
  {id:"clinic",label:"Fish Clinic",emoji:"🩺",desc:"A playful portal to lab drug and treatment-reference information."},
  {id:"cafe",label:"Central Fish Café",emoji:"☕",desc:"Sit together, have flakes and pellets, and catch up."},
  {id:"club",label:"Fishmosh Club",emoji:"🪩",desc:"Dance floor for Fish Buddies."},
  {id:"school",label:"School / Library",emoji:"📚",desc:"Study zone linking back to lab knowledge and research."},
  {id:"shop",label:"Bikini Fish Store",emoji:"🛍️",desc:"A future home for cosmetic Fish Buddy items."},
  {id:"redroom",label:"Red Room",emoji:"🚪",desc:"A themed reading room for nicotine-related studies."},
  {id:"risk",label:"Enter at your own risk",emoji:"⚠️",desc:"The daily deep-sea rarity challenge."}
];

type Prompt={
  q:string;
  answers:Record<string,number>;
};

const promptBank:Prompt[]=[
  {q:"Name a fruit",answers:{apple:.92,banana:.88,orange:.82,mango:.74,grape:.69,strawberry:.63,watermelon:.58,pineapple:.51,pear:.42,peach:.39,kiwi:.31,papaya:.25,guava:.18,pomegranate:.15,lychee:.11,dragonfruit:.06,persimmon:.04}},
  {q:"Name an animal people keep as a pet",answers:{dog:.95,cat:.94,fish:.72,bird:.64,rabbit:.53,hamster:.45,turtle:.34,guineapig:.28,snake:.18,lizard:.15,ferret:.09,axolotl:.04}},
  {q:"Name a colour",answers:{blue:.94,red:.91,green:.86,black:.80,white:.78,pink:.72,purple:.67,yellow:.64,orange:.55,brown:.49,grey:.43,teal:.22,maroon:.15,indigo:.09,turquoise:.08}},
  {q:"Name a country in Asia",answers:{india:.94,china:.91,japan:.86,southkorea:.71,indonesia:.58,thailand:.54,pakistan:.49,nepal:.43,singapore:.40,vietnam:.38,malaysia:.34,bangladesh:.30,srilanka:.27,philippines:.25,bhutan:.14,mongolia:.11,laos:.08,brunei:.04}},
  {q:"Name something found in a laboratory",answers:{microscope:.92,testtube:.84,pipette:.81,gloves:.76,beaker:.73,centrifuge:.61,"petri dish":.58,computer:.48,freezer:.40,incubator:.36,forceps:.29,scalpel:.24,spectrophotometer:.12,microtome:.07}},
  {q:"Name a body of water",answers:{ocean:.92,sea:.87,river:.84,lake:.78,pond:.61,stream:.52,creek:.39,lagoon:.26,bay:.24,gulf:.22,estuary:.16,fjord:.09}},
  {q:"Name a fish",answers:{goldfish:.91,salmon:.80,tuna:.75,shark:.70,clownfish:.63,betta:.54,zebrafish:.49,guppy:.46,carp:.39,trout:.36,tilapia:.31,cichlid:.24,oscar:.14,discus:.09,killifish:.07}},
  {q:"Name something you might see at the beach",answers:{sand:.94,water:.93,waves:.88,shells:.74,people:.69,umbrella:.61,towel:.56,seagull:.45,boat:.39,crab:.31,seaweed:.26,starfish:.19,jellyfish:.12}},
  {q:"Name a drink",answers:{water:.95,tea:.88,coffee:.87,juice:.72,soda:.63,milk:.58,lemonade:.44,smoothie:.36,coconutwater:.22,milkshake:.19,kombucha:.08}},
  {q:"Name something that can fly",answers:{bird:.94,plane:.91,helicopter:.75,butterfly:.69,bee:.63,fly:.59,mosquito:.52,bat:.47,kite:.42,drone:.34,balloon:.28,dragonfly:.23}}
];

function normalized(s:string){
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"");
}
function seededIndex(seed:string,max:number){
  let h=2166136261;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  return Math.abs(h)%max;
}
function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function rarityLabel(freq:number){
  if(freq>=.75) return {label:"Very common",drop:8};
  if(freq>=.5) return {label:"Common",drop:14};
  if(freq>=.25) return {label:"Uncommon",drop:22};
  if(freq>=.1) return {label:"Rare",drop:31};
  return {label:"Deep-sea rare",drop:42};
}

export function FishLand(){
  const [prefs,setPrefs]=useState<BuddyPrefs>(defaults);
  const [location,setLocation]=useState("cafe");
  const [panel,setPanel]=useState("cafe");
  const [online,setOnline]=useState<PresenceFish[]>([]);
  const channelRef=useRef<any>(null);

  useEffect(()=>{
    const local=localStorage.getItem("neuro-fish-buddy");
    if(local){try{setPrefs({...defaults,...JSON.parse(local)});}catch{}}
    const supabase=getSupabaseBrowser();
    if(!supabase) return;
    let userId="guest-"+Math.random().toString(36).slice(2,8);
    supabase.auth.getSession().then(({data})=>{
      if(data.session?.user?.id) userId=data.session.user.id;
      const remote=data.session?.user?.user_metadata?.fish_buddy;
      if(remote) setPrefs({...defaults,...remote});

      const channel=supabase.channel("fish-land-presence",{config:{presence:{key:userId}}});
      channelRef.current=channel;
      channel
        .on("presence",{event:"sync"},()=>{
          const state=channel.presenceState();
          const fish:PresenceFish[]=[];
          Object.entries(state).forEach(([id,arr]:any)=>{
            const p=arr?.[0];
            if(p) fish.push({id,name:p.name||"Fish Buddy",location:p.location||"cafe",hat:p.hat,outfit:p.outfit});
          });
          setOnline(fish);
        })
        .subscribe(async(status)=>{
          if(status==="SUBSCRIBED"){
            await channel.track({name:prefs.name||"Fish Buddy",location,hat:prefs.hat,outfit:prefs.outfit});
          }
        });
    });
    return()=>{if(channelRef.current) supabase.removeChannel(channelRef.current);};
  },[]);

  useEffect(()=>{
    const ch=channelRef.current;
    if(ch) ch.track({name:prefs.name||"Fish Buddy",location,hat:prefs.hat,outfit:prefs.outfit}).catch(()=>{});
  },[location,prefs]);

  function go(id:string){
    setLocation(id);
    setPanel(id);
  }

  const here=online.filter(f=>f.location===location);

  return (
    <div className="fishland-shell">
      <section className="fishland-header">
        <div>
          <span className="eyebrow">NEUROETHOLOGY LAB SOCIAL WORLD</span>
          <h1 className="page-title fishland-title">Fish Land</h1>
          <p className="subtitle">Bring your Fish Buddy, explore the island, and meet other lab fish.</p>
        </div>
        <div className="fishland-you">
          <FishAvatar prefs={prefs} compact/>
          <div><strong>{prefs.name||"Fish Buddy"}</strong><small>Currently at {locations.find(x=>x.id===location)?.label}</small></div>
        </div>
      </section>

      <section className="fishland-map" aria-label="Interactive Fish Land map">
        <div className="fishland-water"/>
        <div className="fishland-island">
          <MapSpot id="beach" label="Beach" emoji="🏖️" x="7%" y="48%" onGo={go}/>
          <MapSpot id="park" label="Park" emoji="🌲" x="28%" y="32%" onGo={go}/>
          <MapSpot id="clinic" label="Fish Clinic" emoji="🩺" x="45%" y="12%" onGo={go}/>
          <MapSpot id="club" label="Fishmosh" emoji="🪩" x="76%" y="19%" onGo={go}/>
          <MapSpot id="cafe" label="Central Fish Café" emoji="☕" x="47%" y="42%" onGo={go}/>
          <MapSpot id="school" label="School / Library" emoji="📚" x="55%" y="70%" onGo={go}/>
          <MapSpot id="shop" label="Bikini Fish Store" emoji="🛍️" x="17%" y="72%" onGo={go}/>
          <MapSpot id="redroom" label="Red Room" emoji="🚪" x="31%" y="69%" onGo={go}/>
          <MapSpot id="risk" label="Enter at your own risk" emoji="⚠️" x="82%" y="68%" onGo={go}/>
          <div className="fishland-center-fish" style={{left:"50%",top:"52%"}}><FishAvatar prefs={prefs}/></div>
        </div>
      </section>

      <section className="card fishland-place-card">
        <span className="eyebrow">CURRENT LOCATION</span>
        <h2>{locations.find(x=>x.id===panel)?.emoji} {locations.find(x=>x.id===panel)?.label}</h2>
        <p>{locations.find(x=>x.id===panel)?.desc}</p>

        {panel==="risk" ? <RiskGame prefs={prefs}/> :
         panel==="clinic" ? <div className="fishland-actions"><Link className="btn secondary" href="/stock">Open Lab Stock</Link><Link className="btn secondary" href="/fish-care/predator-guide">Predator Guide</Link></div> :
         panel==="school" ? <div className="fishland-actions"><Link className="btn secondary" href="/research">Research Catalogue</Link><Link className="btn secondary" href="/handbook">Lab Handbook</Link></div> :
         panel==="club" ? <DanceFloor prefs={prefs}/> :
         panel==="cafe" ? <CafeTable prefs={prefs} peers={here}/> :
         <div className="fishland-social-note">{here.length>1 ? `${here.length} Fish Buddies are here right now.` : "Your Fish Buddy is exploring this spot."}</div>
        }
      </section>
    </div>
  );
}

function MapSpot({id,label,emoji,x,y,onGo}:{id:string;label:string;emoji:string;x:string;y:string;onGo:(id:string)=>void}){
  return <button className="fishland-spot" style={{left:x,top:y}} onClick={()=>onGo(id)}><span>{emoji}</span><b>{label}</b></button>;
}

function FishAvatar({prefs,compact=false}:{prefs:BuddyPrefs;compact?:boolean}){
  return <div className={compact?"land-fish compact":"land-fish"}>
    <span className="land-tail"/>
    <span className="land-body"><i/><i/><i/><i/><em/></span>
    {prefs.hat!=="None"&&<span className="land-hat">{hats[prefs.hat]||""}</span>}
    {prefs.outfit!=="None"&&<span className="land-outfit">{outfits[prefs.outfit]||""}</span>}
  </div>;
}

function CafeTable({prefs,peers}:{prefs:BuddyPrefs;peers:PresenceFish[]}){
  return <div className="cafe-scene">
    <div className="cafe-table">☕</div>
    <div className="cafe-seat"><FishAvatar prefs={prefs} compact/><span>{prefs.name}</span></div>
    {peers.filter(p=>p.name!==prefs.name).slice(0,4).map((p,i)=><div className="cafe-seat" key={p.id}><FishAvatar prefs={{name:p.name,hat:p.hat||"None",outfit:p.outfit||"None"}} compact/><span>{p.name}</span></div>)}
    <p>{peers.length>1?"You have company at the café.":"You have a table. When another lab member joins the café, their Fish Buddy can appear here."}</p>
  </div>;
}

function DanceFloor({prefs}:{prefs:BuddyPrefs}){
  const [dancing,setDancing]=useState(false);
  return <div className={dancing?"dance-scene active":"dance-scene"}>
    <div className="dance-lights">✦ ✧ ✦ ✧</div>
    <FishAvatar prefs={prefs}/>
    <button className="btn" onClick={()=>setDancing(v=>!v)}>{dancing?"Stop dancing":"Dance"}</button>
  </div>;
}

function RiskGame({prefs}:{prefs:BuddyPrefs}){
  const day=todayKey();
  const daily=useMemo(()=>{
    const start=seededIndex(day,promptBank.length);
    return Array.from({length:5},(_,i)=>promptBank[(start+i*3)%promptBank.length]);
  },[day]);
  const [started,setStarted]=useState(false);
  const [round,setRound]=useState(0);
  const [answer,setAnswer]=useState("");
  const [seconds,setSeconds]=useState(20);
  const [depth,setDepth]=useState(0);
  const [result,setResult]=useState("");
  const [dead,setDead]=useState(false);
  const [revive,setRevive]=useState(5);
  const [finished,setFinished]=useState(false);

  useEffect(()=>{
    if(!started||dead||finished) return;
    if(seconds<=0){setDead(true);setRevive(5);setResult("Too slow — an Oscar Cichlid got you.");return;}
    const t=setTimeout(()=>setSeconds(s=>s-1),1000);
    return()=>clearTimeout(t);
  },[seconds,started,dead,finished]);

  useEffect(()=>{
    if(!dead) return;
    if(revive<=0){
      setDead(false);setSeconds(20);setAnswer("");setResult("Rejuvenated! Back into the trench.");
      return;
    }
    const t=setTimeout(()=>setRevive(x=>x-1),1000);
    return()=>clearTimeout(t);
  },[dead,revive]);

  function submit(e:FormEvent){
    e.preventDefault();
    if(dead||finished) return;
    const key=normalized(answer);
    const freq=daily[round].answers[key];
    if(freq===undefined){setResult("That answer is not in today’s Fish Land answer database. Try another before time runs out.");return;}
    const rarity=rarityLabel(freq);
    const nextDepth=depth+rarity.drop;
    setDepth(nextDepth);
    setResult(`${rarity.label} answer — you descended ${rarity.drop} m.`);
    setAnswer("");
    setSeconds(20);
    if(round===daily.length-1){setFinished(true);}
    else setRound(r=>r+1);
  }

  function reset(){
    setStarted(true);setRound(0);setAnswer("");setSeconds(20);setDepth(0);setResult("");setDead(false);setRevive(5);setFinished(false);
  }

  if(!started) return <div className="risk-game-intro">
    <div className="risk-ocean-preview"><FishAvatar prefs={prefs}/><span>↓</span></div>
    <p>Five daily prompts. You have <strong>20 seconds</strong> each. Less-common answers in the Fish Land database send you deeper. Timeout = Oscar Cichlid.</p>
    <button className="btn" onClick={reset}>Start today’s descent</button>
  </div>;

  return <div className="risk-game">
    <div className="risk-depth-column">
      <div className="risk-surface">SURFACE</div>
      <div className="risk-swimmer" style={{top:`${Math.min(82,8+depth*.65)}%`}}><FishAvatar prefs={prefs} compact/><span>{depth} m</span></div>
      <div className="risk-zone z1">Reef</div><div className="risk-zone z2">Twilight</div><div className="risk-zone z3">Midnight</div><div className="risk-zone z4">Abyss</div><div className="risk-zone z5">Trench</div>
    </div>

    <div className="risk-console">
      <div className="risk-meta"><span>Daily game · {day}</span><strong>{finished?"Complete":`Round ${round+1}/${daily.length}`}</strong></div>
      {!finished&&!dead&&<>
        <div className={seconds<=5?"risk-timer danger":"risk-timer"}>{seconds}</div>
        <h3>{daily[round].q}</h3>
        <form onSubmit={submit} className="risk-answer-form">
          <input className="input" autoComplete="off" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type an answer…" autoFocus/>
          <button className="btn" type="submit">Dive</button>
        </form>
      </>}
      {dead&&<div className="oscar-attack"><div className="oscar">🐟</div><h3>CHOMP.</h3><p>Oscar Cichlid got {prefs.name}. Rejuvenating in <strong>{revive}</strong>…</p></div>}
      {finished&&<div className="risk-finish"><h3>Daily descent complete</h3><p>{prefs.name} reached <strong>{depth} m</strong>.</p><button className="btn secondary" onClick={reset}>Play again</button></div>}
      {result&&<p className="risk-result">{result}</p>}
      <p className="small">Rarity is scored against Fish Land’s fixed answer-frequency database, not against other players.</p>
    </div>
  </div>;
}
