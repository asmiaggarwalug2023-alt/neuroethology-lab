import { getSupabaseBrowser } from "./supabaseBrowser";

export async function authFetch(input:RequestInfo|URL, init:RequestInit={}){
  const supabase=getSupabaseBrowser();
  if(!supabase) return fetch(input,init);
  const {data}=await supabase.auth.getSession();
  const token=data.session?.access_token;
  const headers=new Headers(init.headers||{});
  if(token) headers.set("Authorization",`Bearer ${token}`);
  return fetch(input,{...init,headers});
}
