const CACHE="neuroethology-lab-v2";
const CORE=["/","/tasks","/calendar","/fish-care","/manifest.webmanifest","/app-icon.svg"];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
      return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match("/")))
  );
});

self.addEventListener("push",event=>{
  let data={};
  try{data=event.data?event.data.json():{};}catch{}
  const title=data.title||"Neuroethology Lab";
  const options={
    body:data.body||"You have an upcoming lab responsibility.",
    icon:"/app-icon.svg",
    badge:"/app-icon.svg",
    tag:data.tag||"neuroethology-reminder",
    data:{url:data.url||"/tasks"},
    renotify:false
  };
  event.waitUntil(self.registration.showNotification(title,options));
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target=event.notification.data?.url||"/tasks";
  event.waitUntil(
    self.clients.matchAll({type:"window",includeUncontrolled:true}).then(clients=>{
      for(const client of clients){
        if("focus" in client){
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
