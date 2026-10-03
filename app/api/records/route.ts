import { NextRequest, NextResponse } from "next/server";
import { getSupabaseForRequest } from "../../../lib/supabaseServer";

const allowed=new Set(["people","projects","setups","research","stock","commitments"]);

function unavailable(){
  return NextResponse.json({error:"Shared database is not connected yet."},{status:503});
}

export async function GET(req:NextRequest){
  const db=getSupabaseForRequest(req.headers.get("authorization")?.replace(/^Bearer\s+/i,""));
  if(!db) return unavailable();
  const id=req.nextUrl.searchParams.get("id");
  if(id){
    const {data,error}=await db.from("app_records").select("*").eq("id",id).single();
    if(error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({record:data});
  }
  const kind=req.nextUrl.searchParams.get("kind")||"";
  if(!allowed.has(kind)) return NextResponse.json({error:"Invalid record type."},{status:400});
  const {data,error}=await db.from("app_records").select("*").eq("kind",kind).order("created_at",{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({records:data||[]});
}

export async function POST(req:NextRequest){
  const db=getSupabaseForRequest(req.headers.get("authorization")?.replace(/^Bearer\s+/i,""));
  if(!db) return unavailable();
  const body=await req.json();
  if(!allowed.has(body.kind)) return NextResponse.json({error:"Invalid record type."},{status:400});
  if(!body.data || typeof body.data!=="object") return NextResponse.json({error:"Missing record data."},{status:400});
  const {data,error}=await db.from("app_records").insert({kind:body.kind,data:body.data}).select("*").single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({record:data},{status:201});
}

export async function PATCH(req:NextRequest){
  const db=getSupabaseForRequest(req.headers.get("authorization")?.replace(/^Bearer\s+/i,""));
  if(!db) return unavailable();
  const body=await req.json();
  if(!body.id || !body.data) return NextResponse.json({error:"Missing id or data."},{status:400});
  const {data,error}=await db.from("app_records").update({data:body.data,updated_at:new Date().toISOString()}).eq("id",body.id).select("*").single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({record:data});
}

export async function DELETE(req:NextRequest){
  const db=getSupabaseForRequest(req.headers.get("authorization")?.replace(/^Bearer\s+/i,""));
  if(!db) return unavailable();
  const id=req.nextUrl.searchParams.get("id");
  if(!id) return NextResponse.json({error:"Missing id."},{status:400});
  const {error}=await db.from("app_records").delete().eq("id",id);
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({ok:true});
}
