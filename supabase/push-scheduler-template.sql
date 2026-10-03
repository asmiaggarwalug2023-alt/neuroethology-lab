-- Run after push-notifications.sql.
-- Replace __PUSH_CRON_SECRET__ with the Render PUSH_CRON_SECRET value.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid)
from cron.job
where jobname = 'neuroethology-lab-push-reminders';

select cron.schedule(
  'neuroethology-lab-push-reminders',
  '*/5 * * * *',
  $$
    select net.http_post(
      url := 'https://neuroethology-lab.onrender.com/api/push/send',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-cron-secret','__PUSH_CRON_SECRET__'
      ),
      body := '{}'::jsonb
    );
  $$
);
