import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json(
      { status: 'ok', service: 'DojoFlow', database: 'connected', latency_ms: Date.now() - start, timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', service: 'DojoFlow', database: 'unreachable', error: err.message, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
