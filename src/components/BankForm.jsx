import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

const BankForm = ({ bank, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    contactPerson: '',
    contactEmail: '',
    contactMobile: '',
    ifscCode: '',
    micrCode: '',
    branchName: '',
    branchAddress: '',
    city: '',
    state: '',
    pinCode: '',
    accountNumber: '',
    registrationNumber: '',
    status: 'active',
    customFields: {},
  })

  const [errors, setErrors] = useState({})
  const [customFields, setCustomFields] = useState([])

  useEffect(() => {
    if (bank) {
      const customFieldsObj = bank.customFields || {}
      const customFieldsArray = Object.entries(customFieldsObj).map(([key, value]) => ({
        key,
        value: String(value),
      }))
      
      console.log('🔍 Loading bank data:', { bank, customFieldsObj, customFieldsArray })
      
      setFormData({
        name: bank.name || '',
        type: bank.type || 'bank',
        contactPerson: bank.contactPerson || '',
        contactEmail: bank.contactEmail || bank.email || '',
        contactMobile: bank.contactMobile || bank.phone || '',
        ifscCode: bank.ifscCode || '',
        micrCode: bank.micrCode || '',
        branchName: bank.branchName || '',
        branchAddress: bank.branchAddress || '',
        city: bank.city || '',
        state: bank.state || '',
        pinCode: bank.pinCode || '',
        accountNumber: bank.accountNumber || '',
        registrationNumber: bank.registrationNumber || '',
        status: bank.status || 'active',
        customFields: customFieldsObj,
      })
      setCustomFields(customFieldsArray)
    } else {
      // Reset when creating new bank
      setCustomFields([])
      setFormData({
        name: '',
        type: 'bank',
        contactPerson: '',
        contactEmail: '',
        contactMobile: '',
        ifscCode: '',
        micrCode: '',
        branchName: '',
        branchAddress: '',
        city: '',
        state: '',
        pinCode: '',
        accountNumber: '',
        registrationNumber: '',
        status: 'active',
        customFields: {},
      })
    }
  }, [bank])

  const validate = () => {
    const newErrors = {}
    if (!formData.name || !formData.name.trim()) newErrors.name = 'Bank name is required'
    if (!formData.contactPerson || !formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required'
    if (!formData.contactEmail || !formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email is invalid'
    }
    if (!formData.contactMobile || !formData.contactMobile.trim()) newErrors.contactMobile = 'Contact mobile is required'
    
    // IFSC Code validation
    if (formData.ifscCode && formData.ifscCode.trim()) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
      if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
        newErrors.ifscCode = 'IFSC code must be 11 characters (e.g., HDFC0001234)'
      }
    }
    
    // MICR Code validation
    if (formData.micrCode && formData.micrCode.trim()) {
      const micrRegex = /^\d{9}$/
      if (!micrRegex.test(formData.micrCode)) {
        newErrors.micrCode = 'MICR code must be 9 digits'
      }
    }
    
    // PIN Code validation
    if (formData.pinCode && formData.pinCode.trim()) {
      const pinRegex = /^\d{6}$/
      if (!pinRegex.test(formData.pinCode)) {
        newErrors.pinCode = 'PIN code must be 6 digits'
      }
    }

    // #region agent log
    console.log('🔍 DEBUG: Form validation:', {
      formData,
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0
    });
    fetch('http://127.0.0.1:7242/ingest/f11153c6-25cf-4c9c-a0b4-730f202e186d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BankForm.jsx:28',message:'Form validation result',data:{formData,errors:newErrors,isValid:Object.keys(newErrors).length === 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Convert custom fields array to object
      const customFieldsObj = {}
      customFields.forEach((field) => {
        if (field.key && field.key.trim()) {
          customFieldsObj[field.key.trim()] = field.value || ''
        }
      })
      
      const submitData = {
        ...formData,
        ifscCode: formData.ifscCode ? formData.ifscCode.toUpperCase().trim() : '',
        customFields: customFieldsObj,
      }
      
      // #region agent log
      console.log('🔍 DEBUG: Form validated, submitting data:', JSON.stringify(submitData, null, 2));
      fetch('http://127.0.0.1:7242/ingest/f11153c6-25cf-4c9c-a0b4-730f202e186d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BankForm.jsx:44',message:'Form data before save',data:submitData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      onSave(submitData)
    } else {
      console.log('❌ DEBUG: Form validation failed:', errors);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }])
  }

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields]
    updated[index] = { ...updated[index], [field]: value }
    setCustomFields(updated)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter bank name"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Person <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="contactPerson"
          value={formData.contactPerson}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.contactPerson ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter contact person name"
        />
        {errors.contactPerson && <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.contactEmail ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter contact email address"
        />
        {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact Mobile <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="contactMobile"
          value={formData.contactMobile}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.contactMobile ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter contact mobile number"
        />
        {errors.contactMobile && <p className="mt-1 text-sm text-red-600">{errors.contactMobile}</p>}
      </div>

      {/* Indian Bank Details Section */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Bank Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                handleChange({ target: { name: 'ifscCode', value } })
              }}
              maxLength={11}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.ifscCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="HDFC0001234"
            />
            {errors.ifscCode && <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MICR Code
            </label>
            <input
              type="text"
              name="micrCode"
              value={formData.micrCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                handleChange({ target: { name: 'micrCode', value } })
              }}
              maxLength={9}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.micrCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123456789"
            />
            {errors.micrCode && <p className="mt-1 text-sm text-red-600">{errors.micrCode}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter branch name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch Address
            </label>
            <textarea
              name="branchAddress"
              value={formData.branchAddress}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter branch address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter state"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Code
            </label>
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                handleChange({ target: { name: 'pinCode', value } })
              }}
              maxLength={6}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.pinCode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123456"
            />
            {errors.pinCode && <p className="mt-1 text-sm text-red-600">{errors.pinCode}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter account number"
            />
          </div>

          {formData.type === 'nbfc' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Number
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter NBFC registration number"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Custom Fields Section */}
      <div className="pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-900">
            Custom Fields
          </label>
          <button
            type="button"
            onClick={handleAddCustomField}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-900 hover:bg-primary-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>
        
        {customFields.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">No custom fields added yet.</p>
            <p className="text-xs text-gray-500 mt-1">Click "Add Field" above to add custom fields for this bank.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Field name (e.g., Branch Code)"
                  value={field.key}
                  onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Field value"
                  value={field.value}
                  onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCustomField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove field"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          className="px-4 py-2 text-sm font-medium text-white bg-primary-900 rounded-lg hover:bg-primary-800 transition-colors"
        >
          {bank ? 'Update Bank' : 'Create Bank'}
        </button>
      </div>
    </form>
  )
}

export default BankForm
