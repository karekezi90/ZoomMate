import { memo } from 'react'
import GroupCard from './GroupCard'

const GroupGrid = memo(({ groups, selectedGroup, onViewGroup, emptyMessage }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {(groups || []).length
      ? (groups || []).map((g) => (
          <GroupCard
            group={g}
            key={g.groupId}
            onClick={onViewGroup}
            selected={selectedGroup?.groupId === g.groupId}
          />
        ))
      : (emptyMessage ? <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p> : null)
    }
  </div>
))

export default GroupGrid
