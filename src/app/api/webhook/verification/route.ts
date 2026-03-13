import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = 'hawkara@icloud.com';
const ADMIN_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ridemate.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Supabase webhook sends: { type, table, record, old_record, schema }
    const { record, old_record } = body;

    // Only notify when verification_status changes TO 'pending'
    if (
      record?.verification_status !== 'pending' ||
      old_record?.verification_status === 'pending'
    ) {
      return NextResponse.json({ skipped: true });
    }

    const userName = record.full_name || 'Unknown';
    const userRole = record.role || 'unknown';
    const userId = record.id;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: NOTIFY_EMAIL,
        subject: `New driver verification: ${userName}`,
        html: `
          <h2>New Verification Submission</h2>
          <p><strong>Name:</strong> ${userName}</p>
          <p><strong>Role:</strong> ${userRole}</p>
          <p><strong>User ID:</strong> ${userId}</p>
          <br/>
          <a href="${ADMIN_URL}/admin" style="background:#E8470A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Review in Admin Panel
          </a>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ sent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
