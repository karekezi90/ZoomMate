import { memo } from 'react'
import Section from './Section'
import GroupCard from './GroupCard'

const DiscoverGroups = memo(({ groups, onViewGroup, selectedGroup }) => (
  <Section title="Discover Groups" className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {(groups || []).map((g) => (
        <GroupCard
          key={g.groupId}
          group={g}
          selected={selectedGroup?.groupId === g.groupId}
          onClick={onViewGroup}
        />
      ))}
    </div>
  </Section>
))

export default DiscoverGroups
