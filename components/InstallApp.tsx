"use client";
import { useEffect, useState } from "react";

type InstallPromptEvent=Event & {
  prompt:()=>Promise<void>;
  userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>;
};

export function InstallApp(){
  const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);
  const [installed,setInstalled]=useState(false);
  const [showHelp,setShowHelp]=useState(false);

  useEffect(()=>{
    if(window.matchMedia("(display-mode: standalone)").matches){
      setInstalled(true);
    }
    const handler=(event:Event)=>{
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const installedHandler=()=>{setInstalled(true);setPromptEvent(null);};
    window.addEventListener("beforeinstallprompt",handler);
    window.addEventListener("appinstalled",installedHandler);
    return()=>{
      window.removeEventListener("beforeinstallprompt",handler);
      window.removeEventListener("appinstalled",installedHandler);
    };
  },[]);

  async function install(){
    if(installed) return;
    if(promptEvent){
      await promptEvent.prompt();
      const result=await promptEvent.userChoice;
      if(result.outcome==="accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    setShowHelp(v=>!v);
  }

  return <div className="install-wrap">
    <button className="header-login install-button" onClick={install} disabled={installed}>
      {installed?"Installed":"Install app"}
    </button>
    {showHelp&&!installed&&<div className="install-help">
      <strong>Install Neuroethology Lab</strong>
      <p>On iPhone/iPad: tap Share, then “Add to Home Screen”.</p>
      <p>On Chrome/Edge: open the browser menu and choose “Install app” or “Add to Home screen”.</p>
    </div>}
  </div>;
}
