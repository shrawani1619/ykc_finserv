const IndianRupeeIcon = ({ className = "w-6 h-6", ...props }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="M6 13h8" />
      <path d="M10 18h6" />
      <path d="M6 13l4-4" />
      <path d="M10 9l4-4" />
    </svg>
  )
}

export default IndianRupeeIcon
