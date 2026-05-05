'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import '@elixpo/lixsketch/react/styles';

// LixSketchCanvas pulls in the engine + react chrome. Lazy-loaded so the
// regular blog editor doesn't pay the bundle cost.
const LixSketchCanvas = dynamic(
  () => import('@elixpo/lixsketch/react').then((m) => m.LixSketchCanvas),
  { ssr: false, loading: () => null }
);

export default function CanvasSubpage({ slugid, subpageId, initialTitle, initialContent, initialMetadata }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle || 'Untitled Canvas');
  const [editingTitle, setEditingTitle] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | dirty | syncing | synced | error
  const lastSavedJsonRef = useRef('');

  // Persist scene + metadata to /api/subpages on every debounced engine change.
  const handleSceneChange = useCallback(async (scene, metadata) => {
    const json = JSON.stringify(scene);
    if (json === lastSavedJsonRef.current) return;
    lastSavedJsonRef.current = json;
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/subpages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subpageId, content: scene, metadata }),
      });
      if (res.ok) {
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus((s) => (s === 'synced' ? 'idle' : s)), 4000);
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [subpageId]);

  // Engine images upload through the parent blog's media route so they
  // count against the same per-blog budget as inline blog images.
  const handleUploadImage = useCallback(async (dataUrl) => {
    const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!m) return { error: 'Unsupported encoding' };
    const mime = m[1];
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const ext = (mime.split('/')[1] || 'png').split('+')[0];
    const file = new File([bytes], `canvas_${Date.now()}.${ext}`, { type: mime });

    const fd = new FormData();
    fd.append('file', file);
    fd.append('blogId', slugid);
    fd.append('type', 'image');

    const res = await fetch('/api/media/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.error || `HTTP ${res.status}` };
    }
    return await res.json();
  }, [slugid]);

  const handleExit = useCallback(() => {
    router.push(`/edit/${slugid}`);
  }, [router, slugid]);

  const saveTitle = useCallback(async (newTitle) => {
    const t = (newTitle || '').trim() || 'Untitled Canvas';
    setTitle(t);
    setEditingTitle(false);
    try {
      await fetch('/api/subpages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subpageId, title: t }),
      });
    } catch {}
  }, [subpageId]);

  const statusLabel = {
    idle: '',
    dirty: 'Editing…',
    syncing: 'Saving…',
    synced: 'Saved',
    error: 'Save failed',
  }[syncStatus];

  const statusDot = {
    syncing: 'bg-yellow-400 animate-pulse',
    synced: 'bg-green-400',
    error: 'bg-red-400',
  }[syncStatus];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      {/* Slim header */}
      <header className="flex items-center justify-between h-12 px-4 border-b border-[var(--border-default)] bg-[var(--bg-app)]/90 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/edit/${slugid}`}
            className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-[13px] hidden sm:inline">Back to blog</span>
          </Link>
          <span className="text-[var(--text-faint)] text-sm">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
            </svg>
            {editingTitle ? (
              <input
                autoFocus
                defaultValue={title}
                onBlur={(e) => saveTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle(e.target.value);
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className="text-[13px] font-medium bg-transparent outline-none border-b border-[#9b7bf7] text-[var(--text-primary)] w-48"
              />
            ) : (
              <span
                className="text-[13px] font-medium text-[var(--text-primary)] cursor-pointer hover:text-[#9b7bf7] transition-colors truncate"
                onClick={() => setEditingTitle(true)}
                title="Click to rename"
              >
                {title}
              </span>
            )}
            <span
              className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-semibold"
              style={{
                color: '#9b7bf7',
                backgroundColor: 'rgba(155,123,247,0.12)',
                border: '1px solid rgba(155,123,247,0.3)',
              }}
            >
              Canvas
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          {statusDot && <span className={`w-2 h-2 rounded-full ${statusDot}`} />}
          {statusLabel && <span>{statusLabel}</span>}
        </div>
      </header>

      {/* Canvas — mounted directly via the package (no iframe). */}
      <div className="relative flex-1 min-h-0">
        <LixSketchCanvas
          initialScene={initialContent}
          onSceneChange={handleSceneChange}
          onUploadImage={handleUploadImage}
          onExit={handleExit}
        />
      </div>
    </div>
  );
}
