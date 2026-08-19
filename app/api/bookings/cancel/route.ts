import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendCancellationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
          body = await request.json();
    } catch {
          return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

  const token = body?.token;
    if (!token || typeof token !== 'string') {
          return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

  const supabase = getSupabaseAdmin();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, status, booking_date, slot_hour, student_name, student_email, rooms(name)')
      .eq('cancellation_token', token)
      .maybeSingle();

  if (error) {
        console.error('Failed to fetch booking for cancellation', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
    if (!booking) {
          return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (booking.status === 'cancelled') {
          return NextResponse.json({ error: 'already_cancelled' }, { status: 409 });
    }

  const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', booking.id);

  if (updateError) {
        console.error('Failed to cancel booking', updateError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const room = booking.rooms as unknown as { name: string } | null;
    sendCancellationEmail({
          to: booking.student_email,
          studentName: booking.student_name,
          roomName: room?.name ?? 'your room',
          date: booking.booking_date,
          hour: booking.slot_hour,
    }).catch((err) => console.error('Failed to send cancellation email', err));

  return NextResponse.json({ status: 'cancelled' });
}
