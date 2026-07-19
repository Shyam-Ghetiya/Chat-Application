import './Skeleton.css'

export function Skeleton({ width = '100%', height = '20px', borderRadius = '4px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  )
}

export function MessageSkeleton() {
  return (
    <div className="message-skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-content">
        <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton width="80%" height="14px" />
      </div>
    </div>
  )
}

export function UserSkeleton() {
  return (
    <div className="user-skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-info">
        <Skeleton width="120px" height="18px" style={{ marginBottom: '6px' }} />
        <Skeleton width="180px" height="14px" />
      </div>
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="conversation-skeleton">
      <div className="skeleton-avatar-large" />
      <div className="skeleton-info-large">
        <Skeleton width="150px" height="18px" style={{ marginBottom: '8px' }} />
        <Skeleton width="200px" height="14px" />
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="chat-skeleton">
      {[1, 2, 3, 4, 5].map((i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
}

export default Skeleton
