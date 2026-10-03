import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient(req:NextRequest){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!url||!key||!token) return null;
  return createClient(url,key,{auth:{persistSession:false},global:{headers:{Authorization:`Bearer ${token}`}}});
}

export async function POST(req:NextRequest){
  const db=getClient(req);
  if(!db) return NextResponse.json({error:"Sign in before enabling push notifications."},{status:401});
  const {data:{user}}=await db.auth.getUser();
  if(!user?.email) return NextResponse.json({error:"Could not identify signed-in user."},{status:401});
  const body=await req.json();
  if(!body?.subscription?.endpoint) return NextResponse.json({error:"Missing push subscription."},{status:400});
  const reminderMinutes=Number(body.reminderMinutes||15);
  const {error}=await db.from("push_subscriptions").upsert({
    user_id:user.id,
    email:user.email,
    endpoint:body.subscription.endpoint,
    p256dh:body.subscription.keys?.p256dh,
    auth:body.subscription.keys?.auth,
    reminder_minutes:reminderMinutes,
    user_agent:req.headers.get("user-agent")||null,
    updated_at:new Date().toISOString()
  },{onConflict:"endpoint"});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}

export async function DELETE(req:NextRequest){
  const db=getClient(req);
  if(!db) return NextResponse.json({error:"Sign in first."},{status:401});
  const body=await req.json();
  const endpoint=body?.endpoint;
  if(!endpoint) return NextResponse.json({error:"Missing endpoint."},{status:400});
  const {error}=await db.from("push_subscriptions").delete().eq("endpoint",endpoint);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
