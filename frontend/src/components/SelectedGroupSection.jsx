import { memo } from 'react'
import Section from './Section'
import Chip from './Chip'
import AlertMessage from './AlertMessage'
import MemberList from './MemberList'

const SelectedGroupSection = memo(({
  selectedGroup,
  statuses,
  alerts,
  members,
  usersMap,
  headerActions
}) => (
  <Section 
    title={selectedGroup.name} 
    action={headerActions}
    className="space-y-4 transition-all duration-500 ease-in-out overflow-hidden"
  >
    <AlertMessage message={alerts.error} />
    <AlertMessage message={alerts.success} type='success' />

    <p>{selectedGroup.description}</p>

    <div className="flex items-center gap-2 pt-2">
      {(selectedGroup?.tags && Array.isArray(selectedGroup.tags)) && (
        <div className="mt-4">
          <p className="field-label mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {selectedGroup.tags.map((i) => (<Chip key={i}>{i}</Chip>)) }
          </div>
        </div>
      )}
    </div>
    
    {(statuses.listMembersStatus === 'loading') && (
      <div className="text-sm text-gray-500 dark:text-gray-400">Loading members…</div>
    )}

    <Section title="Members" className="space-y-4">
      {statuses.listMembersStatus === 'loading' ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading members…</div>
      ) : (
        <MemberList members={members} usersMap={usersMap} />
      )}
    </Section>
  </Section>
))

export default SelectedGroupSection
