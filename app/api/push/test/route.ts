import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export async function POST(req:NextRequest){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publicKey=process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey=process.env.VAPID_PRIVATE_KEY;
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!url||!anon||!publicKey||!privateKey||!token){
    return NextResponse.json({error:"Push test is not configured."},{status:500});
  }

  const db=createClient(url,anon,{auth:{persistSession:false},global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user) return NextResponse.json({error:"Please sign in first."},{status:401});

  const {data:subs,error}=await db.from("push_subscriptions").select("endpoint,p256dh,auth").eq("user_id",user.id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  if(!subs?.length) return NextResponse.json({error:"Enable app notifications on this device first."},{status:400});

  webpush.setVapidDetails("https://neuroethology-lab.onrender.com",publicKey,privateKey);

  let sent=0;
  for(const sub of subs){
    try{
      await webpush.sendNotification({
        endpoint:sub.endpoint,
        keys:{p256dh:sub.p256dh,auth:sub.auth}
      },JSON.stringify({
        title:"Neuroethology Lab",
        body:"Hi! This is a test reminder from the lab app 🐟",
        url:"/tasks",
        tag:"test-reminder"
      }));
      sent++;
    }catch{}
  }

  if(!sent) return NextResponse.json({error:"The test could not be delivered. Try disabling and re-enabling notifications on this device."},{status:500});
  return NextResponse.json({ok:true,sent});
}
