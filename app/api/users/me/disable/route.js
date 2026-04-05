export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { getSession, clearSession } from '../../../../../lib/auth';

// POST — disable (deactivate) account
export async function POST() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { getDB } = await import('../../../../../lib/cloudflare');
    const db = getDB();
    const now = Math.floor(Date.now() / 1000);

    await db.prepare(
      "UPDATE users SET account_status = 'disabled', updated_at = ? WHERE id = ?"
    ).bind(now, session.userId).run();

    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Disable account error:', e);
    return NextResponse.json({ error: 'Failed to disable account' }, { status: 500 });
  }
}
