import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'Alla fält krävs' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error: dbError } = await supabase.from('contact_messages').insert({
    name, email, subject, message,
  });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Send email notification via Resend
  // To enable: add RESEND_API_KEY to .env.local (get key from https://resend.com)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'utvecklare.ai <noreply@utvecklare.ai>',
        to: 'info@utvecklare.ai',
        replyTo: email,
        subject: `Kontaktformulär: ${subject}`,
        html: `
          <h2>Nytt meddelande från kontaktformuläret</h2>
          <p><strong>Namn:</strong> ${escapeHtml(name)}</p>
          <p><strong>E-post:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
          <p><strong>Ämne:</strong> ${escapeHtml(subject)}</p>
          <hr />
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
        `,
      });
    } catch (emailErr) {
      // Log but don't fail the request — the message is already saved in Supabase
      console.error('Resend email failed:', emailErr);
    }
  } else {
    // TODO: Konfigurera RESEND_API_KEY i .env.local för att aktivera mailnotifieringar
    console.warn('RESEND_API_KEY saknas — ingen mailnotifiering skickad för kontaktmeddelande');
  }

  return NextResponse.json({ success: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
