"use client";
import { useEffect } from "react";
import { authFetch } from "../lib/authFetch";

type Commitment = {id:string;data:{task:string;date:string;start:string;end:string;name:string}};

function taskTimeMs(date:string,start:string){
  return new Date(`${date}T${start}:00+05:30`).getTime();
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
    const delta=(m.day-today+7)%7;
    const candidate=new Date(base.getTime()+delta*86400000+m.hour*3600000+m.minute*60000);
    if(candidate.getTime()<now.getTime()) candidate.setTime(candidate.getTime()+7*86400000);
    result.push({id:m.id,title:m.title,time:candidate.getTime()});
  }
  return result;
}

export function NotificationWatcher(){
  useEffect(()=>{
    async function run(){
      if(!("Notification" in window) || Notification.permission!=="granted") return;
      if(localStorage.getItem("neuro-notifications-enabled")!=="true") return;

      const lead=Number(localStorage.getItem("neuro-reminder-minutes")||15);
      const now=Date.now();
      const upcoming=recurringUpcoming(new Date());

      try{
        const r=await authFetch("/api/records?kind=commitments",{cache:"no-store"});
        if(r.ok){
          const j=await r.json();
          const rows=(j.records||[]) as Commitment[];
          rows.forEach(row=>{
            const time=taskTimeMs(row.data.date,row.data.start);
            if(time>=now-60000){
              upcoming.push({
                id:`task-${row.id}`,
                title:`Lab responsibility: ${row.data.task}`,
                time
              });
            }
          });
        }
      }catch{}

      upcoming.forEach(item=>{
        const diff=item.time-now;
        if(diff>0 && diff<=lead*60000){
          const key=`neuro-notified-${item.id}-${item.time}`;
          if(sessionStorage.getItem(key)) return;
          new Notification(item.title,{body:`Starts in about ${Math.max(1,Math.round(diff/60000))} minutes.`});
          sessionStorage.setItem(key,"1");
        }
      });
    }

    run();
    const timer=window.setInterval(run,30000);
    return()=>window.clearInterval(timer);
  },[]);
  return null;
}
