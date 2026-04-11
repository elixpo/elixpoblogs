'use client';

import { createReactInlineContentSpec } from '@blocknote/react';
import { useState, useRef, useEffect, useCallback } from 'react';

let katexModule = null;
async function getKatex() {
  if (!katexModule) katexModule = (await import('katex')).default || (await import('katex'));
  return katexModule;
}

function stripDelimiters(raw) {
  let s = raw.trim();
  if (s.startsWith('\\[') && s.endsWith('\\]')) return s.slice(2, -2).trim();
  if (s.startsWith('$$') && s.endsWith('$$')) return s.slice(2, -2).trim();
  if (s.startsWith('\\(') && s.endsWith('\\)')) return s.slice(2, -2).trim();
  if (s.startsWith('$') && s.endsWith('$') && s.length > 2) return s.slice(1, -1).trim();
  return s;
}

function InlineEquationChip({ inlineContent }) {
  const [html, setHtml] = useState('');
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(inlineContent.props.latex || '');
  const inputRef = useRef(null);

  useEffect(() => {
    getKatex().then(katex => {
      try {
        setHtml(katex.renderToString(stripDelimiters(inlineContent.props.latex), { displayMode: false, throwOnError: false }));
      } catch { setHtml(inlineContent.props.latex); }
    });
  }, [inlineContent.props.latex]);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const save = useCallback(() => {
    if (value.trim()) inlineContent.props.latex = value.trim();
    setEditing(false);
  }, [value, inlineContent]);

  if (editing) {
    return (
      <span className="lix-inline-equation-editor" style={{ position: 'relative', display: 'inline-block' }}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') setEditing(false);
          }}
          onBlur={save}
          placeholder="LaTeX..."
          className="lix-inline-equation-input"
        />
      </span>
    );
  }

  return (
    <span
      className="lix-inline-equation-chip"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const InlineEquation = createReactInlineContentSpec(
  {
    type: 'inlineEquation',
    propSchema: { latex: { default: 'x^2' } },
    content: 'none',
  },
  { render: (props) => <InlineEquationChip {...props} /> }
);
