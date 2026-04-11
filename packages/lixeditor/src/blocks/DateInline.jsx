'use client';

import { createReactInlineContentSpec } from '@blocknote/react';
import { useState, useRef, useEffect, useCallback } from 'react';

function MiniCalendar({ selectedDate, onSelect, onClose, anchorEl }) {
  const ref = useRef(null);
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate) : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [pos, setPos] = useState(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  useEffect(() => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: Math.max(8, Math.min(rect.left, window.innerWidth - 248)) });
  }, [anchorEl]);

  const { year, month } = viewDate;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  const toDateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const prev = () => setViewDate(v => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const next = () => setViewDate(v => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  if (!pos) return null;

  return (
    <div ref={ref} className="lix-calendar" style={{ top: pos.top, left: pos.left }} onMouseDown={e => e.stopPropagation()}>
      <div className="lix-calendar-header">
        <button onClick={prev} className="lix-calendar-nav">&lsaquo;</button>
        <span className="lix-calendar-month">{monthName}</span>
        <button onClick={next} className="lix-calendar-nav">&rsaquo;</button>
      </div>
      <div className="lix-calendar-weekdays">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="lix-calendar-grid">
        {days.map((d, i) => d ? (
          <button key={i} onClick={() => { onSelect(toDateStr(d)); onClose(); }}
            className={`lix-calendar-day${toDateStr(d) === selectedDate ? ' lix-calendar-day--selected' : ''}${toDateStr(d) === today ? ' lix-calendar-day--today' : ''}`}>
            {d}
          </button>
        ) : <span key={i} />)}
      </div>
      <div className="lix-calendar-footer">
        <button onClick={() => { onSelect(''); onClose(); }} className="lix-calendar-footer-btn">Clear</button>
        <button onClick={() => { onSelect(today); onClose(); }} className="lix-calendar-footer-btn lix-calendar-footer-btn--accent">Today</button>
      </div>
    </div>
  );
}

function DateChip({ inlineContent }) {
  const [showPicker, setShowPicker] = useState(false);
  const chipRef = useRef(null);
  const d = inlineContent.props.date;
  let formatted;
  try { formatted = new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { formatted = d; }

  const handleSelect = useCallback((newDate) => {
    if (newDate) inlineContent.props.date = newDate;
    setShowPicker(false);
  }, [inlineContent]);

  return (
    <span className="relative inline-flex items-center">
      <span ref={chipRef} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPicker(!showPicker); }} className="lix-date-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {formatted}
      </span>
      {showPicker && <MiniCalendar selectedDate={d} onSelect={handleSelect} onClose={() => setShowPicker(false)} anchorEl={chipRef.current} />}
    </span>
  );
}

export const DateInline = createReactInlineContentSpec(
  { type: 'dateInline', propSchema: { date: { default: new Date().toISOString().split('T')[0] } }, content: 'none' },
  { render: (props) => <DateChip {...props} /> }
);
