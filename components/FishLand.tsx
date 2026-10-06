"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../lib/supabaseBrowser";
import styles from "../app/fish-land/fishland.module.css";

type BuddyPrefs={name:string;hat:string;outfit:string;personality?:string};
type Economy={coins:number;ownedBikinis:string[];equippedBikini:string;dailyAwarded:Record<string,number>};
type PresenceFish={
  id:string;
  name:string;
  room:string;
  x:number;
  y:number;
  hat?:string;
  outfit?:string;
  bikini?:string;
  queueJoinedAt?:number|null;
  inConsultation?:boolean;
};
type Prompt={q:string;answers:Record<string,number>;aliases?:Record<string,string>};

const buddyDefaults:BuddyPrefs={name:"Fish Buddy",hat:"None",outfit:"None"};
const economyDefaults:Economy={coins:0,ownedBikinis:[],equippedBikini:"",dailyAwarded:{}};

const hats:Record<string,string>={
  "None":"","Lab cap":"CAP","Graduation cap":"GRAD","Crown":"CROWN","Party hat":"PARTY","Beanie":"BEANIE"
};
const outfits:Record<string,string>={
  "None":"","Lab coat":"COAT","Bow tie":"BOW","Scarf":"SCARF","Glasses":"GLASSES","Backpack":"PACK"
};

const rooms=[
  {id:"cafe",label:"Central Fish Café",short:"Café"},
  {id:"clinic",label:"Doctor's Office",short:"Clinic"},
  {id:"club",label:"Fishmosh",short:"Fishmosh"},
  {id:"beach",label:"Beach",short:"Beach"},
  {id:"shop",label:"Bikini Fish Store",short:"Shop"},
  {id:"park",label:"Kelp Park",short:"Park"},
  {id:"school",label:"School / Library",short:"Library"},
  {id:"redroom",label:"Red Room",short:"Red Room"},
  {id:"risk",label:"Enter at Your Own Risk",short:"Risk"}
];

const foodMenu=[
  {id:"flakes",name:"Fine Flakes",note:"Dry flake food"},
  {id:"pellets",name:"Micro Pellets",note:"Small dry pellets"},
  {id:"brine",name:"Brine Shrimp",note:"Live-food classic"},
  {id:"daphnia",name:"Daphnia",note:"Live-food option"}
];

const bikinis=[
  {id:"coral",name:"Coral Wrap",price:6,desc:"Warm coral bands with a reef trim."},
  {id:"lagoon",name:"Lagoon Set",price:10,desc:"Cool aqua panels inspired by shallow water."},
  {id:"midnight",name:"Midnight Current",price:14,desc:"Deep-blue bands with silver edging."},
  {id:"sunset",name:"Sunset Reef",price:18,desc:"A vivid gradient for dramatic entrances."}
];

