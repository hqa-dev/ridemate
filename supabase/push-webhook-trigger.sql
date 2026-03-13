-- Push Notification Webhook Trigger
-- Run this in Supabase Dashboard > SQL Editor
-- This creates a trigger that calls the push notification webhook
-- whenever a new row is inserted into the notifications table.

-- Enable pg_net extension (should already be enabled on Supabase)
create extension if not exists pg_net with schema extensions;

-- Create the trigger function
create or replace function public.notify_push_on_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://ridemate-roan.vercel.app/api/webhook/push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', '238a4b488553b9ed6a21ceef0f7fefe38108255d2905273f7a23122666d5a9a5'
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notifications',
      'record', jsonb_build_object(
        'id', NEW.id,
        'user_id', NEW.user_id,
        'type', NEW.type,
        'ride_id', NEW.ride_id,
        'from_user_id', NEW.from_user_id,
        'ride_request_id', NEW.ride_request_id,
        'metadata', NEW.metadata
      )
    )
  );
  return NEW;
end;
$$;

-- Drop existing trigger if any
drop trigger if exists push_notification_on_insert on public.notifications;

-- Create the trigger
create trigger push_notification_on_insert
  after insert on public.notifications
  for each row
  execute function public.notify_push_on_insert();
