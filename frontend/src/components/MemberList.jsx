import { memo } from 'react'
import Avatar from './Avatar'

const MemberList = memo(({ members, usersMap }) => {
  if (!(members) || !(members.length)) {
    return (<p>✨No members here yet! Invite others or join to get things started. You can as well be first to join</p>)
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
      {members.map((m) => {
        const memberInfo = (usersMap && usersMap[m.userId]) ? usersMap[m.userId] : null
        return (
          <li key={m.userId} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar email={memberInfo?.email} avatarUrl={memberInfo?.avatarUrl} size={9} rounded="rounded-full" />
              <div>
                <p className="text-sm font-medium">{memberInfo?.firstname || memberInfo?.email || m.userId}</p>
                <p className="text-xs text-gray-500">{memberInfo?.email || m.userId}</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">role: {m.role || 'member'}</span>
          </li>
        )
      })}
    </ul>
  )
})

export default MemberList