const promptBank:Prompt[]=[
  {q:"Name a reason a student might be late to class",answers:{overslept:96,traffic:88,bus:82,alarm:78,breakfast:52,printer:37,roommate:29,rain:25,parking:21,coffee:18},aliases:{"slept in":"overslept","missed bus":"bus","alarm did not go off":"alarm","alarm didnt go off":"alarm"}},
  {q:"Name something people do when they are awkwardly waiting",answers:{phone:96,scroll:90,lookaround:73,smile:61,fidget:58,text:55,pace:31,hum:18,stretch:12},aliases:{"check phone":"phone","use phone":"phone","look at phone":"phone","scroll instagram":"scroll","look around":"lookaround"}},
  {q:"Name a food people often order when hanging out with friends",answers:{pizza:97,fries:88,burger:82,pasta:61,momos:58,sushi:43,nachos:40,chaat:36,noodles:35,tacos:28},aliases:{"french fries":"fries","dumplings":"momos"}},
  {q:"Name something students forget before an exam",answers:{pen:91,id:80,calculator:72,notes:69,water:48,admitcard:45,charger:33,pencil:30,eraser:24,ruler:17},aliases:{"student id":"id","identity card":"id","admit card":"admitcard"}},
  {q:"Name something people do after sending a risky text",answers:{wait:95,checkphone:91,regret:88,delete:57,panic:54,overthink:52,tellfriend:38,sleep:17},aliases:{"check phone":"checkphone","overthink it":"overthink","tell a friend":"tellfriend"}},
  {q:"Name a drink people get while studying",answers:{coffee:98,tea:88,water:85,energy:69,juice:41,soda:36,milkshake:21,smoothie:19},aliases:{"energy drink":"energy","cold coffee":"coffee"}},
  {q:"Name something that can ruin a group project",answers:{ghosting:95,procrastination:91,communication:86,conflict:70,deadlines:61,"free-rider":56,formatting:33,printer:16},aliases:{"bad communication":"communication","free rider":"free-rider","one person doing nothing":"free-rider"}},
  {q:"Name something people check before leaving home",answers:{phone:96,keys:95,wallet:90,weather:72,mirror:66,bag:61,charger:40,lights:31,door:29},aliases:{"lock":"door","door lock":"door"}},
  {q:"Name something you might bring to a picnic",answers:{food:98,blanket:91,water:82,basket:66,snacks:63,sunscreen:45,speaker:42,cards:30,book:19},aliases:{"picnic blanket":"blanket","card game":"cards"}},
  {q:"Name something friends argue about when choosing where to eat",answers:{cuisine:92,price:88,distance:77,vegetarian:54,spice:46,ambience:42,parking:25,ratings:22},aliases:{"type of food":"cuisine","cost":"price","how far":"distance"}},
  {q:"Name something people do while pretending to listen",answers:{nod:97,smile:91,phone:73,eyecontact:67,hm:58,daydream:52,repeat:24},aliases:{"nod head":"nod","make eye contact":"eyecontact","say hmm":"hm"}},
  {q:"Name something you might do during a boring lecture",answers:{notes:90,phone:89,doodle:78,daydream:74,whisper:43,coffee:31,sleep:29,game:20},aliases:{"take notes":"notes","use phone":"phone","play a game":"game"}},
  {q:"Name something people buy at a campus café",answers:{coffee:97,tea:84,sandwich:74,fries:62,muffin:53,noodles:49,juice:45,cookie:40,salad:22},aliases:{"cold coffee":"coffee","cookies":"cookie"}},
  {q:"Name something people lose in their room",answers:{keys:94,charger:91,earbuds:88,socks:80,phone:71,pen:56,card:42,glasses:38,remote:26},aliases:{"airpods":"earbuds","id card":"card"}},
  {q:"Name a reason someone might cancel plans",answers:{tired:96,sick:93,work:84,study:77,family:63,rain:51,money:44,anxiety:38,transport:25},aliases:{"too tired":"tired","studying":"study","no money":"money"}},
  {q:"Name something people do when they see an ex unexpectedly",answers:{avoid:92,smile:81,freeze:77,hide:64,hello:61,phone:53,leave:47,wave:32},aliases:{"say hi":"hello","pretend to use phone":"phone"}},
  {q:"Name something you might find in a university backpack",answers:{laptop:97,notebook:92,charger:87,pen:84,water:75,headphones:69,book:60,snack:48,umbrella:31,labcoat:16},aliases:{"water bottle":"water","lab coat":"labcoat"}},
  {q:"Name something people do right before a presentation",answers:{practice:95,breathe:84,slides:78,water:55,panic:51,mirror:39,notes:37,stretch:20},aliases:{"check slides":"slides","deep breaths":"breathe","read notes":"notes"}},
  {q:"Name something roommates commonly disagree about",answers:{cleaning:97,noise:89,guests:73,temperature:67,food:61,bathroom:54,lights:45,rent:34},aliases:{"ac":"temperature","air conditioning":"temperature","chores":"cleaning"}},
  {q:"Name something people post after a good day",answers:{photo:96,story:89,selfie:72,food:61,sunset:57,friends:55,music:38,meme:27},aliases:{"instagram story":"story","group photo":"friends"}},
  {q:"Name something people do when Wi-Fi stops working",answers:{restart:95,data:88,router:82,complain:63,wait:52,hotspot:49,call:35,move:22},aliases:{"restart router":"restart","mobile data":"data","use hotspot":"hotspot"}},
  {q:"Name something people order at midnight",answers:{pizza:95,maggie:86,burger:72,biryani:69,fries:63,momos:55,noodles:49,dessert:35,tea:18},aliases:{"maggi":"maggie","instant noodles":"maggie"}},
  {q:"Name something students say when they have not started an assignment",answers:{later:95,tomorrow:91,time:78,easy:58,deadline:54,soon:49,tonight:46,panic:28},aliases:{"i will do it later":"later","tomorrow":"tomorrow","there is time":"time"}},
  {q:"Name something people do after getting good news",answers:{smile:98,call:88,text:85,celebrate:82,hug:70,screenshot:49,post:42,dance:38,cry:27},aliases:{"tell someone":"call","happy cry":"cry"}},
  {q:"Name something you might hear in a lab",answers:{timer:86,fan:82,conversation:78,beep:76,water:68,keyboard:57,pump:54,centrifuge:41,laughter:33},aliases:{"beeping":"beep","typing":"keyboard","water pump":"pump"}},
  {q:"Name something people do while waiting for food",answers:{phone:95,talk:89,water:63,lookaround:60,menu:52,photos:41,complain:22},aliases:{"check phone":"phone","chat":"talk","look around":"lookaround","read menu":"menu"}},
  {q:"Name a common excuse for not replying",answers:{busy:97,sleep:88,forgot:84,work:79,study:72,phone:51,notification:46,battery:31},aliases:{"i was busy":"busy","fell asleep":"sleep","forgot to reply":"forgot","no notification":"notification"}},
  {q:"Name something people carry to the beach",answers:{towel:95,sunscreen:91,water:82,sunglasses:78,hat:68,book:50,snacks:47,ball:39,speaker:28},aliases:{"sun screen":"sunscreen","water bottle":"water","volleyball":"ball"}},
  {q:"Name something people do after waking up",answers:{phone:96,bathroom:88,water:74,brush:72,coffee:63,shower:56,stretch:43,breakfast:39,snooze:34},aliases:{"check phone":"phone","brush teeth":"brush","hit snooze":"snooze"}}
];

function normalize(value:string){
  return value.toLowerCase().trim().replace(/[^a-z0-9 ]+/g,"").replace(/\s+/g," ");
}
function todayKey(){
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function seededIndex(seed:string,max:number){
  let h=2166136261;
  for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}
  return Math.abs(h)%max;
}
function commonnessResult(score:number){
  if(score>=85) return {label:"Very common",drop:40};
  if(score>=65) return {label:"Common",drop:30};
  if(score>=45) return {label:"Fairly common",drop:22};
  if(score>=25) return {label:"Uncommon",drop:14};
  return {label:"Rare",drop:8};
}

