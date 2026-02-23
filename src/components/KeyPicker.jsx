import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const KeyPicker = ({ value, onChange, onSelect, placeholder = 'key', required = false }) => {
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('touchstart', onDocClick);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('touchstart', onDocClick);
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await api.fieldDefs.list();
        const list = resp?.data || [];
        setOptions(list);
      } catch (err) {
        console.error('Failed to load field defs', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreate = async (k) => {
    try {
      setLoading(true);
      const payload = { key: k, label: k, type: 'text', required: required, isSearchable: false };
      const resp = await api.fieldDefs.create(payload);
      const created = resp?.data;
      if (created) {
        setOptions((p) => {
          const next = [...p.filter(x => x.key !== created.key), created];
          return next.sort((a, b) => a.key.localeCompare(b.key));
        });
        if (typeof onSelect === 'function') {
          try { onSelect(created) } catch (e) { console.error('onSelect handler error', e) }
        }
        onChange(created.key);
        setQuery(created.key);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to create field def', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = (k) => {
    const selected = options.find(o => o.key === k);
    if (onSelect && selected) {
      try { onSelect(selected) } catch (e) { console.error('onSelect handler error', e) }
    }
    onChange(k);
    setQuery(k);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="p-2 border rounded w-full"
      />
      {isOpen && (
        <div className="absolute left-0 right-0 bg-white border mt-1 max-h-48 overflow-auto z-50">
          {loading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
          {!loading && (() => {
            const filtered = options.filter(o => o.key.toLowerCase().includes(query.toLowerCase()));
            return (
              <>
                {filtered.map((o) => (
                  <div key={o.key} onMouseDown={() => handleSelect(o.key)} className="p-2 hover:bg-gray-100 cursor-pointer">
                    <div className="font-medium">{o.label} <span className="text-xs text-gray-400">({o.key})</span></div>
                    <div className="text-xs text-gray-500">{o.type}{o.required ? ' · required' : ''}{o.isSearchable ? ' · searchable' : ''}</div>
                  </div>
                ))}
                {!loading && !options.some(o => o.key.toLowerCase() === query.toLowerCase()) && query.trim() !== '' && (
                  <div className="p-2 border-t">
                    <button type="button" onMouseDown={() => handleCreate(query.trim())} className="px-3 py-1 bg-primary-900 text-white rounded">
                      Create new key "{query.trim()}"
                    </button>
                  </div>
                )}
                {filtered.length === 0 && query.trim() === '' && !loading && <div className="p-2 text-sm text-gray-500">No suggestions</div>}
              </>
            )
          })()}
        </div>
      )}

    </div>
  )
}

export default KeyPicker;

