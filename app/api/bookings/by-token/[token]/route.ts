import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
    const { token } = params;

  const supabase = getSupabaseAdmin();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('status, booking_date, slot_hour, student_name, rooms(name, slug)')
      .eq('cancellation_token', token)
      .maybeSingle();

  if (error) {
        console.error('Failed to fetch booking by token', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
    if (!booking) {
          return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

  const room = booking.rooms as unknown as { name: string; slug: string } | null;

  return NextResponse.json({
        room: { name: room?.name, slug: room?.slug },
        booking_date: booking.booking_date,
        slot_hour: booking.slot_hour,
        status: booking.status,
        student_name: booking.student_name,
  });
}
