import { useState } from 'react';
import api from '../services/api';
import { toast } from '../services/toastService';

const defaultState = { key: '', label: '', type: 'text', required: false, isSearchable: false, description: '', options: '' };

export default function KeyBuilder({ onCreated }) {
  const [state, setState] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const handleChange = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setState((p) => ({ ...p, [k]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state.key || !state.label) return toast.error('Key and label are required');
    const payload = {
      key: String(state.key).trim().toLowerCase().replace(/\s+/g, '_'),
      label: state.label.trim(),
      type: state.type,
      required: !!state.required,
      isSearchable: !!state.isSearchable,
      options: state.options ? state.options.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      setLoading(true);
      const resp = await api.fieldDefs.create(payload);
      const created = resp?.data;
      if (created) {
        toast.success('Created', 'Field definition created');
        setState(defaultState);
        if (typeof onCreated === 'function') onCreated(created);
      }
    } catch (err) {
      console.error('Key create error', err);
      toast.error('Create failed', err.message || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-3 border rounded bg-white" onSubmit={handleSubmit}>
      <h3 className="font-semibold mb-2">Create Field</h3>
      <div className="grid grid-cols-2 gap-2">
        <input className="p-2 border rounded" placeholder="key" value={state.key} onChange={handleChange('key')} />
        <input className="p-2 border rounded" placeholder="label" value={state.label} onChange={handleChange('label')} />
        <select className="p-2 border rounded" value={state.type} onChange={handleChange('type')}>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="select">Select</option>
          <option value="textarea">Textarea</option>
          <option value="email">Email</option>
          <option value="tel">Phone</option>
          <option value="file">File</option>
        </select>
        <input className="p-2 border rounded" placeholder="description" value={state.description} onChange={handleChange('description')} />
        <input className="p-2 border rounded col-span-2" placeholder="options (comma separated, for select)" value={state.options} onChange={handleChange('options')} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={state.required} onChange={handleChange('required')} />
          <span className="text-sm">Required</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={state.isSearchable} onChange={handleChange('isSearchable')} />
          <span className="text-sm">Searchable</span>
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" className="px-3 py-1 bg-primary-900 text-white rounded" disabled={loading}>
          {loading ? 'Creating...' : 'Create Field'}
        </button>
        <button type="button" className="px-3 py-1 border rounded" onClick={() => setState(defaultState)} disabled={loading}>
          Reset
        </button>
      </div>
    </form>
  );
}
 

