import { useState, useEffect } from 'react'
import api from '../services/api'
import { authService } from '../services/auth.service'

const LeadForm = ({ lead, onSave, onClose }) => {
  const userRole = authService.getUser()?.role || 'super_admin'
  const currentUser = authService.getUser()
  const isAgent = userRole === 'agent'

  const [formData, setFormData] = useState({
    caseNumber: '',
    leadType: 'fresh',
    applicantEmail: '',
    applicantMobile: '',
    loanType: '',
    loanAmount: '',
    status: 'logged',
    agentId: isAgent ? (currentUser?._id || currentUser?.id || '') : '',
    franchiseId: isAgent ? (currentUser?.franchise?._id || currentUser?.franchise?.id || currentUser?.franchise || '') : '',
    bankId: '',
    customerName: '',
    sanctionedAmount: '',
    sanctionedDate: '',
    disbursedAmount: '',
    disbursementDate: '',
    disbursementType: '',
    loanAccountNo: '',
    commissionBasis: '',
    commissionPercentage: '',
    verificationStatus: 'pending',
    smBmId: '',
    smBmEmail: '',
    smBmMobile: '',
    asmName: '',
    asmEmail: '',
    asmMobile: '',
    codeUse: '',
    branch: '',
    remarks: '',
  })

  const [errors, setErrors] = useState({})
  const [banks, setBanks] = useState([])
  const [agents, setAgents] = useState([])
  const [franchises, setFranchises] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const fetchPromises = [
          api.banks.getAll(),
          !isAgent ? api.agents.getAll() : Promise.resolve({ data: [] }),
          !isAgent ? api.franchises.getAll() : Promise.resolve({ data: [] }),
          api.staff.getAll(),
        ]
        
        const [banksResponse, agentsResponse, franchisesResponse, staffResponse] = await Promise.all(fetchPromises)
        setBanks(Array.isArray(banksResponse.data) ? banksResponse.data : Array.isArray(banksResponse) ? banksResponse : [])
        setAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : Array.isArray(agentsResponse) ? agentsResponse : [])
        setFranchises(Array.isArray(franchisesResponse.data) ? franchisesResponse.data : Array.isArray(franchisesResponse) ? franchisesResponse : [])
        setStaff(Array.isArray(staffResponse.data) ? staffResponse.data : Array.isArray(staffResponse) ? staffResponse : [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setBanks([])
        setAgents([])
        setFranchises([])
        setStaff([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAgent])

  useEffect(() => {
    if (lead) {
      setFormData({
        caseNumber: lead.caseNumber || '',
        leadType: lead.leadType || 'fresh',
        applicantEmail: lead.applicantEmail || lead.email || '',
        applicantMobile: lead.applicantMobile || lead.phone || '',
        loanType: lead.loanType || '',
        loanAmount: lead.loanAmount || '',
        status: lead.status || 'logged',
        agentId: lead.agentId || (lead.agent && (lead.agent._id || lead.agent.id)) || lead.agent || '',
        franchiseId: lead.franchiseId || (lead.franchise && (lead.franchise._id || lead.franchise.id)) || lead.franchise || '',
        bankId: lead.bankId || (lead.bank && (lead.bank._id || lead.bank.id)) || lead.bank || '',
        customerName: lead.customerName || '',
        sanctionedAmount: lead.sanctionedAmount || '',
        sanctionedDate: lead.sanctionedDate ? new Date(lead.sanctionedDate).toISOString().split('T')[0] : '',
        disbursedAmount: lead.disbursedAmount || '',
        disbursementDate: lead.disbursementDate ? new Date(lead.disbursementDate).toISOString().split('T')[0] : '',
        disbursementType: lead.disbursementType || '',
        loanAccountNo: lead.loanAccountNo || '',
        commissionBasis: lead.commissionBasis || '',
        commissionPercentage: lead.commissionPercentage || '',
        verificationStatus: lead.verificationStatus || 'pending',
        smBmId: lead.smBmId || (lead.smBm && (lead.smBm._id || lead.smBm.id)) || lead.smBm || '',
        smBmEmail: lead.smBmEmail || lead.smBm?.email || '',
        smBmMobile: lead.smBmMobile || lead.smBm?.mobile || '',
        asmName: lead.asmName || '',
        asmEmail: lead.asmEmail || '',
        asmMobile: lead.asmMobile || '',
        codeUse: lead.codeUse || '',
        branch: lead.branch || '',
        remarks: lead.remarks || '',
      })
    }
  }, [lead])

  const validate = () => {
    const newErrors = {}
    if (!formData.applicantMobile.trim()) newErrors.applicantMobile = 'Mobile number is required'
    if (formData.applicantEmail && !/\S+@\S+\.\S+/.test(formData.applicantEmail)) newErrors.applicantEmail = 'Email is invalid'
    if (!formData.loanType) newErrors.loanType = 'Loan type is required'
    if (!formData.loanAmount || formData.loanAmount <= 0) newErrors.loanAmount = 'Loan amount must be greater than 0'
    if (!isAgent && !formData.agentId) newErrors.agentId = 'Agent is required'
    if (!isAgent && !formData.franchiseId) newErrors.franchiseId = 'Franchise is required'
    if (!formData.bankId) newErrors.bankId = 'Bank is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const numericFields = ['loanAmount', 'sanctionedAmount', 'disbursedAmount', 'commissionPercentage']
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? '' : parseFloat(value) || '') : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    
    // Auto-populate smBm email and mobile when smBm is selected
    if (name === 'smBmId' && value) {
      const selectedStaff = staff.find((s) => (s.id || s._id) === value)
      if (selectedStaff) {
        setFormData((prev) => ({
          ...prev,
          smBmId: value,
          smBmEmail: selectedStaff.email || prev.smBmEmail,
          smBmMobile: selectedStaff.mobile || prev.smBmMobile,
        }))
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Case Number
        </label>
        <input
          type="text"
          name="caseNumber"
          value={formData.caseNumber}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter case number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Type <span className="text-red-500">*</span>
        </label>
        <select
          name="leadType"
          value={formData.leadType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="fresh">Fresh</option>
          <option value="disbursed">Disbursed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="applicantMobile"
          value={formData.applicantMobile}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.applicantMobile ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter mobile number"
        />
        {errors.applicantMobile && <p className="mt-1 text-sm text-red-600">{errors.applicantMobile}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="applicantEmail"
          value={formData.applicantEmail}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.applicantEmail ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address (optional)"
        />
        {errors.applicantEmail && <p className="mt-1 text-sm text-red-600">{errors.applicantEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loan Type <span className="text-red-500">*</span>
        </label>
        <select
          name="loanType"
          value={formData.loanType}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.loanType ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select loan type</option>
          <option value="personal_loan">Personal Loan</option>
          <option value="home_loan">Home Loan</option>
          <option value="business_loan">Business Loan</option>
          <option value="loan_against_property">Loan Against Property</option>
          <option value="education_loan">Education Loan</option>
          <option value="car_loan">Car Loan</option>
          <option value="gold_loan">Gold Loan</option>
        </select>
        {errors.loanType && <p className="mt-1 text-sm text-red-600">{errors.loanType}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loan Amount (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="loanAmount"
          value={formData.loanAmount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.loanAmount ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter loan amount"
          min="0"
          step="1000"
        />
        {errors.loanAmount && <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>}
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
          <option value="logged">Logged</option>
          <option value="sanctioned">Sanctioned</option>
          <option value="partial_disbursed">Partial Disbursed</option>
          <option value="disbursed">Disbursed</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Status
        </label>
        <select
          name="verificationStatus"
          value={formData.verificationStatus}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {!isAgent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise <span className="text-red-500">*</span>
          </label>
          <select
            name="franchiseId"
            value={formData.franchiseId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.franchiseId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a franchise</option>
            {loading ? (
              <option disabled>Loading franchises...</option>
            ) : (
              franchises.map((franchise) => (
                <option key={franchise.id || franchise._id} value={franchise.id || franchise._id}>
                  {franchise.name || 'N/A'}
                </option>
              ))
            )}
          </select>
          {errors.franchiseId && <p className="mt-1 text-sm text-red-600">{errors.franchiseId}</p>}
        </div>
      )}
      {isAgent && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Franchise
          </label>
          <input
            type="text"
            value={currentUser?.franchise?.name || 'N/A'}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
        </div>
      )}

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
            ) : (
              agents.map((agent) => (
                <option key={agent.id || agent._id} value={agent.id || agent._id}>
                  {agent.name || 'N/A'}
                </option>
              ))
            )}
          </select>
          {errors.agentId && <p className="mt-1 text-sm text-red-600">{errors.agentId}</p>}
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
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank <span className="text-red-500">*</span>
        </label>
        <select
          name="bankId"
          value={formData.bankId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.bankId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select a bank</option>
          {loading ? (
            <option disabled>Loading banks...</option>
          ) : (
            banks.map((bank) => (
              <option key={bank.id || bank._id} value={bank.id || bank._id}>
                {bank.name || 'N/A'}
              </option>
            ))
          )}
        </select>
        {errors.bankId && <p className="mt-1 text-sm text-red-600">{errors.bankId}</p>}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sanction & Disbursement Details</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sanctioned Amount (₹)
        </label>
        <input
          type="number"
          name="sanctionedAmount"
          value={formData.sanctionedAmount}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter sanctioned amount"
          min="0"
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sanctioned Date
        </label>
        <input
          type="date"
          name="sanctionedDate"
          value={formData.sanctionedDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Disbursed Amount (₹)
        </label>
        <input
          type="number"
          name="disbursedAmount"
          value={formData.disbursedAmount}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter disbursed amount"
          min="0"
          step="1000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Disbursement Date
        </label>
        <input
          type="date"
          name="disbursementDate"
          value={formData.disbursementDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Disbursement Type
        </label>
        <select
          name="disbursementType"
          value={formData.disbursementType}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select disbursement type</option>
          <option value="full">Full</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loan Account No
        </label>
        <input
          type="text"
          name="loanAccountNo"
          value={formData.loanAccountNo}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter loan account number"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Commission Details</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission Basis
        </label>
        <select
          name="commissionBasis"
          value={formData.commissionBasis}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select commission basis</option>
          <option value="sanctioned">Sanctioned</option>
          <option value="disbursed">Disbursed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Commission Percentage (%)
        </label>
        <input
          type="number"
          name="commissionPercentage"
          value={formData.commissionPercentage}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter commission percentage"
          min="0"
          max="100"
          step="0.01"
        />
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name
        </label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter customer name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SM/BM Name
        </label>
        <select
          name="smBmId"
          value={formData.smBmId}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select SM/BM</option>
          {loading ? (
            <option disabled>Loading staff...</option>
          ) : (
            staff.map((staffMember) => (
              <option key={staffMember.id || staffMember._id} value={staffMember.id || staffMember._id}>
                {staffMember.name || 'N/A'}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SM/BM Email
        </label>
        <input
          type="email"
          name="smBmEmail"
          value={formData.smBmEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter SM/BM email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SM/BM Mobile
        </label>
        <input
          type="tel"
          name="smBmMobile"
          value={formData.smBmMobile}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter SM/BM mobile number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ASM Name
        </label>
        <input
          type="text"
          name="asmName"
          value={formData.asmName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter ASM name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ASM Email
        </label>
        <input
          type="email"
          name="asmEmail"
          value={formData.asmEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter ASM email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ASM Mobile
        </label>
        <input
          type="tel"
          name="asmMobile"
          value={formData.asmMobile}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter ASM mobile number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code Use
        </label>
        <input
          type="text"
          name="codeUse"
          value={formData.codeUse}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter code use"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Branch
        </label>
        <input
          type="text"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter branch"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter remarks"
        />
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
          {lead ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  )
}

export default LeadForm
