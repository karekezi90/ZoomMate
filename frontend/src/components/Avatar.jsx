import { memo } from 'react'

const Avatar = memo(({ email, avatarUrl, size = 16, rounded = 'rounded-xl' }) => {
  const src = avatarUrl || ('https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(email || ''))
  const cls = `h-${size} w-${size} ${rounded} ring-1 ring-black/5`
  return <img src={src} alt="avatar" className={cls} />
})

export default Avatar
