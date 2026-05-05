'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { confirmSubpageDelete } from '../../../utils/subpageDelete';

// A dedicated card for canvas sub-pages. Visually heavier than the regular
// subpage chip so authors can tell at a glance there's a sketch behind it.
// Click → /edit/<blogId>/<subpageId> (the route detects kind === 'canvas'
// and renders the iframe-based sketch editor).
export const CanvasBlock = createReactBlockSpec(
  {
    type: 'canvasBlock',
    propSchema: {
      subpageId: { default: '' },
      title: { default: 'Untitled Canvas' },
      blogId: { default: '' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const { subpageId, title, blogId: storedBlogId } = block.props;
      const [resolvedTitle, setResolvedTitle] = useState(title || 'Untitled Canvas');
      const [editingTitle, setEditingTitle] = useState(false);
      const titleInputRef = useRef(null);

      // Resolve the parent blog id. Prefer the value baked into the block's
      // props, then the live editor's blogId (BlogEditor publishes it on
      // window so we can navigate even when the URL hasn't switched yet —
      // e.g. /new-blog before the first draft autosave), then the URL.
      const resolveBlogId = () => {
        if (storedBlogId) return storedBlogId;
        if (typeof window !== 'undefined' && window.__lixblogs_currentBlogId) {
          return window.__lixblogs_currentBlogId;
        }
        const m = window.location.pathname.match(/\/edit\/([^/]+)/);
        return m?.[1] || '';
      };

      // Sync title from the server in case the canvas was renamed in the
      // sketch app — same pattern as TabsBlock.
      useEffect(() => {
        if (!subpageId) return;
        const blogId = resolveBlogId();
        if (!blogId) return;
        let cancelled = false;
        fetch(`/api/subpages?blogId=${blogId}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (cancelled || !data?.subpages) return;
            const match = data.subpages.find((sp) => sp.id === subpageId);
            if (match && match.title && match.title !== resolvedTitle) {
              setResolvedTitle(match.title);
              if (match.title !== title) {
                try { editor.updateBlock(block, { props: { title: match.title } }); } catch {}
              }
            }
          })
          .catch(() => {});
        return () => { cancelled = true; };
      // resolvedTitle / title intentionally not in deps — we only sync on
      // mount or when the underlying subpage id changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [subpageId]);

      const open = useCallback(() => {
        if (!subpageId) return;
        const blogId = resolveBlogId();
        if (!blogId) return; // best-effort; the editor's blogId will normally be there
        window.location.href = `/edit/${blogId}/${subpageId}`;
      // resolveBlogId is recreated each render but reads from props / global
      // / URL only, so the underlying inputs are the real deps.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [subpageId, storedBlogId]);

      // Inline title editing on the card itself. Persists to /api/subpages
      // and updates the block's prop so the change survives reloads.
      const startEditTitle = useCallback((e) => {
        e?.stopPropagation?.();
        setEditingTitle(true);
      }, []);

      const commitTitle = useCallback(async (raw) => {
        const next = (raw ?? '').trim() || 'Untitled Canvas';
        setEditingTitle(false);
        if (next === resolvedTitle) return;
        setResolvedTitle(next);
        try { editor.updateBlock(block, { props: { title: next } }); } catch {}
        if (subpageId) {
          try {
            await fetch('/api/subpages', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: subpageId, title: next }),
            });
          } catch {}
        }
      }, [resolvedTitle, editor, block, subpageId]);

      useEffect(() => {
        if (editingTitle && titleInputRef.current) {
          titleInputRef.current.focus();
          titleInputRef.current.select();
        }
      }, [editingTitle]);

      const remove = useCallback(async (e) => {
        e?.stopPropagation?.();
        if (subpageId) {
          const ok = await confirmSubpageDelete(subpageId, { fallbackKind: 'canvas' });
          if (!ok) return;
          try { await fetch(`/api/subpages?id=${subpageId}`, { method: 'DELETE' }); } catch {}
        }
        try { editor.removeBlocks([block.id]); } catch {}
      }, [subpageId, editor, block.id]);

      const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          e.stopPropagation();
          remove(e);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          open();
        }
      };

      return (
        <div
          className="canvas-block"
          contentEditable={false}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={open}
          role="button"
          aria-label={`Open canvas: ${resolvedTitle}`}
        >
          <div className="canvas-block-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
              <circle cx="14" cy="6" r="0.5" fill="currentColor" />
            </svg>
          </div>
          <div className="canvas-block-body">
            <div className="canvas-block-title-row">
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  className="canvas-block-title-input"
                  defaultValue={resolvedTitle}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') { e.preventDefault(); commitTitle(e.target.value); }
                    else if (e.key === 'Escape') { e.preventDefault(); setEditingTitle(false); }
                  }}
                  onBlur={(e) => commitTitle(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <span
                  className="canvas-block-title"
                  onClick={startEditTitle}
                  title="Click to rename"
                >
                  {resolvedTitle}
                </span>
              )}
              <span className="canvas-block-badge">Canvas</span>
            </div>
            <span className="canvas-block-hint">Click to open the sketch canvas</span>
          </div>
          <button
            className="canvas-block-delete"
            onClick={remove}
            title="Remove canvas"
            aria-label="Remove canvas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="canvas-block-arrow"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      );
    },
  }
);
