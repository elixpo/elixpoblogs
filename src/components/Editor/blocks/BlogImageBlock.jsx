'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { compressBlogImage } from '../../../utils/compressImage';

/**
 * Custom blog image block with:
 * - Themed placeholder frame (click, drag-drop, paste to add image)
 * - Full-width display with suitable height
 * - Edit options (replace, caption, delete)
 * - Backspace/Delete to remove
 */
export const BlogImageBlock = createReactBlockSpec(
  {
    type: 'blogImage',
    propSchema: {
      url: { default: '' },
      caption: { default: '' },
      alt: { default: '' },
      uploading: { default: false },
      blogId: { default: '' },
    },
    content: 'none',
  },
  {
    render: (props) => <BlogImageRenderer {...props} />,
  }
);

function BlogImageRenderer({ block, editor }) {
  const { url, caption, alt, uploading, blogId } = block.props;
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(uploading);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [captionText, setCaptionText] = useState(caption);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const blockRef = useRef(null);

  // Handle keyboard: backspace/delete to remove block
  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    function handleKeyDown(e) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        try { editor.removeBlocks([block.id]); } catch {}
      }
    }

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [editor, block.id]);

  const uploadImage = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);
    setUploadProgress('Compressing...');

    try {
      const { blob } = await compressBlogImage(file);

      setUploadProgress('Uploading...');

      const formData = new FormData();
      formData.append('file', blob, `image_${Date.now()}.webp`);
      if (blogId || block.props.blogId) formData.append('blogId', blogId || block.props.blogId);
      formData.append('type', 'image');

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();

      editor.updateBlock(block.id, {
        props: { url: data.url, uploading: false },
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadProgress('Upload failed. Click to retry.');
    } finally {
      setIsUploading(false);
    }
  }, [editor, block.id, blogId, block.props.blogId]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) uploadImage(file);
  }, [uploadImage]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!url && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [url, isUploading]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  }, [uploadImage]);

  // Handle paste on this block
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadImage(file);
        return;
      }
    }
  }, [uploadImage]);

  const handleDelete = useCallback(() => {
    try { editor.removeBlocks([block.id]); } catch {}
  }, [editor, block.id]);

  const handleReplace = useCallback(() => {
    setShowEditMenu(false);
    fileInputRef.current?.click();
  }, []);

  const handleCaptionSave = useCallback(() => {
    editor.updateBlock(block.id, {
      props: { caption: captionText },
    });
    setIsEditing(false);
  }, [editor, block.id, captionText]);

  // Placeholder (no image yet)
  if (!url) {
    return (
      <div
        ref={blockRef}
        className="blog-image-placeholder"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onPaste={handlePaste}
        data-drag-over={isDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div className="blog-image-uploading">
            <div className="blog-image-upload-spinner" />
            <span>{uploadProgress}</span>
          </div>
        ) : (
          <div className="blog-image-placeholder-content">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="blog-image-placeholder-text">
              Click, drag & drop, or paste an image
            </span>
            <span className="blog-image-placeholder-hint">
              Supports JPG, PNG, WebP, GIF
            </span>
          </div>
        )}
      </div>
    );
  }

  // Image loaded
  return (
    <div
      ref={blockRef}
      className="blog-image-block"
      tabIndex={0}
      onPaste={handlePaste}
    >
      <div className="blog-image-wrapper">
        <img
          src={url}
          alt={alt || caption || 'Blog image'}
          className="blog-image-img"
          draggable={false}
        />

        {/* Hover overlay with edit options */}
        <div className="blog-image-overlay">
          <div className="blog-image-actions">
            <button
              className="blog-image-action-btn"
              onClick={handleReplace}
              title="Replace image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Replace
            </button>
            <button
              className="blog-image-action-btn"
              onClick={() => setIsEditing(!isEditing)}
              title="Edit caption"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Caption
            </button>
            <button
              className="blog-image-action-btn blog-image-action-delete"
              onClick={handleDelete}
              title="Delete image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Caption */}
      {isEditing ? (
        <div className="blog-image-caption-edit">
          <input
            type="text"
            value={captionText}
            onChange={(e) => setCaptionText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCaptionSave();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onBlur={handleCaptionSave}
            placeholder="Add a caption..."
            className="blog-image-caption-input"
            autoFocus
          />
        </div>
      ) : caption ? (
        <p
          className="blog-image-caption"
          onClick={() => setIsEditing(true)}
        >
          {caption}
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
