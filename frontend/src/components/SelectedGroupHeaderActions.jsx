import { memo } from 'react'

const SelectedGroupHeaderActions = memo(({
  user,
  members,
  selectedGroup,
  myGroupsMap,
  joinGroupStatus,
  leaveGroupStatus,
  updateGroupStatus,
  deleteGroupStatus,
  onJoin,
  onLeave,
  onUpdate,
  onDelete,
}) => {
  const isMember = (members?.length && user && members.find((m) => m.userId === user.userId)) ? true : false
  const isOwner = (myGroupsMap && myGroupsMap[selectedGroup.groupId]) ? true : false

  return (
    <>
      {isMember ? (
        <button 
          className="btn btn-muted ml-auto"
          onClick={() => { onLeave(selectedGroup.groupId) }} 
          disabled={leaveGroupStatus === 'loading'}
        >
          {leaveGroupStatus === 'loading' ? 'Leaving group...' : 'Leave'}
        </button>
      ) : (
        <button 
          className="btn btn-primary ml-auto"
          disabled={joinGroupStatus === 'loading'}
          onClick={() => { onJoin(selectedGroup.groupId) }} 
        >
          {joinGroupStatus === 'loading' ? 'Joining group...' : 'Join'}
        </button>
      )} 
      {isOwner ? (
        <>
          <button 
            className="btn btn-indigo ml-2"
            disabled={updateGroupStatus === 'loading'}
            onClick={() => { onUpdate(selectedGroup) }} 
          >
            Update
          </button> 
          <button 
            className="btn btn-danger ml-2"
            disabled={deleteGroupStatus === 'loading'}
            onClick={() => { onDelete(selectedGroup.groupId) }} 
          >
            {deleteGroupStatus === 'loading' ? 'Deleting group.' : 'Delete'}
          </button>
        </>
      ) : <></>}
    </>
  )
})

export default SelectedGroupHeaderActions