export function FishLand(){
  const [prefs,setPrefs]=useState<BuddyPrefs>(buddyDefaults);
  const [economy,setEconomy]=useState<Economy>(economyDefaults);
  const [room,setRoom]=useState("island");
  const [pos,setPos]=useState({x:50,y:76});
  const [online,setOnline]=useState<PresenceFish[]>([]);
  const [signedIn,setSignedIn]=useState(false);
  const [connection,setConnection]=useState("Connecting…");
  const [queueJoinedAt,setQueueJoinedAt]=useState<number|null>(null);
  const [inConsultation,setInConsultation]=useState(false);
  const channelRef=useRef<any>(null);
  const userIdRef=useRef("guest-"+Math.random().toString(36).slice(2,10));
  const trackTimer=useRef<any>(null);

  useEffect(()=>{
    const localBuddy=localStorage.getItem("neuro-fish-buddy");
    if(localBuddy){try{setPrefs({...buddyDefaults,...JSON.parse(localBuddy)});}catch{}}
    const localLand=localStorage.getItem("neuro-fish-land");
    if(localLand){try{setEconomy({...economyDefaults,...JSON.parse(localLand)});}catch{}}

    const supabase=getSupabaseBrowser();
    if(!supabase){setConnection("Solo mode");return;}

    supabase.auth.getSession().then(({data})=>{
      const session=data.session;
      if(session?.user){
        setSignedIn(true);
        userIdRef.current=session.user.id;
        const remoteBuddy=session.user.user_metadata?.fish_buddy;
        const remoteLand=session.user.user_metadata?.fish_land;
        if(remoteBuddy) setPrefs({...buddyDefaults,...remoteBuddy});
        if(remoteLand){
          const next={...economyDefaults,...remoteLand,dailyAwarded:remoteLand.dailyAwarded||{}};
          setEconomy(next);
          localStorage.setItem("neuro-fish-land",JSON.stringify(next));
        }
      }

      const channel=supabase.channel("fish-land-world-v2",{config:{presence:{key:userIdRef.current}}});
      channelRef.current=channel;
      channel
        .on("presence",{event:"sync"},()=>{
          const state=channel.presenceState();
          const players:PresenceFish[]=[];
          Object.entries(state).forEach(([id,entries]:any)=>{
            const p=entries?.[0];
            if(!p) return;
            players.push({
              id,
              name:p.name||"Fish Buddy",
              room:p.room||"island",
              x:Number.isFinite(p.x)?p.x:50,
              y:Number.isFinite(p.y)?p.y:76,
              hat:p.hat||"None",
              outfit:p.outfit||"None",
              bikini:p.bikini||"",
              queueJoinedAt:p.queueJoinedAt||null,
              inConsultation:!!p.inConsultation
            });
          });
          setOnline(players);
        })
        .subscribe(async(status)=>{
          if(status==="SUBSCRIBED"){
            setConnection("Live");
            await channel.track({
              name:prefs.name||"Fish Buddy",room:"island",x:50,y:76,
              hat:prefs.hat,outfit:prefs.outfit,bikini:economy.equippedBikini,
              queueJoinedAt:null,inConsultation:false
            });
          }else if(status==="CHANNEL_ERROR"||status==="TIMED_OUT"){
            setConnection("Reconnecting…");
          }
        });
    });

    const {data:authSub}=supabase.auth.onAuthStateChange((_event,session)=>{
      setSignedIn(!!session?.user);
    });

    return()=>{
      if(trackTimer.current) clearTimeout(trackTimer.current);
      if(channelRef.current) supabase.removeChannel(channelRef.current);
      authSub.subscription.unsubscribe();
    };
  },[]);

  useEffect(()=>{
    const channel=channelRef.current;
    if(!channel) return;
    if(trackTimer.current) clearTimeout(trackTimer.current);
    trackTimer.current=setTimeout(()=>{
      channel.track({
        name:prefs.name||"Fish Buddy",
        room,
        x:pos.x,
        y:pos.y,
        hat:prefs.hat,
        outfit:prefs.outfit,
        bikini:economy.equippedBikini,
        queueJoinedAt,
        inConsultation
      }).catch(()=>{});
    },120);
  },[prefs,room,pos,economy.equippedBikini,queueJoinedAt,inConsultation]);

  async function persistEconomy(next:Economy){
    setEconomy(next);
    localStorage.setItem("neuro-fish-land",JSON.stringify(next));
    const supabase=getSupabaseBrowser();
    if(supabase&&signedIn){
      await supabase.auth.updateUser({data:{fish_land:next}});
    }
  }

  function enterRoom(id:string){
    setRoom(id==="club"?"club-exterior":id);
    setPos({x:50,y:78});
    if(id!=="clinic"){
      setQueueJoinedAt(null);
      setInConsultation(false);
    }
  }

  function moveInRoom(e:PointerEvent<HTMLDivElement>){
    const target=e.target as HTMLElement;
    if(target.closest("button,a,input,select,label")) return;
    const rect=e.currentTarget.getBoundingClientRect();
    const x=Math.max(8,Math.min(92,((e.clientX-rect.left)/rect.width)*100));
    const y=Math.max(18,Math.min(86,((e.clientY-rect.top)/rect.height)*100));
    setPos({x,y});
  }

  const roomPlayers=online.filter(p=>p.room===room&&p.id!==userIdRef.current);
  const currentPlayer:PresenceFish={
    id:userIdRef.current,name:prefs.name||"Fish Buddy",room,x:pos.x,y:pos.y,
    hat:prefs.hat,outfit:prefs.outfit,bikini:economy.equippedBikini,
    queueJoinedAt,inConsultation
  };

  if(room==="island"){
    return <IslandWorld prefs={prefs} economy={economy} online={online} connection={connection} onEnter={enterRoom}/>;
  }

  return (
    <div className={styles.world}>
      <div className={styles.compactBar}>
        <button className={styles.backButton} onClick={()=>enterRoom("island")}>Back to Fish Land</button>
        <div className={styles.roomTitle}>{room==="club-exterior"?"Fishmosh":rooms.find(r=>r.id===room)?.label}</div>
        <div className={styles.statusGroup}>
          <span>{connection}</span>
          <span>{economy.coins} coins</span>
        </div>
      </div>

      {room==="club-exterior" ? (
        <ClubExterior
          prefs={prefs}
          economy={economy}
          onEnter={()=>{setRoom("club");setPos({x:50,y:78});}}
        />
      ) : room==="risk" ? (
        <RiskRoom prefs={prefs} economy={economy} persistEconomy={persistEconomy}/>
      ) : (
        <RoomScene
          room={room}
          me={currentPlayer}
          others={roomPlayers}
          onMove={moveInRoom}
          queueJoinedAt={queueJoinedAt}
          setQueueJoinedAt={setQueueJoinedAt}
          inConsultation={inConsultation}
          setInConsultation={setInConsultation}
          prefs={prefs}
          economy={economy}
          persistEconomy={persistEconomy}
          signedIn={signedIn}
          online={online}
        />
      )}
    </div>
  );
}

