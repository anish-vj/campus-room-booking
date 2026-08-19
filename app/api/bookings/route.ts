import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCampusNow, isDateInBookingWindow } from '@/lib/time';
import { DATE_RE, isValidEmail } from '@/lib/validation';
import { sendBookingConfirmationEmail } from '@/lib/email';

function getBaseUrl(request: NextRequest): string {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    const proto = request.headers.get('x-forwarded-proto') ?? 'https';
    const host = request.headers.get('host');
    return `${proto}://${host}`;
}

export async function POST(request: NextRequest) {
    let body: Record<string, unknown>;
    try {
          body = await request.json();
    } catch {
          return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

  const { room_slug: roomSlug, student_name: studentName, student_email: studentEmail, booking_date: bookingDate, slot_hour: slotHour } = body;

  if (
        !roomSlug ||
        typeof roomSlug !== 'string' ||
        !studentName ||
        typeof studentName !== 'string' ||
        !studentName.trim() ||
        !studentEmail ||
        typeof studentEmail !== 'string' ||
        !bookingDate ||
        typeof bookingDate !== 'string' ||
        slotHour === undefined ||
        slotHour === null
      ) {
        return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  if (!isValidEmail(studentEmail)) {
        return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
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

  if (!DATE_RE.test(bookingDate) || !isDateInBookingWindow(bookingDate)) {
        return NextResponse.json({ error: 'date_out_of_range' }, { status: 400 });
  }

  const hourNum = Number(slotHour);
    if (!Number.isInteger(hourNum) || hourNum < 0 || hourNum > 23) {
          return NextResponse.json({ error: 'invalid_slot' }, { status: 400 });
    }

  const { dateStr: today, hour: currentHour } = getCampusNow();
    if (bookingDate === today && hourNum <= currentHour) {
          return NextResponse.json({ error: 'slot_in_past' }, { status: 400 });
    }

  const { data: inserted, error: insertError } = await supabase
      .from('bookings')
      .insert({
              room_id: room.id,
              student_name: studentName.trim(),
              student_email: studentEmail.trim(),
              booking_date: bookingDate,
              slot_hour: hourNum,
      })
      .select('id, booking_date, slot_hour, status, cancellation_token')
      .single();

  if (insertError) {
        if (insertError.code === '23505') {
                return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
        }
        console.error('Failed to insert booking', insertError);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  const baseUrl = getBaseUrl(request);
    sendBookingConfirmationEmail({
          to: studentEmail.trim(),
          studentName: studentName.trim(),
          roomName: room.name,
          date: bookingDate,
          hour: hourNum,
          cancellationToken: inserted.cancellation_token,
          baseUrl,
    }).catch((err) => console.error('Failed to send confirmation email', err));

  return NextResponse.json(
    {
            id: inserted.id,
            room: room.name,
            booking_date: inserted.booking_date,
            slot_hour: inserted.slot_hour,
            status: inserted.status,
    },
    { status: 201 },
      );
}
