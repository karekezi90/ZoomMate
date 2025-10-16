import { memo } from 'react'
import Section from './Section'
import Chip from './Chip'
import KeyValue from './KeyValue'
import Avatar from './Avatar'
import { capitalizeFirstLetter } from '../_utitls'

const ProfileHeader = memo(({ user, fullName }) => (
  <Section title="Profile">
    <div className="flex items-center gap-4">
      <Avatar email={user?.email} avatarUrl={user?.avatarUrl} />
      <div>
        <h1 className="text-xl font-semibold">{fullName}</h1>
        <p className="text-sm">{user?.email || ''}</p>
      </div>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-4">
      <KeyValue label="First name" value={capitalizeFirstLetter(user?.firstName) || '—'} />
      <KeyValue label="Gender" value={capitalizeFirstLetter(user?.gender) || '_'} />
      <KeyValue label="Last Name" value={capitalizeFirstLetter(user?.lastName) || '—'} />
      <KeyValue label="Pronouns" value={user?.pronouns || '—'} />
    </div>

    {(user?.interests && Array.isArray(user.interests)) && (
      <div className="mt-4">
        <p className="field-label mb-2">Interests</p>
        <div className="flex flex-wrap gap-2">
          {user.interests.length 
            ? user.interests.map((i) => (<Chip key={i}>{i}</Chip>)) 
            : (<p className='text-xs '>Setup interests in your account</p>)
          }
        </div>
      </div>
    )}
  </Section>
))

export default ProfileHeader
