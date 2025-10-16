import { memo } from 'react'

const GroupCard = memo(({ group, selected, onClick }) => (
  <div
    key={group.groupId}
    className={`card p-4 space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
    onClick={() => { if (onClick) { onClick(group) } }}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold">{group.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {group.description.length > 100
            ? `${group.description.slice(0, 50)}...`
            : group.description}
        </p>
      </div>
    </div>
  </div>
))

export default GroupCard
