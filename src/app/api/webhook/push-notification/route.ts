import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Kurdish push notification text per notification type
const PUSH_TEXT: Record<string, { title: string; body: string }> = {
  request_received: {
    title: 'ڕێ',
    body: 'داواکارییەکی نوێت هەیە بۆ گەشتەکەت',
  },
  request_approved: {
    title: 'ڕێ',
    body: 'داواکارییەکەت قبوڵکرا! دەتوانیت پەیوەندی بە شۆفێرەکە بکەیت',
  },
  request_declined: {
    title: 'ڕێ',
    body: 'داواکارییەکەت ڕەتکرایەوە',
  },
  ride_cancelled: {
    title: 'ڕێ',
    body: 'گەشتەکەت هەڵوەشایەوە',
  },
  passenger_cancelled: {
    title: 'ڕێ',
    body: 'سەرنشینێک گەشتەکەی هەڵوەشاندەوە',
  },
  ride_completed: {
    title: 'ڕێ',
    body: 'گەشتەکەت تەواوبوو! تکایە هەڵسەنگاندن بکە',
  },
  ride_updated: {
    title: 'ڕێ',
    body: 'وردەکاری گەشتەکەت نوێکرایەوە',
  },
  verification_approved: {
    title: 'ڕێ',
    body: 'پشتڕاستکراوە! ئێستا دەتوانیت گەشت پۆستبکەیت.',
  },
  verification_declined: {
    title: 'ڕێ',
    body: 'داواکارییەکەت ڕەتکرایەوە. تکایە پەیوەندی بە پشتگیری بکە.',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret');
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    // Supabase webhook sends { type: 'INSERT', table: 'notifications', record: {...} }
    const record = body.record;
    if (!record?.user_id || !record?.type) {
      return NextResponse.json({ error: 'Missing user_id or type' }, { status: 400 });
    }

    // Fetch recipient's push token
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('expo_push_token')
      .eq('id', record.user_id)
      .single();

    if (!profile?.expo_push_token) {
      return NextResponse.json({ skipped: true, reason: 'no push token' });
    }

    // Look up push text
    const text = PUSH_TEXT[record.type] || { title: 'ڕێ', body: 'ئاگاداریت هەیە' };

    // Send via Expo push API
    const pushRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.expo_push_token,
        title: text.title,
        body: text.body,
        data: {
          type: record.type,
          ride_id: record.ride_id || null,
          notification_id: record.id || null,
        },
      }),
    });

    const pushResult = await pushRes.json();
    return NextResponse.json({ success: true, pushResult });
  } catch (e: any) {
    console.error('Push webhook error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
