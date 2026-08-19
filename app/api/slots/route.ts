import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isDateInBookingWindow } from '@/lib/time';
import { DATE_RE } from '@/lib/validation';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const roomSlug = searchParams.get('room_slug');
    const date = searchParams.get('date');

  if (!date || !DATE_RE.test(date) || !isDateInBookingWindow(date)) {
        return NextResponse.json({ error: 'date_out_of_range' }, { status: 400 });
  }

  if (!roomSlug) {
        return NextResponse.json({ error: 'room_not_found' }, { status: 404 });
  }

  const supabase = getSupabaseAdmin();
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, slug')
      .eq('slug', roomSlug)
      .maybeSingle();

  if (roomError) {
        console.error('Failed to fetch room', roomError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
    if (!room) {
          return NextResponse.json({ error: 'room_not_found' }, { status: 404 });
    }

  const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('slot_hour')
      .eq('room_id', room.id)
      .eq('booking_date', date)
      .eq('status', 'confirmed');

  if (bookingsError) {
        console.error('Failed to fetch bookings for slots', bookingsError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const bookedHours = new Set((bookings ?? []).map((b) => b.slot_hour));
    const slots = Array.from({ length: 24 }, (_, hour) => ({
          hour,
          booked: bookedHours.has(hour),
    }));

  return NextResponse.json({
        room: { slug: room.slug, name: room.name },
        date,
        slots,
  });
}
