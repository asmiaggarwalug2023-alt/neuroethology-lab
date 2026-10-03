const url=process.env.PUSH_ENDPOINT;
const secret=process.env.PUSH_CRON_SECRET;

if(!url||!secret){
  console.error("Missing PUSH_ENDPOINT or PUSH_CRON_SECRET");
  process.exit(1);
}

fetch(url,{
  method:"POST",
  headers:{"x-cron-secret":secret}
}).then(async response=>{
  const body=await response.text();
  console.log(response.status,body);
  if(!response.ok) process.exit(1);
}).catch(error=>{
  console.error(error);
  process.exit(1);
});