function IslandWorld({prefs,economy,online,connection,onEnter}:{prefs:BuddyPrefs;economy:Economy;online:PresenceFish[];connection:string;onEnter:(id:string)=>void}){
  return (
    <div className={styles.world}>
      <div className={styles.compactBar}>
        <div>
          <span className={styles.kicker}>SOCIAL WORLD</span>
          <strong className={styles.brandTitle}>Fish Land</strong>
        </div>
        <div className={styles.statusGroup}>
          <span>{connection}</span>
          <span>{online.length} online</span>
          <span>{economy.coins} coins</span>
        </div>
      </div>

      <section className={styles.islandScene} aria-label="Fish Land interactive map">
        <div className={styles.lightRays}/>
        <div className={styles.bubbleField}><i/><i/><i/><i/><i/><i/></div>
        <div className={styles.distantFish}><span/><span/><span/></div>
        <div className={styles.islandShelf}>
          <div className={styles.mountainRange}/>
          <div className={styles.kelpPatch}><i/><i/><i/><i/><i/></div>
          <div className={styles.coralPatch}><i/><i/><i/></div>
          <MapBuilding room="beach" label="Beach" x="11%" y="58%" onEnter={onEnter} variant="beach"/>
          <MapBuilding room="park" label="Kelp Park" x="29%" y="31%" onEnter={onEnter} variant="park"/>
          <MapBuilding room="clinic" label="Doctor" x="49%" y="18%" onEnter={onEnter} variant="clinic"/>
          <MapBuilding room="club" label="Fishmosh" x="79%" y="22%" onEnter={onEnter} variant="club"/>
          <MapBuilding room="cafe" label="Fish Café" x="51%" y="47%" onEnter={onEnter} variant="cafe"/>
          <MapBuilding room="school" label="Library" x="60%" y="72%" onEnter={onEnter} variant="school"/>
          <MapBuilding room="shop" label="Bikini Shop" x="17%" y="74%" onEnter={onEnter} variant="shop"/>
          <MapBuilding room="redroom" label="Red Room" x="33%" y="69%" onEnter={onEnter} variant="redroom"/>
          <MapBuilding room="risk" label="Enter at your own risk" x="83%" y="72%" onEnter={onEnter} variant="risk"/>
          <div className={styles.mapMe}>
            <FishAvatar prefs={prefs} bikini={economy.equippedBikini} name={prefs.name}/>
          </div>
        </div>
        <div className={styles.mapHint}>Choose a building to enter a room.</div>
      </section>
    </div>
  );
}

function MapBuilding({room,label,x,y,onEnter,variant}:{room:string;label:string;x:string;y:string;onEnter:(id:string)=>void;variant:string}){
  return (
    <button className={styles.mapBuilding+" "+styles["building_"+variant]} style={{left:x,top:y}} onClick={()=>onEnter(room)}>
      <span className={styles.buildingArt}><i/><i/><i/></span>
      <strong>{label}</strong>
    </button>
  );
}

function RoomScene(props:{
  room:string;me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;
  queueJoinedAt:number|null;setQueueJoinedAt:(n:number|null)=>void;
  inConsultation:boolean;setInConsultation:(v:boolean)=>void;
  prefs:BuddyPrefs;economy:Economy;persistEconomy:(e:Economy)=>Promise<void>;
  signedIn:boolean;online:PresenceFish[];
}){
  const common={
    me:props.me,others:props.others,onMove:props.onMove,prefs:props.prefs,economy:props.economy
  };
  if(props.room==="cafe") return <CafeRoom {...common}/>;
  if(props.room==="clinic") return <ClinicRoom {...common} online={props.online} queueJoinedAt={props.queueJoinedAt} setQueueJoinedAt={props.setQueueJoinedAt} inConsultation={props.inConsultation} setInConsultation={props.setInConsultation}/>;
  if(props.room==="club") return <ClubRoom {...common} persistEconomy={props.persistEconomy}/>;
  if(props.room==="beach") return <BeachRoom {...common}/>;
  if(props.room==="shop") return <ShopRoom {...common} persistEconomy={props.persistEconomy} signedIn={props.signedIn}/>;
  if(props.room==="park") return <ParkRoom {...common}/>;
  if(props.room==="school") return <SchoolRoom {...common}/>;
  return <RedRoom {...common}/>;
}

function RoomCanvas({variant,me,others,onMove,children}:{variant:string;me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;children:any}){
  return (
    <section className={styles.roomShell}>
      <div className={styles.roomCanvas+" "+styles["room_"+variant]} onPointerDown={onMove}>
        <div className={styles.roomRays}/>
        <div className={styles.roomBubbles}><i/><i/><i/><i/><i/></div>
        {children}
        <PlayerSprite player={me} self/>
        {others.map(p=><PlayerSprite player={p} key={p.id}/>)}
      </div>
      <div className={styles.moveHint}>Tap or click the floor to swim. Other logged-in players in this room appear live.</div>
    </section>
  );
}

function PlayerSprite({player,self=false}:{player:PresenceFish;self?:boolean}){
  return (
    <div className={styles.playerSprite+(self?" "+styles.selfSprite:"")} style={{left:player.x+"%",top:player.y+"%"}}>
      <FishAvatar prefs={{name:player.name,hat:player.hat||"None",outfit:player.outfit||"None"}} bikini={player.bikini||""} name={player.name} compact/>
      <span>{player.name}{self?" · you":""}</span>
    </div>
  );
}

function FishAvatar({prefs,bikini="",name="",compact=false,eating=false}:{prefs:BuddyPrefs;bikini?:string;name?:string;compact?:boolean;eating?:boolean}){
  const bikiniClass=bikini?styles["bikini_"+bikini]:"";
  return (
    <div className={(compact?styles.fish+" "+styles.fishCompact:styles.fish)+" "+bikiniClass+(eating?" "+styles.eating:"")} aria-label={name||prefs.name}>
      <span className={styles.tail}/>
      <span className={styles.body}><i/><i/><i/><i/><em/></span>
      {bikini&&<span className={styles.swimwear}/>}
      {prefs.hat!=="None"&&<span className={styles.legacyAccessory}>{hats[prefs.hat]||""}</span>}
      {prefs.outfit!=="None"&&<span className={styles.legacyOutfit}>{outfits[prefs.outfit]||""}</span>}
      {eating&&<span className={styles.foodParticles}><i/><i/><i/></span>}
    </div>
  );
}

