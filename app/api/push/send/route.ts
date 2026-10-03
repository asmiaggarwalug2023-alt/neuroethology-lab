import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const CRON_SECRET=process.env.PUSH_CRON_SECRET;
const PUBLIC_KEY=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY=process.env.VAPID_PRIVATE_KEY;

export async function POST(req:NextRequest){
  if(!CRON_SECRET || req.headers.get("x-cron-secret")!==CRON_SECRET){
    return NextResponse.json({error:"Unauthorized"},{status:401});
  }
  if(!SUPABASE_URL||!SUPABASE_ANON_KEY||!PUBLIC_KEY||!PRIVATE_KEY){
    return NextResponse.json({error:"Push environment is incomplete."},{status:500});
  }

  webpush.setVapidDetails("https://neuroethology-lab.onrender.com",PUBLIC_KEY,PRIVATE_KEY);

  const dueRes=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_due_push_jobs`,{
    method:"POST",
    headers:{
      apikey:SUPABASE_ANON_KEY,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({p_secret:CRON_SECRET}),
    cache:"no-store"
  });

  if(!dueRes.ok){
    return NextResponse.json({error:await dueRes.text()},{status:500});
  }

  const jobs=await dueRes.json() as Array<any>;
  let sent=0;
  let failed=0;

  for(const job of jobs){
    const payload=JSON.stringify({
      title:"Neuroethology Lab",
      body:`${job.task} in ${job.reminder_minutes} minutes · ${job.start_time}`,
      url:"/tasks",
      tag:`commitment-${job.commitment_id}`
    });

    try{
      await webpush.sendNotification({
        endpoint:job.endpoint,
        keys:{p256dh:job.p256dh,auth:job.auth}
      },payload);
      sent++;

      await fetch(`${SUPABASE_URL}/rest/v1/rpc/mark_push_job_sent`,{
        method:"POST",
        headers:{
          apikey:SUPABASE_ANON_KEY,
          Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          p_secret:CRON_SECRET,
          p_subscription_id:job.subscription_id,
          p_commitment_id:job.commitment_id
        })
      });
    }catch{
      failed++;
    }
  }

  return NextResponse.json({ok:true,sent,failed,count:jobs.length});
}
