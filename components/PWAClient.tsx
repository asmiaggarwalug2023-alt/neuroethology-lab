"use client";
import { useEffect } from "react";

export function PWAClient(){
  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
  },[]);
  return null;
}