function CafeRoom({me,others,onMove,prefs,economy}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy}){
  const [eating,setEating]=useState("");
  function order(id:string){
    setEating(id);
    setTimeout(()=>setEating(""),1800);
  }
  return (
    <>
      <RoomCanvas variant="cafe" me={me} others={others} onMove={onMove}>
        <div className={styles.cafeWindow}><i/><i/></div>
        <div className={styles.cafeCounter}><span>PELLET & PLANKTON</span></div>
        <div className={styles.cafeSofa}/>
        <div className={styles.cafeTableOne}/>
        <div className={styles.cafeTableTwo}/>
        <div className={styles.warmLamp+" "+styles.lampOne}/>
        <div className={styles.warmLamp+" "+styles.lampTwo}/>
      </RoomCanvas>
      <div className={styles.controlPanel}>
        <div>
          <span className={styles.kicker}>CAFÉ MENU</span>
          <h2>Order a zebrafish snack</h2>
          <p>Menu items reflect foods used in zebrafish husbandry. The animation is just for Fish Land.</p>
        </div>
        <div className={styles.menuGrid}>
          {foodMenu.map(item=>(
            <button key={item.id} className={styles.menuItem} onClick={()=>order(item.id)}>
              <strong>{item.name}</strong><small>{item.note}</small>
            </button>
          ))}
        </div>
        {eating&&<div className={styles.eatingPreview}><FishAvatar prefs={prefs} bikini={economy.equippedBikini} eating/><span>{prefs.name} is eating {foodMenu.find(f=>f.id===eating)?.name}.</span></div>}
      </div>
    </>
  );
}

