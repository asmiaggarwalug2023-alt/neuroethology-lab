"use client";
import { useEffect } from "react";

type Signup = { name:string; date:string; start:string; end:string };

function taskTimeMs(a:Signup){
  return new Date(`${a.date}T${a.start}:00+05:30`).getTime();
}

function recurringUpcoming(now:Date){
  const result:{id:string;title:string;time:number}[]=[];
  const meetings=[
    {id:"asp",title:"ASP Thesis Meeting",day:1,hour:9,minute:30},
    {id:"lab",title:"Lab Meeting",day:3,hour:13,minute:30},
  ];
  const formatter=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",weekday:"short"});
  const parts=formatter.formatToParts(now);
  const map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const dateStr=`${map.year}-${map.month}-${map.day}`;
  const base=new Date(`${dateStr}T00:00:00+05:30`);
  const weekdayMap:Record<string,number>={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  const today=weekdayMap[map.weekday];
  for(const m of meetings){
    let delta=(m.day-today+7)%7;
    const candidate=new Date(base.getTime()+delta*86400000+m.hour*3600000+m.minute*60000);
    if(candidate.getTime()<now.getTime()) candidate.setTime(candidate.getTime()+7*86400000);
    result.push({id:m.id,title:m.title,time:candidate.getTime()});
  }
  return result;
}

export function NotificationWatcher(){
  useEffect(()=>{
    const run=()=>{
      if(!("Notification" in window) || Notification.permission!=="granted") return;
      if(localStorage.getItem("neuro-notifications-enabled")!=="true") return;
      const lead=Number(localStorage.getItem("neuro-reminder-minutes")||15);
      const now=Date.now();
      const upcoming=recurringUpcoming(new Date());
      const raw=localStorage.getItem("neuroethology-task-signups");
      if(raw){
        try{
          const tasks=JSON.parse(raw) as Record<string,Signup>;
          Object.entries(tasks).forEach(([title,a])=>upcoming.push({id:`task-${title}-${a.date}-${a.start}`,title:`Lab task: ${title}`,time:taskTimeMs(a)}));
        }catch{}
      }
      upcoming.forEach(item=>{
        const diff=item.time-now;
        if(diff>0 && diff<=lead*60000){
          const key=`neuro-notified-${item.id}-${item.time}`;
          if(sessionStorage.getItem(key)) return;
          new Notification(item.title,{body:`Starts in about ${Math.max(1,Math.round(diff/60000))} minutes.`});
          sessionStorage.setItem(key,"1");
        }
      });
    };
    run();
    const timer=window.setInterval(run,30000);
    return()=>window.clearInterval(timer);
  },[]);
  return null;
}
