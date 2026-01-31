import { useState, useEffect } from 'react'
import api from '../services/api'
import { authService } from '../services/auth.service'

// Generate payout number
const generatePayoutNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
  return `PAY-${year}${month}${day}-${random}`
}

const PayoutForm = ({ payout, onSave, onClose }) => {
  const userRole = authService.getUser()?.role || 'super_admin'
  const currentUser = authService.getUser()
  const isAgent = userRole === 'agent'

  const [formData, setFormData] = useState({
    agentId: isAgent ? (currentUser?._id || currentUser?.id || '') : '',
    amount: '',
    status: 'pending',
    paymentDate: '',
  })

  const [errors, setErrors] = useState({})
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      // Agents don't need to fetch agents list since they can only create payouts for themselves
      if (isAgent) {
        setAgents([])
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const response = await api.agents.getAll()
        console.log('🔍 DEBUG: PayoutForm - Agents API response:', response)
        
        // Handle different response structures
        let agentsData = []
        if (Array.isArray(response)) {
          agentsData = response
        } else if (response && Array.isArray(response.data)) {
          agentsData = response.data
        } else if (response && response.data && Array.isArray(response.data)) {
          agentsData = response.data
        }
        
        console.log('🔍 DEBUG: PayoutForm - Parsed agents data:', agentsData.length)
        setAgents(agentsData)
      } catch (error) {
        console.error('Error fetching agents:', error)
        setAgents([])
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [isAgent])

  useEffect(() => {
    if (payout) {
      const agentId = payout.agentId || (payout.agent && (payout.agent._id || payout.agent.id)) || payout.agent || ''
      setFormData({
        agentId,
        amount: payout.totalAmount || payout.netPayable || payout.amount || '',
        status: payout.status || 'pending',
        paymentDate: payout.paymentDate || '',
      })
      // Set selected agent for franchise lookup
      if (agentId) {
        const agent = agents.find(a => (a.id || a._id) === agentId)
        setSelectedAgent(agent)
      }
    }
  }, [payout, agents])

  // Update selected agent when agentId changes
  useEffect(() => {
    if (isAgent && currentUser) {
      setSelectedAgent(currentUser)
    } else if (formData.agentId) {
      const agent = agents.find(a => (a.id || a._id) === formData.agentId)
      setSelectedAgent(agent)
    } else {
      setSelectedAgent(null)
    }
  }, [formData.agentId, agents, isAgent, currentUser])

  const validate = () => {
    const newErrors = {}
    if (!isAgent && !formData.agentId) newErrors.agentId = 'Agent is required'
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0'
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      return
    }
    
    // For agents, use current user as selected agent
    const agentToUse = isAgent ? currentUser : selectedAgent
    if (!agentToUse && !isAgent) {
      setErrors(prev => ({ ...prev, agentId: 'Please select a valid agent' }))
      return
    }

    // Get franchise from selected agent
    const franchiseId = agentToUse?.franchise?._id || agentToUse?.franchise?.id || agentToUse?.franchise || agentToUse?.franchiseId
    
    if (!franchiseId) {
      setErrors(prev => ({ ...prev, agentId: 'Selected agent must have a franchise assigned' }))
      return
    }

    const amount = parseFloat(formData.amount) || 0
    const agentId = isAgent ? (currentUser?._id || currentUser?.id) : formData.agentId
    
    // For manual payout, totalAmount = netPayable (no TDS deduction)
    const payoutData = {
      payoutNumber: payout?.payoutNumber || generatePayoutNumber(),
      agent: agentId,
      franchise: franchiseId,
      totalAmount: amount,
      netPayable: amount,
      tdsAmount: 0,
      status: formData.status,
      paymentDate: formData.paymentDate,
    }

    console.log('🔍 DEBUG: Payout data being sent:', JSON.stringify(payoutData, null, 2))
    onSave(payoutData)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAgent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent <span className="text-red-500">*</span>
          </label>
          <select
            name="agentId"
            value={formData.agentId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.agentId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select an agent</option>
            {loading ? (
              <option disabled>Loading agents...</option>
            ) : agents.length === 0 ? (
              <option disabled>No agents available</option>
            ) : (
              agents.map((agent) => (
                <option key={agent.id || agent._id} value={agent.id || agent._id}>
                  {agent.name || 'N/A'} - {agent.email || 'N/A'}
                </option>
              ))
            )}
          </select>
          {errors.agentId && <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>}
          {!loading && agents.length === 0 && (
            <p className="mt-1 text-sm text-amber-600">
              ⚠️ No agents available. Please create agents first.
            </p>
          )}
          {selectedAgent && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Franchise:</strong> {selectedAgent.franchise?.name || 'N/A'}
              </p>
            </div>
          )}
        </div>
      )}
      {isAgent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent
          </label>
          <input
            type="text"
            value={currentUser?.name || 'You'}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          {currentUser?.franchise?.name && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Franchise:</strong> {currentUser.franchise.name}
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter payout amount"
          min="0"
          step="100"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="paymentDate"
          value={formData.paymentDate}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.paymentDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
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
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="recovery">Recovery</option>
        </select>
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
          {payout ? 'Update Payout' : 'Create Payout'}
        </button>
      </div>
    </form>
  )
}

export default PayoutForm