function ClinicRoom({me,others,onMove,prefs,economy,online,queueJoinedAt,setQueueJoinedAt,inConsultation,setInConsultation}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy;online:PresenceFish[];queueJoinedAt:number|null;setQueueJoinedAt:(n:number|null)=>void;inConsultation:boolean;setInConsultation:(v:boolean)=>void}){
  const [prescription,setPrescription]=useState("");
  const queue=online.filter(p=>p.room==="clinic"&&p.queueJoinedAt).sort((a,b)=>(a.queueJoinedAt||0)-(b.queueJoinedAt||0));
  const consulting=queue.find(p=>p.inConsultation);
  const first=queue[0];
  const isFirst=first?.id===me.id;
  const position=queue.findIndex(p=>p.id===me.id)+1;

  function leave(){
    setQueueJoinedAt(null);
    setInConsultation(false);
    setPrescription("");
  }
  function askDoctor(){
    const cards=[
      "SSRI-themed role-play card: 'Serotonin Seaweed Reset'. Fictional game item only — no dosing or treatment advice.",
      "MK-801 Research Pass: a fictional lab-themed card referencing MK-801 (dizocilpine), not a real prescription or recommendation.",
      "Quiet Current Pass: fictional rest-and-reset card. No real treatment advice."
    ];
    setPrescription(cards[Math.floor(Math.random()*cards.length)]);
  }

  return (
    <>
      <RoomCanvas variant="clinic" me={me} others={others} onMove={onMove}>
        <div className={styles.clinicReception}><span>RECEPTION</span></div>
        <div className={styles.waitingSeats}><i/><i/><i/><i/></div>
        <div className={styles.consultRoom}/>
        <div className={styles.doctorNpc}><FishAvatar prefs={{name:"Dr. Fin",hat:"Lab cap",outfit:"Lab coat"}} compact/><span>Dr. Fin · NPC</span></div>
        <div className={styles.npcPatient}><FishAvatar prefs={{name:"Mina",hat:"None",outfit:"None"}} compact/><span>Mina · NPC</span></div>
      </RoomCanvas>
      <div className={styles.controlPanel}>
        <div>
          <span className={styles.kicker}>SHARED WAITING QUEUE</span>
          <h2>Doctor's office</h2>
          <p>Only real connected players appear in this queue. Disconnected players disappear automatically.</p>
        </div>
        <div className={styles.queueLayout}>
          <div className={styles.queueList}>
            {queue.length===0?<p>No real players are waiting.</p>:queue.map((p,i)=>(
              <div className={styles.queueRow} key={p.id}>
                <span>{i+1}</span><strong>{p.name}{p.id===me.id?" · you":""}</strong><small>{p.inConsultation?"With doctor":"Waiting"}</small>
              </div>
            ))}
          </div>
          <div className={styles.queueActions}>
            {!queueJoinedAt&&<button className={styles.primaryButton} onClick={()=>setQueueJoinedAt(Date.now())}>Join waiting queue</button>}
            {queueJoinedAt&&!inConsultation&&<><p>You are #{position} in line.</p><button className={styles.secondaryButton} onClick={leave}>Leave queue</button></>}
            {queueJoinedAt&&isFirst&&!consulting&&!inConsultation&&<button className={styles.primaryButton} onClick={()=>setInConsultation(true)}>Enter consultation</button>}
            {inConsultation&&<><button className={styles.primaryButton} onClick={askDoctor}>Ask for a game prescription</button><button className={styles.secondaryButton} onClick={leave}>Finish consultation</button></>}
          </div>
        </div>
        {prescription&&<div className={styles.prescription}><strong>Fictional Fish Land prescription</strong><p>{prescription}</p></div>}
      </div>
    </>
  );
}


function ClubExterior({prefs,economy,onEnter}:{prefs:BuddyPrefs;economy:Economy;onEnter:()=>void}){
  const [checking,setChecking]=useState(false);
  const [answer,setAnswer]=useState("");
  const [message,setMessage]=useState("");

  function submitId(e:FormEvent){
    e.preventDefault();
    const reply=answer.trim().toLowerCase();
    if(reply==="yes, sir, i am"||reply==="yes sir i am"||reply==="yes"||reply==="y"){
      setMessage("ID check passed. Welcome to Fishmosh.");
      setTimeout(onEnter,450);
    }else{
      setMessage("No entry tonight. Fishmosh is 18+.");
    }
  }

  return (
    <section className={styles.clubExterior}>
      <div className={styles.clubSky}><i/><i/><i/></div>
      <div className={styles.clubStreet}>
        <div className={styles.streetLamp+" "+styles.streetLampLeft}/>
        <div className={styles.streetLamp+" "+styles.streetLampRight}/>
        <div className={styles.clubFacade}>
          <div className={styles.clubSign}>FISHMOSH</div>
          <div className={styles.clubUpperWindows}><i/><i/><i/></div>
          <div className={styles.clubDoor}>
            <span className={styles.doorHandle}/>
          </div>
          <div className={styles.velvetRope}><i/><i/><b/></div>
          <div className={styles.bodyguardFish}>
            <FishAvatar prefs={{name:"Bouncer",hat:"None",outfit:"Glasses"}} compact/>
            <strong>Bouncer</strong>
          </div>
        </div>
      </div>

      <div className={styles.clubEntryPanel}>
        <div>
          <span className={styles.kicker}>FISHMOSH · 18+ ENTRY</span>
          <h2>Tonight at Fishmosh</h2>
          <p>Lavender light, deep-blue water, red neon and a packed dance floor.</p>
        </div>
        {!checking ? (
          <button className={styles.primaryButton} onClick={()=>setChecking(true)}>Approach the entrance</button>
        ) : (
          <form className={styles.idCheck} onSubmit={submitId}>
            <div className={styles.bouncerSpeech}>“ID check. Are you 18+?”</div>
            <label>
              <span>Reply to the bouncer</span>
              <input value={answer} onChange={e=>setAnswer(e.target.value)} placeholder='Type “Yes, sir, I am”' autoFocus/>
            </label>
            <div className={styles.actionRow}>
              <button className={styles.primaryButton} type="submit">Show ID</button>
              <button className={styles.secondaryButton} type="button" onClick={()=>{setChecking(false);setAnswer("");setMessage("");}}>Back away</button>
            </div>
          </form>
        )}
        {message&&<div className={styles.feedback}>{message}</div>}
        <div className={styles.entryWallet}>{economy.coins} coins in your wallet · {prefs.name}</div>
      </div>
    </section>
  );
}

function ClubRoom({me,others,onMove,prefs,economy,persistEconomy}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy;persistEconomy:(e:Economy)=>Promise<void>}){
  const [drink,setDrink]=useState("");
  const [barMessage,setBarMessage]=useState("Swim up to the counter when you want a drink.");
  const [danceMessage,setDanceMessage]=useState("Choose a move on the dance floor.");
  const [dancing,setDancing]=useState("");
  const [danceReady,setDanceReady]=useState(true);

  const drinks=[
    {name:"Bubble Berry Fizz",price:3},
    {name:"Kelp Cooler",price:4},
    {name:"Coral Citrus Splash",price:5},
    {name:"Moonwater Mocktail",price:6}
  ];
  const moves=["Fin Spin","Bubble Bounce","Current Slide","Reef Shuffle"];

  async function orderDrink(name:string,price:number){
    if(economy.coins<price){
      setBarMessage("The bartender flicks a fin: “You need "+(price-economy.coins)+" more coin"+(price-economy.coins===1?"":"s")+".”");
      return;
    }
    await persistEconomy({...economy,coins:economy.coins-price});
    setDrink(name);
    setBarMessage("“What's your poison?” — "+prefs.name+" orders a "+name+".");
  }

  async function dance(move:string){
    if(!danceReady){
      setDanceMessage("Catch your breath — another move will be ready in a moment.");
      return;
    }
    setDanceReady(false);
    setDancing(move);
    await persistEconomy({...economy,coins:economy.coins+1});
    setDanceMessage(move+"! +1 coin.");
    setTimeout(()=>{setDanceReady(true);setDancing("");setDanceMessage("Ready for another move.");},4000);
  }

  return (
    <>
      <RoomCanvas variant="club" me={me} others={others} onMove={onMove}>
        <div className={styles.clubCeilingGrid}/>
        <div className={styles.clubBeam+" "+styles.beamRed}/>
        <div className={styles.clubBeam+" "+styles.beamLavender}/>
        <div className={styles.clubBeam+" "+styles.beamGreen}/>
        <div className={styles.clubBeam+" "+styles.beamBlue}/>
        <div className={styles.discoOrb}/>
        <div className={styles.djBooth}><span>FISHMOSH DJ</span></div>
        <div className={styles.danceFloor+(dancing?" "+styles.danceFloorActive:"")}/>
        <div className={styles.clubLounge}><i/><i/><i/></div>
        <div className={styles.drinkBar}><span>BAR</span></div>
        <div className={styles.barStools}><i/><i/><i/><i/></div>
        <div className={styles.bartenderNpc}>
          <FishAvatar prefs={{name:"Mosh",hat:"None",outfit:"Bow tie"}} compact/>
          <span>Mosh · bartender NPC</span>
        </div>
        <div className={styles.waiterNpc}>
          <FishAvatar prefs={{name:"Finn",hat:"Beanie",outfit:"None"}} compact/>
          <span>Finn · waiter NPC</span>
        </div>
      </RoomCanvas>

      <div className={styles.clubDashboard}>
        <section className={styles.clubCard}>
          <span className={styles.kicker}>BAR COUNTER</span>
          <h2>“What's your poison?”</h2>
          <p>{barMessage}</p>
          <div className={styles.drinkMenuGrid}>
            {drinks.map(item=>(
              <button key={item.name} className={styles.drinkTile} onClick={()=>orderDrink(item.name,item.price)}>
                <strong>{item.name}</strong>
                <span>{item.price} coins</span>
              </button>
            ))}
          </div>
          {drink&&<div className={styles.servedDrink}><span/><strong>{drink}</strong><small>served to {prefs.name}</small></div>}
        </section>

        <section className={styles.clubCard}>
          <span className={styles.kicker}>DANCE FLOOR · EARN COINS</span>
          <h2>Choose your move</h2>
          <p>{danceMessage}</p>
          <div className={styles.danceMoves}>
            {moves.map(move=><button key={move} className={styles.danceMove} disabled={!danceReady} onClick={()=>dance(move)}>{move}</button>)}
          </div>
          <div className={styles.coinRule}>Each completed dance move earns 1 coin. Four-second cooldown between rewards.</div>
        </section>
      </div>
    </>
  );
}

