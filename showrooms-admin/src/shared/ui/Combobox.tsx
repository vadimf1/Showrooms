import { useEffect, useRef, useState } from 'react';

const ICheck = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IPlus  = () => <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;

export interface ComboboxOption { value: string; label: string }

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  onCreateNew?: (text: string) => void;
  createLabel?: (text: string) => string;
}

export default function Combobox({
  options, value, onChange,
  placeholder, disabled, loading,
  onCreateNew, createLabel,
}: ComboboxProps) {
  const [text, setText]   = useState('');
  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);

  const currentLabel = options.find(o => o.value === value)?.label ?? value;

  const filtered = text.trim()
    ? options.filter(o => o.label.toLowerCase().includes(text.toLowerCase()))
    : options;

  const exactMatch = options.some(o => o.label.toLowerCase() === text.trim().toLowerCase());
  const showCreate = onCreateNew && text.trim() && !exactMatch;

  const select = (v: string) => { onChange(v); setText(''); setOpen(false); };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setText('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="form-input"
        value={open ? text : currentLabel}
        placeholder={loading ? 'Loading…' : placeholder}
        disabled={disabled || loading}
        onFocus={() => { setText(''); setOpen(true); }}
        onChange={e => { setText(e.target.value); setOpen(true); }}
        autoComplete="off"
      />
      {open && (filtered.length > 0 || showCreate) && (
        <div className="combobox-dropdown">
          {filtered.slice(0, 100).map(o => (
            <button
              key={o.value}
              className={`combobox-option${o.value === value ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(o.value); }}
            >
              {o.value === value && <ICheck />}
              {o.label}
            </button>
          ))}
          {filtered.length === 0 && !showCreate && (
            <div className="combobox-empty">Ничего не найдено</div>
          )}
          {showCreate && (
            <button
              className="combobox-option combobox-create"
              onMouseDown={e => { e.preventDefault(); onCreateNew!(text.trim()); setText(''); setOpen(false); }}
            >
              <IPlus />
              {createLabel ? createLabel(text.trim()) : `Create "${text.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
