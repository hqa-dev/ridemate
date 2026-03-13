import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['hawiefr@gmail.com', 'hawkarakrd@gmail.com', 'hawkara@icloud.com'];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action } = body as { userId: string; action: 'approve' | 'decline' };

    if (!userId || !['approve', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify the caller is an admin by checking their auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update profile
    const newStatus = action === 'approve' ? 'verified' : 'declined';
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({ verification_status: newStatus })
      .eq('id', userId);

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Insert notification (bypasses RLS with service role)
    const notifType = action === 'approve' ? 'verification_approved' : 'verification_declined';
    const { error: notifErr } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: notifType,
        ride_id: null,
        from_user_id: null,
        ride_request_id: null,
        metadata: null,
      });

    if (notifErr) {
      console.error('Notification insert error:', notifErr);
      return NextResponse.json({ success: true, notifError: notifErr.message });
    }

    // Send push notification if user has a push token
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('expo_push_token')
      .eq('id', userId)
      .single();

    if (profile?.expo_push_token) {
      const pushBody = action === 'approve'
        ? 'پشتڕاستکراوە! ئێستا دەتوانیت گەشت پۆستبکەیت.'
        : 'داواکارییەکەت ڕەتکرایەوە. تکایە پەیوەندی بە پشتگیری بکە.';

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: profile.expo_push_token,
          title: 'ڕێ',
          body: pushBody,
          data: { type: notifType },
        }),
      }).catch((err) => console.error('Push notification error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
