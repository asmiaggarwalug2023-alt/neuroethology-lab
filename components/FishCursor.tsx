"use client";
import { useEffect, useState } from "react";

export function FishCursor(){
  const [pos,setPos]=useState({x:-100,y:-100});
  const [enabled,setEnabled]=useState(true);
  useEffect(()=>{
    const fn=(e:MouseEvent)=>setPos({x:e.clientX,y:e.clientY});
    window.addEventListener("mousemove",fn);
    return()=>window.removeEventListener("mousemove",fn);
  },[]);
  if(!enabled) return null;
  return <div className="fish-cursor" style={{left:pos.x,top:pos.y}} onDoubleClick={()=>setEnabled(false)} aria-hidden>🐟</div>;
}
