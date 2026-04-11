'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useState, useEffect, useRef, useCallback } from 'react';

function stripDelimiters(raw) {
  let s = raw.trim();
  if (s.startsWith('\\[') && s.endsWith('\\]')) return s.slice(2, -2).trim();
  if (s.startsWith('$$') && s.endsWith('$$')) return s.slice(2, -2).trim();
  if (s.startsWith('\\(') && s.endsWith('\\)')) return s.slice(2, -2).trim();
  if (s.startsWith('$') && s.endsWith('$') && s.length > 2) return s.slice(1, -1).trim();
  return s;
}

let katexModule = null;
async function getKatex() {
  if (!katexModule) katexModule = (await import('katex')).default || (await import('katex'));
  return katexModule;
}

function renderKaTeX(latex, displayMode = true) {
  if (!katexModule) return `<span style="color:var(--text-faint)">${latex}</span>`;
  try {
    return katexModule.renderToString(stripDelimiters(latex), { displayMode, throwOnError: false });
  } catch {
    return `<span style="color:#f87171">${latex}</span>`;
  }
}

export const BlockEquation = createReactBlockSpec(
  {
    type: 'blockEquation',
    propSchema: { latex: { default: '' } },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      const [editing, setEditing] = useState(!block.props.latex);
      const [value, setValue] = useState(block.props.latex || '');
      const [livePreview, setLivePreview] = useState(block.props.latex || '');
      const [renderedHtml, setRenderedHtml] = useState('');
      const inputRef = useRef(null);
      const debounceRef = useRef(null);

      useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

      useEffect(() => {
        getKatex().then(() => {
          if (livePreview.trim()) setRenderedHtml(renderKaTeX(livePreview));
        });
      }, [livePreview]);

      // Render saved equation
      useEffect(() => {
        if (!editing && block.props.latex) {
          getKatex().then(() => setRenderedHtml(renderKaTeX(block.props.latex)));
        }
      }, [editing, block.props.latex]);

      const handleCodeChange = useCallback((e) => {
        const v = e.target.value;
        setValue(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setLivePreview(v), 200);
      }, []);

      useEffect(() => () => clearTimeout(debounceRef.current), []);

      const save = () => {
        editor.updateBlock(block, { props: { latex: value } });
        setEditing(false);
      };

      if (editing) {
        return (
          <div className="lix-equation-block lix-equation-block--editing">
            <div className="lix-equation-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lix-accent, #9b7bf7)' }}>
                <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
              </svg>
              <span>LaTeX Equation</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--lix-text-faint, #666)' }}>Shift+Enter to save</span>
            </div>
            <textarea
              ref={inputRef}
              value={value}
              onChange={handleCodeChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); save(); }
                if (e.key === 'Escape') { setEditing(false); setValue(block.props.latex || ''); setLivePreview(block.props.latex || ''); }
              }}
              placeholder="E = mc^2"
              rows={4}
              className="lix-equation-textarea"
            />
            {livePreview.trim() && (
              <div className="lix-equation-preview">
                <div className="lix-equation-preview-label">Preview</div>
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>
            )}
            <div className="lix-equation-actions">
              <button onClick={() => { setEditing(false); setValue(block.props.latex || ''); setLivePreview(block.props.latex || ''); }} className="lix-btn-cancel">Cancel</button>
              <button onClick={save} className="lix-btn-save" disabled={!value.trim()}>Done</button>
            </div>
          </div>
        );
      }

      if (!block.props.latex) {
        return (
          <div onClick={() => setEditing(true)} className="lix-equation-block lix-equation-block--empty">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>
            <span>Click to add a block equation</span>
          </div>
        );
      }

      return (
        <div onClick={() => setEditing(true)} className="lix-equation-block lix-equation-block--rendered" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      );
    },
  }
);
