import { NextResponse } from 'next/server';
import { getSession } from '../../../../lib/auth';
import { getLimits } from '../../../../lib/tiers';

export async function POST(request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const blogId = formData.get('blogId');
  const mediaType = formData.get('type') || 'image'; // image | avatar | banner | cover

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const { getDB, getR2 } = await import('../../../../lib/cloudflare');
  const db = getDB();
  const r2 = getR2();

  const user = await db.prepare('SELECT tier, storage_used_bytes FROM users WHERE id = ?')
    .bind(session.userId).first();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const limits = getLimits(user.tier);
  const fileBytes = file.size;

  // Check total storage limit
  if (user.storage_used_bytes + fileBytes > limits.totalStorageBytes) {
    return NextResponse.json({
      error: 'Storage limit exceeded',
      used: user.storage_used_bytes,
      limit: limits.totalStorageBytes,
      tier: user.tier,
    }, { status: 413 });
  }

  // Check per-blog image limit
  if (blogId) {
    const blogUsage = await db.prepare(
      'SELECT COALESCE(SUM(size_bytes), 0) as total FROM media_uploads WHERE blog_id = ?'
    ).bind(blogId).first();

    if (blogUsage.total + fileBytes > limits.imagePerBlogBytes) {
      return NextResponse.json({
        error: 'Per-blog image limit exceeded',
        used: blogUsage.total,
        limit: limits.imagePerBlogBytes,
        tier: user.tier,
      }, { status: 413 });
    }
  }

  // Build R2 key based on type
  let r2Key;
  const ext = 'webp';
  if (mediaType === 'avatar') {
    r2Key = `users/${session.userId}/avatar.${ext}`;
  } else if (mediaType === 'banner') {
    r2Key = `users/${session.userId}/banner.${ext}`;
  } else if (mediaType === 'cover' && blogId) {
    r2Key = `blogs/${blogId}/cover.${ext}`;
  } else if (blogId) {
    r2Key = `blogs/${blogId}/${crypto.randomUUID()}.${ext}`;
  } else {
    r2Key = `users/${session.userId}/${crypto.randomUUID()}.${ext}`;
  }

  // For avatar/banner, delete old file and media_upload record first
  if (mediaType === 'avatar' || mediaType === 'banner') {
    const old = await db.prepare('SELECT id, size_bytes FROM media_uploads WHERE r2_key = ?')
      .bind(r2Key).first();
    if (old) {
      await r2.delete(r2Key);
      await db.prepare('DELETE FROM media_uploads WHERE id = ?').bind(old.id).run();
      await db.prepare('UPDATE users SET storage_used_bytes = storage_used_bytes - ? WHERE id = ?')
        .bind(old.size_bytes, session.userId).run();
    }
  }

  // Upload to R2
  const arrayBuffer = await file.arrayBuffer();
  await r2.put(r2Key, arrayBuffer, {
    httpMetadata: { contentType: file.type || 'image/webp' },
  });

  // Track in media_uploads
  const mediaId = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db.prepare(`
    INSERT INTO media_uploads (id, user_id, blog_id, r2_key, size_bytes, media_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(mediaId, session.userId, blogId || null, r2Key, fileBytes, mediaType, now).run();

  // Update user storage
  await db.prepare('UPDATE users SET storage_used_bytes = storage_used_bytes + ? WHERE id = ?')
    .bind(fileBytes, session.userId).run();

  // Update user profile R2 keys if avatar/banner
  if (mediaType === 'avatar') {
    await db.prepare('UPDATE users SET avatar_r2_key = ? WHERE id = ?').bind(r2Key, session.userId).run();
  } else if (mediaType === 'banner') {
    await db.prepare('UPDATE users SET banner_r2_key = ? WHERE id = ?').bind(r2Key, session.userId).run();
  }

  return NextResponse.json({
    id: mediaId,
    r2Key,
    url: `/api/media/${r2Key}`,
    sizeBytes: fileBytes,
  });
}
