const StatusBadge = ({ status }) => {
  const statusConfig = {
    logged: { color: 'bg-blue-100 text-blue-800', label: 'Logged' },
    sanctioned: { color: 'bg-purple-100 text-purple-800', label: 'Sanctioned' },
    partial_disbursed: { color: 'bg-orange-100 text-orange-800', label: 'Partial Disbursed' },
    disbursed: { color: 'bg-indigo-100 text-indigo-800', label: 'Disbursed' },
    completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
    rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
    paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
    pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
    overdue: { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
  }

  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export default StatusBadge
