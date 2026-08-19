import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('rooms').select('id, name, slug').order('name');

  if (error) {
        console.error('Failed to fetch rooms', error);
        return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json(data);
}