function BeachRoom({me,others,onMove,prefs,economy}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy}){
  const [running,setRunning]=useState(false);
  const [seconds,setSeconds]=useState(15);
  const [phase,setPhase]=useState(0);
  const [dir,setDir]=useState(1);
  const [score,setScore]=useState(0);
  const [message,setMessage]=useState("Start a 15-second rally.");

  useEffect(()=>{
    if(!running) return;
    const t=setInterval(()=>{
      setPhase(p=>{
        let next=p+dir*5;
        if(next>=100){next=100;setDir(-1);}
        if(next<=0){next=0;setDir(1);}
        return next;
      });
    },90);
    return()=>clearInterval(t);
  },[running,dir]);

  useEffect(()=>{
    if(!running) return;
    if(seconds<=0){setRunning(false);setMessage("Rally over. Score: "+score);return;}
    const t=setTimeout(()=>setSeconds(s=>s-1),1000);
    return()=>clearTimeout(t);
  },[running,seconds,score]);

  function start(){setScore(0);setSeconds(15);setPhase(0);setDir(1);setMessage("Hit when the ball is over the net zone.");setRunning(true);}
  function hit(){
    if(!running) return;
    const good=phase>=42&&phase<=58;
    if(good){setScore(s=>s+1);setMessage("Clean hit.");setDir(d=>d*-1);}
    else setMessage("Missed — wait for the centre zone.");
  }

  return (
    <>
      <RoomCanvas variant="beach" me={me} others={others} onMove={onMove}>
        <div className={styles.beachHorizon}/>
        <div className={styles.volleyballCourt}><div className={styles.volleyballNet}/></div>
        <div className={styles.beachUmbrella}/>
        <div className={styles.shellCluster}><i/><i/><i/></div>
      </RoomCanvas>
      <div className={styles.controlPanel}>
        <span className={styles.kicker}>BEACH VOLLEYBALL</span>
        <h2>Quick rally</h2>
        <div className={styles.volleyTrack}><span className={styles.volleyTarget}/><span className={styles.volleyBall} style={{left:phase+"%"}}/></div>
        <div className={styles.volleyMeta}><strong>{score} hits</strong><span>{seconds}s</span><span>{message}</span></div>
        <div className={styles.actionRow}>
          <button className={styles.primaryButton} onClick={running?hit:start}>{running?"Hit":"Start rally"}</button>
          {running&&<button className={styles.secondaryButton} onClick={()=>setRunning(false)}>Stop</button>}
        </div>
      </div>
    </>
  );
}

function ShopRoom({me,others,onMove,prefs,economy,persistEconomy,signedIn}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy;persistEconomy:(e:Economy)=>Promise<void>;signedIn:boolean}){
  const [preview,setPreview]=useState(economy.equippedBikini);
  const [message,setMessage]=useState("");

  async function buy(itemId:string){
    const item=bikinis.find(b=>b.id===itemId);
    if(!item) return;
    if(economy.ownedBikinis.includes(itemId)){
      await persistEconomy({...economy,equippedBikini:itemId});
      setPreview(itemId);setMessage("Equipped "+item.name+".");return;
    }
    if(economy.coins<item.price){setMessage("You need "+(item.price-economy.coins)+" more coins.");return;}
    const next={...economy,coins:economy.coins-item.price,ownedBikinis:[...economy.ownedBikinis,itemId],equippedBikini:itemId};
    await persistEconomy(next);setPreview(itemId);setMessage("Purchased and equipped "+item.name+".");
  }
  async function remove(){
    await persistEconomy({...economy,equippedBikini:""});
    setPreview("");setMessage("Swimwear removed.");
  }

  return (
    <>
      <RoomCanvas variant="shop" me={me} others={others} onMove={onMove}>
        <div className={styles.shopCounter}/>
        <div className={styles.shopRack}><i/><i/><i/><i/></div>
        <div className={styles.shopMirror}/>
        <div className={styles.hippieNpc}><FishAvatar prefs={{name:"Marley",hat:"Beanie",outfit:"Scarf"}} compact/><span>Marley · shopkeeper NPC</span></div>
      </RoomCanvas>
      <div className={styles.controlPanel}>
        <div className={styles.shopHeader}>
          <div><span className={styles.kicker}>BIKINI FISH STORE</span><h2>Swimwear for Fish Land</h2><p>{economy.coins} coins available. Earn 1 coin per 10 metres in the daily descent game.</p></div>
          <div className={styles.previewTank}><FishAvatar prefs={prefs} bikini={preview}/><small>Preview</small></div>
        </div>
        <div className={styles.shopGrid}>
          {bikinis.map(item=>{
            const owned=economy.ownedBikinis.includes(item.id);
            const equipped=economy.equippedBikini===item.id;
            return <div className={styles.shopItem} key={item.id}>
              <div className={styles.swatch+" "+styles["swatch_"+item.id]}/>
              <strong>{item.name}</strong><p>{item.desc}</p><span>{item.price} coins</span>
              <div className={styles.actionRow}>
                <button className={styles.secondaryButton} onClick={()=>setPreview(item.id)}>Preview</button>
                <button className={styles.primaryButton} onClick={()=>buy(item.id)}>{equipped?"Equipped":owned?"Equip":"Buy"}</button>
              </div>
            </div>;
          })}
        </div>
        <div className={styles.actionRow}><button className={styles.secondaryButton} onClick={remove}>Remove equipped swimwear</button></div>
        {!signedIn&&<p className={styles.warningText}>Sign in to sync purchases and coins across devices. Guest progress is stored only on this browser.</p>}
        {message&&<p className={styles.feedback}>{message}</p>}
      </div>
    </>
  );
}

function ParkRoom({me,others,onMove}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy}){
  return <RoomCanvas variant="park" me={me} others={others} onMove={onMove}><div className={styles.kelpGarden}><i/><i/><i/><i/><i/><i/></div><div className={styles.parkBench}/><div className={styles.bubbleFountain}/><div className={styles.parkPath}/></RoomCanvas>;
}

function SchoolRoom({me,others,onMove}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy}){
  return (
    <>
      <RoomCanvas variant="school" me={me} others={others} onMove={onMove}>
        <div className={styles.bookshelfOne}/><div className={styles.bookshelfTwo}/><div className={styles.studyDesk}/><div className={styles.studyDeskTwo}/><div className={styles.board}><span>NEUROETHOLOGY NOTES</span></div>
      </RoomCanvas>
      <div className={styles.controlPanel}><div className={styles.actionRow}><Link className={styles.primaryLink} href="/research">Research Catalogue</Link><Link className={styles.secondaryLink} href="/handbook">Lab Handbook</Link></div></div>
    </>
  );
}

