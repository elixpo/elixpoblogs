'use client';

import { createReactInlineContentSpec } from '@blocknote/react';
import { useState, useRef, useEffect } from 'react';

function DateChip({ inlineContent, editor }) {
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef(null);
  const d = inlineContent.props.date;

  let formatted;
  try {
    formatted = new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    formatted = d;
  }

  useEffect(() => {
    if (showPicker && inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  }, [showPicker]);

  const handleChange = (e) => {
    const newDate = e.target.value;
    if (newDate) {
      try {
        editor.updateBlock(editor.getTextCursorPosition().block.id, {});
        // Update inline content props via the editor
        inlineContent.props.date = newDate;
      } catch {}
    }
    setShowPicker(false);
  };

  return (
    <span className="relative inline-flex items-center">
      <span
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPicker(!showPicker); }}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[13px] font-medium mx-0.5 cursor-pointer transition-all hover:ring-2 hover:ring-[#9b7bf7]/30"
        style={{ color: '#9b7bf7', backgroundColor: 'rgba(155,123,247,0.06)', border: '1px solid rgba(155,123,247,0.15)' }}
        title="Click to change date"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} /><line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} /><line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} /><line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} /></svg>
        {formatted}
      </span>
      {showPicker && (
        <input
          ref={inputRef}
          type="date"
          defaultValue={d}
          onChange={handleChange}
          onBlur={() => setShowPicker(false)}
          className="absolute top-full left-0 z-50 mt-1 opacity-0 w-0 h-0 overflow-hidden"
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </span>
  );
}

export const DateInline = createReactInlineContentSpec(
  {
    type: 'dateInline',
    propSchema: {
      date: { default: new Date().toISOString().split('T')[0] },
    },
    content: 'none',
  },
  {
    render: (props) => <DateChip {...props} />,
  }
);
