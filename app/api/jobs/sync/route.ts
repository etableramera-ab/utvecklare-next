import { NextRequest, NextResponse } from 'next/server';
import { syncJobsFromJobTech } from '@/lib/jobtech/sync-jobs';

export const maxDuration = 300; // 5 minutes (Vercel Pro)

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await syncJobsFromJobTech();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Job sync failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Also allow GET for easy manual testing in browser (admin only)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await syncJobsFromJobTech();
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
