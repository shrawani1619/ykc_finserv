import { useState, useEffect } from 'react'
import { authService } from '../services/auth.service'
import { api } from '../services/api'

const RelationshipManagerForm = ({ relationshipManager, onSave, onClose, isSaving = false }) => {
  const isCreate = !relationshipManager
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (relationshipManager) {
      setFormData({
        name: relationshipManager.name || '',
        email: relationshipManager.email || '',
        mobile: relationshipManager.mobile || '',
        password: '',
      })
    }
  }, [relationshipManager])

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (isCreate) {
      if (!formData.email?.trim()) newErrors.email = 'Email is required for login'
      if (!formData.mobile?.trim()) newErrors.mobile = 'Mobile is required'
      if (!formData.password) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const payload = { ...formData }
      if (!isCreate) {
        delete payload.password
      }
      onSave(payload, {})
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email {isCreate && <span className="text-red-500">*</span>}
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Email address"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile {isCreate && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Mobile number"
        />
        {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
      </div>

      {isCreate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Min 6 characters"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-4 py-2 text-sm font-medium text-white bg-primary-900 rounded-lg transition-colors ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-800'}`}
        >
          {isSaving ? (relationshipManager ? 'Updating...' : 'Creating...') : (relationshipManager ? 'Update Relationship Manager' : 'Create Relationship Manager')}
        </button>
      </div>
    </form>
  )
}

export default RelationshipManagerForm
