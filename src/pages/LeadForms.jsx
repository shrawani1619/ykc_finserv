import { useEffect, useState } from 'react'
import KeyPicker from '../components/KeyPicker'
import KeyBuilder from '../components/KeyBuilder'
import LeadFormBuilder from '../components/LeadFormBuilder'
import api from '../services/api'
import { toast } from '../services/toastService'
import { authService } from '../services/auth.service'

const ALLOWED_ROLES = ['super_admin', 'regional_manager']

const defaultField = () => ({ key: '', label: '', type: 'text', required: false, isSearchable: false, options: '', order: 0 })
const defaultDoc = () => ({ key: '', name: '', required: false, order: 0 })

export default function LeadForms() {
  const userRole = authService.getUser()?.role
  if (!ALLOWED_ROLES.includes(userRole)) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-gray-600">You do not have permission to access the Lead Form builder.</p>
      </div>
    )
  }
  const [banks, setBanks] = useState([])
  const [selectedBank, setSelectedBank] = useState('')
  const [form, setForm] = useState({ name: '', fields: [], documentTypes: [], active: true })
  const [newField, setNewField] = useState(defaultField())
  const [newDoc, setNewDoc] = useState(defaultDoc())
  const [loading, setLoading] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [editField, setEditField] = useState(null)
  const [keyErrors, setKeyErrors] = useState({})
  const [availableKeys, setAvailableKeys] = useState([])
  const [keyBuilder, setKeyBuilder] = useState({ key: '', label: '', type: 'text', required: false, isSearchable: false, description: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await api.banks.getAll()
        setBanks(resp?.data || [])
      } catch (err) {
        console.error('Failed to load banks', err)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadForm = async () => {
      if (!selectedBank) {
        setForm({ name: '', fields: [], documentTypes: [], active: true })
        return
      }
      try {
        setLoading(true)
        const resp = await api.leadForms.getByBank(selectedBank)
        const data = resp?.data || null
        if (data) {
          // normalize options to comma string for editing
          const fields = (data.fields || []).map((f) => ({ ...f, options: (f.options || []).join(',') }))
          setForm({ ...data, fields, documentTypes: data.documentTypes || [], active: data.active })
          // Initialize available keys from existing form fields (if no global key store)
          const keysFromForm = (data.fields || []).map((f) => ({
            key: f.key,
            label: f.label || f.key,
            type: f.type || 'text',
            required: !!f.required,
            isSearchable: !!f.isSearchable,
            description: f.description || '',
          }))
          setAvailableKeys(keysFromForm)
        } else {
          setForm({ name: '', fields: [], documentTypes: [], active: true })
        }
      } catch (err) {
        console.error('Error loading lead form', err)
        toast.error('Error', 'Could not load lead form')
      } finally {
        setLoading(false)
      }
    }
    loadForm()
  }, [selectedBank])

  // Field selection handlers - fields must come from availableKeys (created in Key Builder)
  const handleToggleFieldSelection = (key) => {
    const exists = (form.fields || []).some((f) => f.key === key)
    if (exists) {
      // remove
      setForm((p) => ({ ...p, fields: p.fields.filter((f) => f.key !== key) }))
    } else {
      // add with metadata from availableKeys
      const k = (availableKeys || []).find((a) => a.key === key)
      const toAdd = {
        key: k?.key || key,
        label: k?.label || key,
        type: k?.type || 'text',
        required: !!k?.required,
        isSearchable: !!k?.isSearchable,
        description: k?.description || '',
        options: k?.options || '',
        order: ((form.fields || []).length || 0) + 1,
      }
      setForm((p) => ({ ...p, fields: [...(p.fields || []), toAdd] }))
    }
  }

  const handleSetFieldOrder = (key, order) => {
    const num = parseInt(order, 10) || 0
    setForm((p) => ({ ...p, fields: p.fields.map((f) => (f.key === key ? { ...f, order: num } : f)) }))
  }

  const handleEditField = (f) => {
    setEditingKey(f.key)
    // clone so edits don't mutate live list until saved
    setEditField({ ...f })
  }

  const handleSaveFieldEdit = () => {
    if (!editField?.key || !editField?.label) return toast.error('Key and label required for field')
    // sanitize key
    const sanitized = String(editField.key).trim().toLowerCase().replace(/\s+/g, '_')
    if (!/^[a-z0-9_]+$/.test(sanitized)) {
      return toast.error('Key must be lowercase and contain only letters, numbers or underscores')
    }
    // ensure unique (allow same as editingKey)
    const existing = (form.fields || []).map((f) => f.key).filter((k) => k !== editingKey)
    if (existing.includes(sanitized)) return toast.error('Another field with this key already exists')
    setForm((p) => ({ ...p, fields: p.fields.map((fld) => (fld.key === editingKey ? { ...editField, key: sanitized } : fld)) }))
    setEditingKey(null)
    setEditField(null)
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setEditField(null)
  }

  const handleRemoveField = (key) => {
    setForm((p) => ({ ...p, fields: p.fields.filter((f) => f.key !== key) }))
  }

  const handleAddDoc = () => {
    if (!newDoc.key || !newDoc.name) return toast.error('Key and name required for document')
    setForm((p) => ({ ...p, documentTypes: [...p.documentTypes, newDoc] }))
    setNewDoc(defaultDoc())
  }

  const handleRemoveDoc = (key) => {
    setForm((p) => ({ ...p, documentTypes: p.documentTypes.filter((d) => d.key !== key) }))
  }

  const handleSave = async () => {
    if (!selectedBank) return toast.error('Select a bank first')
    try {
      setLoading(true)
      // convert options from comma string to array
      const payload = {
        bank: selectedBank,
        name: form.name || 'Lead Form',
        fields: (form.fields || []).map((f) => ({ ...f, options: f.options ? f.options.split(',').map((s) => s.trim()).filter(Boolean) : [] })),
        documentTypes: form.documentTypes || [],
        active: form.active,
      }
      const resp = await api.leadForms.create(payload)
      toast.success('Saved', 'Lead form saved successfully')
      setForm((p) => ({ ...p, _id: resp?.data?._id || p._id }))
    } catch (err) {
      console.error('Error saving lead form', err)
      try {
        // Try update if create failed due to existing form (fallback)
        if (form._id) {
          await api.leadForms.update(form._id, { ...form })
          toast.success('Updated', 'Lead form updated')
        } else {
          toast.error('Save failed', err.message || '')
        }
      } catch (uerr) {
        console.error('Update fallback failed', uerr)
        toast.error('Save failed', uerr.message || '')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Lead Form Builder</h2>
      <LeadFormBuilder onSaved={() => toast.success('Lead form created/updated')} />
    </div>
  )
}

