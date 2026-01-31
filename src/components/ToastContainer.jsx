import ToastNotification from './ToastNotification'

const ToastContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  )
}

export default ToastContainer