function RedRoom({me,others,onMove}:{me:PresenceFish;others:PresenceFish[];onMove:(e:PointerEvent<HTMLDivElement>)=>void;prefs:BuddyPrefs;economy:Economy}){
  return (
    <>
      <RoomCanvas variant="redroom" me={me} others={others} onMove={onMove}>
        <div className={styles.redBookshelf}/><div className={styles.redReadingPod}/><div className={styles.redReadingPodTwo}/><div className={styles.redCoral}/>
      </RoomCanvas>
      <div className={styles.controlPanel}><span className={styles.kicker}>READING ROOM</span><h2>Nicotine studies</h2><p>This room is a themed portal for lab-approved reading and research references. It does not provide smoking instructions or medical advice.</p><Link className={styles.secondaryLink} href="/research">Open Research Catalogue</Link></div>
    </>
  );
}

function RiskRoom({prefs,economy,persistEconomy}:{prefs:BuddyPrefs;economy:Economy;persistEconomy:(e:Economy)=>Promise<void>}){
  const day=todayKey();
  const daily=useMemo(()=>{
    const start=seededIndex(day,promptBank.length);
    return Array.from({length:6},(_,i)=>promptBank[(start+i*5)%promptBank.length]);
  },[day]);
  const [started,setStarted]=useState(false);
  const [round,setRound]=useState(0);
  const [answer,setAnswer]=useState("");
  const [seconds,setSeconds]=useState(20);
  const [depth,setDepth]=useState(0);
  const [feedback,setFeedback]=useState("");
  const [dead,setDead]=useState(false);
  const [revive,setRevive]=useState(5);
  const [finished,setFinished]=useState(false);
  const [earned,setEarned]=useState(0);

  useEffect(()=>{
    if(!started||dead||finished) return;
    if(seconds<=0){setDead(true);setRevive(5);setFeedback("Time ran out. The Oscar cichlid found you.");return;}
    const t=setTimeout(()=>setSeconds(s=>s-1),1000);
    return()=>clearTimeout(t);
  },[seconds,started,dead,finished]);

  useEffect(()=>{
    if(!dead) return;
    if(revive<=0){
      setDead(false);setStarted(false);setRound(0);setAnswer("");setSeconds(20);setDepth(0);setFeedback("Rejuvenated. Ready for another descent.");setFinished(false);return;
    }
    const t=setTimeout(()=>setRevive(v=>v-1),1000);
    return()=>clearTimeout(t);
  },[dead,revive]);

  async function awardForDepth(newDepth:number){
    const previous=economy.dailyAwarded[day]||0;
    if(newDepth<=previous) return 0;
    const previousCoins=Math.floor(previous/10);
    const eligibleCoins=Math.floor(newDepth/10);
    const delta=Math.max(0,eligibleCoins-previousCoins);
    const next={...economy,coins:economy.coins+delta,dailyAwarded:{...economy.dailyAwarded,[day]:newDepth}};
    await persistEconomy(next);
    setEarned(e=>e+delta);
    return delta;
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(dead||finished||!answer.trim()) return;
    const prompt=daily[round];
    const raw=normalize(answer);
    const canonical=prompt.aliases?.[raw]||raw.replace(/\s+/g,"");
    const score=prompt.answers[canonical];
    if(score===undefined){
      setFeedback("Not in today's curated answer set. Try a synonym or a more typical answer — the timer keeps running.");
      return;
    }
    const result=commonnessResult(score);
    const nextDepth=depth+result.drop;
    const delta=await awardForDepth(nextDepth);
    setDepth(nextDepth);
    setFeedback(result.label+" on our curated commonness index: descended "+result.drop+" m"+(delta?" and earned "+delta+" coin"+(delta===1?"":"s")+".":"."));
    setAnswer("");
    setSeconds(20);
    if(round===daily.length-1) setFinished(true);
    else setRound(r=>r+1);
  }

  function begin(){
    setStarted(true);setRound(0);setAnswer("");setSeconds(20);setDepth(0);setFeedback("");setDead(false);setRevive(5);setFinished(false);setEarned(0);
  }

  return (
    <section className={styles.riskWorld}>
      <div className={styles.trench}>
        <div className={styles.trenchLight}/>
        <div className={styles.trenchLabels}><span>Sunlit</span><span>Twilight</span><span>Midnight</span><span>Abyss</span><span>Trench</span></div>
        {!dead&&<div className={styles.riskFish} style={{top:Math.min(88,10+depth*.32)+"%"}}><FishAvatar prefs={prefs} bikini={economy.equippedBikini} compact/><small>{depth} m</small></div>}
        {dead&&<div className={styles.oscarAttack}><div className={styles.oscarFish}><span/><i/><b/></div><div className={styles.chompRing}/></div>}
      </div>
      <div className={styles.riskConsole}>
        <span className={styles.kicker}>DAILY DESCENT · {day}</span>
        {!started&&!dead&&<><h1>Enter at Your Own Risk</h1><p>Six daily prompts. You have 20 seconds per answer. More common answers in our curated answer set move you farther down. Scores are editorial commonness weights, not measured population frequencies and not based on current players.</p><button className={styles.primaryButton} onClick={begin}>Start descent</button></>}
        {started&&!dead&&!finished&&<>
          <div className={seconds<=5?styles.timer+" "+styles.timerDanger:styles.timer}>{seconds}</div>
          <small>Prompt {round+1} of {daily.length}</small>
          <h2>{daily[round].q}</h2>
          <form className={styles.answerForm} onSubmit={submit}><input value={answer} onChange={e=>setAnswer(e.target.value)} autoFocus placeholder="Type an answer"/><button type="submit">Dive</button></form>
        </>}
        {dead&&<div className={styles.deathPanel}><h2>CHOMP.</h2><p>An Oscar cichlid ate {prefs.name}. Rejuvenating in <strong>{revive}</strong> seconds.</p></div>}
        {finished&&<div className={styles.finishPanel}><h2>Descent complete</h2><p>{prefs.name} reached <strong>{depth} metres</strong> and earned <strong>{earned} coin{earned===1?"":"s"}</strong> this run.</p><button className={styles.primaryButton} onClick={begin}>Play again</button></div>}
        {feedback&&<div className={styles.feedback}>{feedback}</div>}
        <div className={styles.rewardRule}>Coin rule: 1 coin per 10 metres of your best awarded distance for the day. Replays only award new distance beyond what was already rewarded.</div>
      </div>
    </section>
  );
}
