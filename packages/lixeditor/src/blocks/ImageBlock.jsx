'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Generic image block for @elixpo/lixeditor.
 * Supports: Upload via file picker, embed via URL, paste, drag-and-drop.
 * No product-specific dependencies (no AI, no cloud upload API).
 *
 * For custom upload behavior, consumers should override this block spec
 * or use the `extraBlockSpecs` prop on LixEditor.
 */
export const BlogImageBlock = createReactBlockSpec(
  {
    type: 'image',
    propSchema: {
      url: { default: '' },
      caption: { default: '' },
      previewWidth: { default: 740 },
      name: { default: '' },
      showPreview: { default: true },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const url = block.props.url;
      const [mode, setMode] = useState('idle');
      const [embedUrl, setEmbedUrl] = useState('');
      const [embedError, setEmbedError] = useState('');
      const [isDragOver, setIsDragOver] = useState(false);
      const [caption, setCaption] = useState(block.props.caption || '');
      const wrapperRef = useRef(null);
      const fileInputRef = useRef(null);

      // Delete empty image block on backspace
      useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        function handleKey(e) {
          if ((e.key === 'Backspace' || e.key === 'Delete') && mode === 'idle' && !url) {
            e.preventDefault();
            try { editor.removeBlocks([block.id]); } catch {}
          }
        }
        el.addEventListener('keydown', handleKey);
        return () => el.removeEventListener('keydown', handleKey);
      }, [editor, block.id, mode, url]);

      // File upload — reads as data URL (consumers can override with custom upload)
      const uploadFile = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setMode('uploading');
        try {
          const reader = new FileReader();
          reader.onload = () => {
            editor.updateBlock(block.id, { props: { url: reader.result, name: file.name } });
            setMode('idle');
          };
          reader.onerror = () => { setMode('idle'); };
          reader.readAsDataURL(file);
        } catch {
          setMode('idle');
        }
      }, [editor, block.id]);

      // Paste handler
      const handlePaste = useCallback((e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            e.preventDefault();
            uploadFile(item.getAsFile());
            return;
          }
        }
      }, [uploadFile]);

      // Drag and drop
      const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (file?.type.startsWith('image/')) uploadFile(file);
      }, [uploadFile]);

      // Embed URL submit
      const handleEmbed = useCallback(() => {
        const trimmed = embedUrl.trim();
        if (!trimmed) return;
        if (!trimmed.startsWith('http')) {
          setEmbedError('URL must start with http:// or https://');
          return;
        }
        editor.updateBlock(block.id, { props: { url: trimmed } });
        setMode('idle');
        setEmbedUrl('');
        setEmbedError('');
      }, [embedUrl, editor, block.id]);

      // Save caption
      const saveCaption = useCallback((val) => {
        setCaption(val);
        editor.updateBlock(block.id, { props: { caption: val } });
      }, [editor, block.id]);

      // ── Empty state: upload or embed ──
      if (!url) {
        return (
          <div
            ref={wrapperRef}
            tabIndex={0}
            contentEditable={false}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            className="lix-image-block-empty"
            style={{ borderColor: isDragOver ? 'var(--lix-accent, #9b7bf7)' : undefined, background: isDragOver ? 'var(--lix-accent-subtle, rgba(155,123,247,0.06))' : undefined }}
          >
            {mode === 'uploading' ? (
              <div className="lix-image-status">
                <div className="lix-image-spinner" />
                <span>Processing...</span>
              </div>
            ) : mode === 'embed' ? (
              <div className="lix-image-embed-form">
                <input
                  value={embedUrl}
                  onChange={(e) => { setEmbedUrl(e.target.value); setEmbedError(''); }}
                  onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') handleEmbed(); if (e.key === 'Escape') setMode('idle'); }}
                  placeholder="https://example.com/image.jpg"
                  autoFocus
                  className="lix-image-embed-input"
                />
                {embedError && <span className="lix-image-embed-error">{embedError}</span>}
                <div className="lix-image-embed-actions">
                  <button onClick={() => setMode('idle')} className="lix-btn-cancel">Cancel</button>
                  <button onClick={handleEmbed} className="lix-btn-save">Embed</button>
                </div>
              </div>
            ) : (
              <div className="lix-image-buttons">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); }} />
                <button onClick={() => fileInputRef.current?.click()} className="lix-image-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload
                </button>
                <button onClick={() => setMode('embed')} className="lix-image-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  Embed URL
                </button>
              </div>
            )}
          </div>
        );
      }

      // ── Has image ──
      return (
        <figure contentEditable={false} className="lix-image-block">
          <div className="lix-image-container group">
            <img src={url} alt={caption} className="lix-image" />
            {/* Hover actions */}
            <div className="lix-image-hover-actions">
              <button onClick={() => { editor.updateBlock(block.id, { props: { url: '' } }); }} className="lix-image-hover-btn" title="Remove image">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          </div>
          {/* Caption */}
          <input
            value={caption}
            onChange={(e) => saveCaption(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Add a caption..."
            className="lix-image-caption"
          />
        </figure>
      );
    },
  }
);
