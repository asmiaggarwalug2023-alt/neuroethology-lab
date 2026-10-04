import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CRON_SECRET=process.env.PUSH_CRON_SECRET;
const PUBLIC_KEY=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY=process.env.VAPID_PRIVATE_KEY;

async function rpc(name:string,body:any){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{
    method:"POST",
    headers:{
      apikey:SUPABASE_ANON_KEY!,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body),
    cache:"no-store"
  });
  if(!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function POST(req:NextRequest){
  if(!CRON_SECRET || req.headers.get("x-cron-secret")!==CRON_SECRET){
    return NextResponse.json({error:"Unauthorized"},{status:401});
  }
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!PUBLIC_KEY||!PRIVATE_KEY){
    return NextResponse.json({error:"Push environment is incomplete."},{status:500});
  }

  webpush.setVapidDetails("https://neuroethology-lab.onrender.com",PUBLIC_KEY,PRIVATE_KEY);

  let sent=0;
  let failed=0;

  try{
    const jobs=await rpc("get_due_push_jobs",{p_secret:CRON_SECRET}) as Array<any>;
    for(const job of jobs){
      try{
        await webpush.sendNotification({
          endpoint:job.endpoint,
          keys:{p256dh:job.p256dh,auth:job.auth}
        },JSON.stringify({
          title:"Neuroethology Lab",
          body:`${job.task} in ${job.reminder_minutes} minutes · ${job.start_time}`,
          url:"/tasks",
          tag:`commitment-${job.commitment_id}`
        }));
        sent++;
        await rpc("mark_push_job_sent",{
          p_secret:CRON_SECRET,
          p_subscription_id:job.subscription_id,
          p_commitment_id:job.commitment_id
        });
      }catch{failed++;}
    }

    const welfare=await rpc("get_due_welfare_alerts",{p_secret:CRON_SECRET}) as Array<any>;
    for(const alert of welfare){
      try{
        await webpush.sendNotification({
          endpoint:alert.endpoint,
          keys:{p256dh:alert.p256dh,auth:alert.auth}
        },JSON.stringify({
          title:"Neuroethology Lab",
          body:alert.message,
          url:"/tasks",
          tag:`welfare-${alert.alert_key}`
        }));
        sent++;
        await rpc("mark_welfare_alert_sent",{
          p_secret:CRON_SECRET,
          p_subscription_id:alert.subscription_id,
          p_alert_key:alert.alert_key
        });
      }catch{failed++;}
    }

    return NextResponse.json({ok:true,sent,failed});
  }catch(e:any){
    return NextResponse.json({error:e.message||"Push check failed."},{status:500});
  }
}
