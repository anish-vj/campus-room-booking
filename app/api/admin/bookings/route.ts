import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase';
import { COOKIE_NAME, verifySessionToken } from '@/lib/admin-session';

export async function GET(request: NextRequest) {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!verifySessionToken(token)) {
          return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

  const { searchParams } = new URL(request.url);
    const roomSlug = searchParams.get('room_slug');
    const date = searchParams.get('date');

  const supabase = getSupabaseAdmin();
    let query = supabase
      .from('bookings')
      .select('id, student_name, student_email, booking_date, slot_hour, status, created_at, rooms!inner(name, slug)')
      .order('created_at', { ascending: false });

  if (roomSlug) query = query.eq('rooms.slug', roomSlug);
    if (date) query = query.eq('booking_date', date);

  const { data, error } = await query;
    if (error) {
          console.error('Failed to fetch admin bookings', error);
          return NextResponse.json({ error: 'server_error' }, { status: 500 });
    }

  const bookings = (data ?? []).map((b) => {
        const room = b.rooms as unknown as { name: string; slug: string } | null;
        return {
                id: b.id,
                room: room?.name,
                room_slug: room?.slug,
                student_name: b.student_name,
                student_email: b.student_email,
                booking_date: b.booking_date,
                slot_hour: b.slot_hour,
                status: b.status,
                created_at: b.created_at,
        };
  });

  return NextResponse.json(bookings);
}
