'use client';

import { createReactBlockSpec } from '@blocknote/react';
import { useState, useRef, useEffect } from 'react';

export const TabsBlock = createReactBlockSpec(
  {
    type: 'tabsBlock',
    propSchema: {
      tabs: { default: '[]' },
    },
    content: 'none',
  },
  {
    render: ({ block, editor }) => {
      let tabs = [];
      try { tabs = JSON.parse(block.props.tabs); } catch {}

      const [editing, setEditing] = useState(tabs.length === 0);
      const [expandedTab, setExpandedTab] = useState(null);
      const [text, setText] = useState(tabs.map((t) => `${t.title}\n${t.content}`).join('\n---\n'));
      const textareaRef = useRef(null);

      useEffect(() => {
        if (editing && textareaRef.current) textareaRef.current.focus();
      }, [editing]);

      const save = () => {
        const parsed = text.split('\n---\n').filter(Boolean).map((section) => {
          const lines = section.split('\n');
          const title = lines[0]?.trim() || 'Tab';
          const content = lines.slice(1).join('\n').trim();
          return { title, content };
        });
        if (parsed.length === 0) parsed.push({ title: 'Untitled Page', content: '' });
        editor.updateBlock(block, { props: { tabs: JSON.stringify(parsed) } });
        setEditing(false);
      };

      // Editing mode — textarea input
      if (editing) {
        return (
          <div className="border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)] p-4 my-2">
            <div className="flex items-center gap-2 mb-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9b7bf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Sub-Pages</span>
            </div>
            <p className="text-[10px] mb-2" style={{ color: 'var(--text-faint)' }}>Separate pages with <code className="px-1 py-0.5 rounded text-[9px]" style={{ backgroundColor: 'var(--bg-elevated)' }}>---</code> on its own line. First line of each section is the page title.</p>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Getting Started\nContent for the first page...\n---\nAdvanced Guide\nContent for the second page..."}
              rows={8}
              className="w-full rounded-lg p-3 text-[13px] font-mono resize-none outline-none transition-colors"
              style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
            <div className="flex justify-end gap-2 mt-2">
              {tabs.length > 0 && (
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-[12px] rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              )}
              <button onClick={save} className="px-4 py-1.5 text-[12px] bg-[#9b7bf7] text-white rounded-lg font-medium hover:bg-[#8b6ae6] transition-colors">Save Pages</button>
            </div>
          </div>
        );
      }

      // Display mode — list of sub-page cards
      return (
        <div className="my-2 space-y-0" contentEditable={false}>
          {tabs.map((tab, i) => (
            <div key={i}>
              {/* Sub-page reference card */}
              <button
                onClick={() => setExpandedTab(expandedTab === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 transition-all text-left group"
                style={{
                  backgroundColor: expandedTab === i ? 'var(--bg-surface)' : 'transparent',
                  borderLeft: expandedTab === i ? '3px solid #9b7bf7' : '3px solid transparent',
                  borderBottom: '1px solid var(--divider)',
                }}
                onMouseEnter={e => { if (expandedTab !== i) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (expandedTab !== i) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {/* Page icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{ backgroundColor: expandedTab === i ? 'rgba(155,123,247,0.12)' : 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={expandedTab === i ? '#9b7bf7' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-faint)' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>

                {/* Title */}
                <span className="flex-1 text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {tab.title}
                </span>

                {/* Arrow */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--text-faint)', transform: expandedTab === i ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              {/* Expanded content */}
              {expandedTab === i && (
                <div
                  className="px-5 py-4 text-[14px] leading-relaxed whitespace-pre-wrap"
                  style={{
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-surface)',
                    borderLeft: '3px solid #9b7bf7',
                    borderBottom: '1px solid var(--divider)',
                  }}
                >
                  {tab.content || <span style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>Empty page</span>}
                </div>
              )}
            </div>
          ))}

          {/* Edit button */}
          <button
            onClick={() => { setText(tabs.map(t => `${t.title}\n${t.content}`).join('\n---\n')); setEditing(true); }}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ color: 'var(--text-faint)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit pages
          </button>
        </div>
      );
    },
  }
);
