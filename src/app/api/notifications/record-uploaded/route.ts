import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordName } = await request.json();

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const emailContent = emailTemplates.recordUploaded(recordName);
    const result = await sendEmail({
      to: profile.email,
      ...emailContent,
    });

    if (!result.success) {
      console.error('Email send failed:', result.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}