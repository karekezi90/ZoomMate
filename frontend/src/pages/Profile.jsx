
import { useEffect, useMemo, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getUser, getUsers } from '../features/users/userSlice'
import { listGroups, createGroup, updateGroup, deleteGroup, resetGroupStatus } from '../features/groups/groupSlice'
import { listMembers, joinGroup, leaveGroup, resetGroupMamberStatus } from '../features/groupMembers/memberSlice'
import { listEventsByGroup } from '../features/events/eventsSlice'

import Section from '../components/Section'
import Chip from '../components/Chip'
import KeyValue from '../components/KeyValue' 
import ChipInput from '../components/ChipInput'
import TextInput from '../components/TextInput'
import AlertMessage from '../components/AlertMessage'
import {
    capitalizeFirstLetter
} from '../_utitls'


const Avatar = memo(({ email, avatarUrl, size = 16, rounded = 'rounded-xl' }) => {
    const src = avatarUrl || ('https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(email || ''))
    const cls = `h-${size} w-${size} ${rounded} ring-1 ring-black/5`
    return <img src={src} alt="avatar" className={cls} />
})

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

const GroupCard = memo(({ group, selected, onClick }) => (
    <div
        key={group.groupId}
        className={`card p-4 space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        onClick={() => { if (onClick) { onClick(group) } }}
    >
        <div className="flex items-start justify-between gap-3">
            <div>
                <h3 className="text-base font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{group.description}</p>
            </div>
        </div>
    </div>
))

const GroupGrid = memo(({ groups, selectedGroup, onViewGroup, emptyMessage }) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(groups || []).length
            ? (groups || []).map((g) => (
                <GroupCard
                    key={g.groupId}
                    group={g}
                    selected={selectedGroup?.groupId === g.groupId}
                    onClick={onViewGroup}
                />
            ))
            : (emptyMessage ? <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p> : null)
        }
    </div>
))

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

const ActionsBar = memo(({ onRefresh }) => (
    <Section title="Actions">
        <div className="flex items-center gap-3">
            <Link to="/account" className="btn btn-indigo">Edit account</Link>
            <button onClick={onRefresh} className="btn btn-muted">Refresh</button>
        </div>
    </Section>
))

const GroupForm = memo(({
    open,
    setOpen,
    isUpdateGroup,
    formGoup,
    onChange,
    onTagChange,
    onSubmit,
    createGroupStatus,
    updateGroupStatus,
}) => (
    <div className='border rounded border-gray-100 dark:border-gray-700'>
        <button
            onClick={() => { setOpen(!open) }}
            className="btn-muted w-full px-4 py-2 rounded"
        >
            {!open ? 'Create a new group' : 'Close panel'}
        </button>

        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${open ? 'max-h-[26rem] p-5' : 'max-h-0'}`}>
            <form onSubmit={onSubmit} className="space-y-3">
                <TextInput 
                    id='name' 
                    name='name' 
                    label='Name' 
                    autoComplete='name' 
                    value={formGoup.name} 
                    onChange={onChange} 
                    placeholder='Miami beach club' 
                />
                <div className="field">
                    <label className="field-label">Description</label>
                    <textarea 
                        id='description'
                        name='description'
                        className="textarea" 
                        onChange={onChange} 
                        value={formGoup.description} 
                        placeholder='Miami Beach Club: sun-soaked days, neon-lit nights, and nonstop coastal vibes.' 
                    />
                </div>
                <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='sm:col-span-2'>
                        <ChipInput 
                            id='tags' 
                            label='Tags' 
                            values={formGoup.tags} 
                            hint='Press Enter or comma to add.' 
                            onChange={(value) => { onTagChange('tags', value) }} 
                        />
                    </div>
                </div>
                <div className="flex pt-1 items-center gap-3">
                    {isUpdateGroup ? (
                        <button 
                            type="submit" 
                            className="btn btn-indigo w-full"
                            disabled={updateGroupStatus === 'loading'}
                        >{updateGroupStatus === 'loading' ? 'Updating group...' : 'Update'}</button>
                    ) : (
                        <button 
                            type="submit" 
                            className="btn btn-primary w-full"
                            disabled={createGroupStatus === 'loading'}
                        >{createGroupStatus === 'loading' ? 'Creating group...' : 'Create'}</button>
                    )}
                </div>
            </form>
        </div>
    </div>
))

const MemberList = memo(({ members, usersMap }) => {
    if (!members || !members.length) {
        return (<p>✨No members here yet! Invite others or join to get things started. You can as well be first to join</p>)
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {members.map((m) => {
                const memberInfo = (usersMap && usersMap[m.userId]) ? usersMap[m.userId] : null
                return (
                    <li key={m.userId} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* NOTE: We intentionally use current user's avatar url/email here to keep logic intact */}
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
                        {deleteGroupStatus === 'loading' ? 'Deleting group...' : 'Delete'}
                    </button>
                </>
            ) : <></>}
        </>
    )
})

const SelectedGroupSection = memo(({
    selectedGroup,
    statuses,
    alerts,
    tags,
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

/** ------------------------------------------------------------------
 * Page component
 * -------------------------------------------------------------------*/
const Profile = () => {
    const dispatch = useDispatch()
  
    const groupsState = useSelector((state) => state.groups)
    const membersState = useSelector((state) => state.groupMembers)
    const { user, users } = useSelector((state) => state.user)
    
    const { createGroupStatus, updateGroupStatus, deleteGroupStatus, groups } = groupsState
    const { listMembersStatus, joinGroupStatus, leaveGroupStatus, members } = membersState

    useEffect(() => {
        dispatch(getUser())
        dispatch(getUsers())
        dispatch(listGroups({ params: {} }))
    }, [dispatch])

    const fullName = useMemo(() => {
        if (user && (user.firstName || user.lastName)) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        return user?.name || user?.displayName || 'Your Profile'
    }, [user])

    const [openGroupForm, setOpenGroupForm] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [isUpdateGroup, setIsUpdateGroup] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [errorMessageMember, setErrorMessageMember] = useState('')
    const [successMessageMember, setSuccessMessageMember] = useState('')
    const [successMessageGroup, setSuccessMessageGroup] = useState('')
    const [formGoup, setFormGroup] = useState({
        name: '',
        description: '', 
        tags: []
    })

    const detailedGroups = useMemo(() => {
        const myGroups = []
        const otherGroups = []
        const myGroupsMap = {}
        if (user && groups?.length) {
            groups.forEach((g) => {
                if (g.ownerId === user.userId) {
                    myGroups.push(g)
                    myGroupsMap[g.groupId] = g
                } else {
                    otherGroups.push(g)
                }
            })
        }
        return { myGroups, otherGroups, myGroupsMap }
    }, [groupsState, user])

    const { myGroups, otherGroups, myGroupsMap } = detailedGroups

    const usersMap = useMemo(() => {
        const map = {}
        if (users) {
            users.forEach((u) => {
                map[u.userId] = u
            })
        }
        return map
    }, [users])

    useEffect(() => {
        if (createGroupStatus === 'failed') {
            dispatch(resetGroupStatus())
            setErrorMessage(groupsState?.error)
        } else if (createGroupStatus === 'succeeded') {
            dispatch(resetGroupStatus())
            setSuccessMessageGroup('You created a group successfully!')
            setFormGroup({ name: '', description: '', tags: [] })
        } 

        if (updateGroupStatus === 'succeeded') {
            dispatch(resetGroupStatus())
            setIsUpdateGroup(false)
            setOpenGroupForm(false)
            setFormGroup({ name: '', description: '', tags: [] })
            setSuccessMessageGroup('You updated the group successfully!')
        }

        if (deleteGroupStatus === 'succeeded') {
            dispatch(listGroups())
            setSelectedGroup(null)
            setSuccessMessageMember('You deleted the group successfully!')
        }

        if (joinGroupStatus === 'succeeded') {
            dispatch(resetGroupMamberStatus())
            setSuccessMessageMember('You joined the group successfully!')
        } else if (leaveGroupStatus === 'succeeded') {
            dispatch(resetGroupMamberStatus())
            setSuccessMessageMember('You left the group successfully!')
        } 
        
        if (
            listMembersStatus === 'failed' || 
            joinGroupStatus === 'failed' || 
            leaveGroupStatus === 'failed' || 
            updateGroupStatus === 'failed' || 
            deleteGroupStatus === 'failed'
        ) {
            setErrorMessageMember(groupsState?.error || membersState?.error)
            dispatch(resetGroupStatus())
            dispatch(resetGroupMamberStatus())
        }
    }, [createGroupStatus, listMembersStatus, joinGroupStatus, leaveGroupStatus, deleteGroupStatus, updateGroupStatus])

    const onFormGroupChange = (e) => {
        setFormGroup((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }
    const onTagChange = (key, value) => {
        setFormGroup((prev) => ({ ...prev, [key]: value }))
    }
    const onCreateOrUpdateGroup = (e) => {
        e.preventDefault()
        if (isUpdateGroup && selectedGroup) {
            dispatch(updateGroup({ groupId: selectedGroup.groupId, payload: formGoup }))
        } else {
            dispatch(createGroup(formGoup))
        }
    }

    const onViewGroup = (g) => {
        setOpenGroupForm(false)
        handleCleanAlertMessages()
        if (g) {
            const groupId = g.groupId
            setSelectedGroup(g)
            dispatch(listMembers({ groupId, params: { limit: 100 } }))
            dispatch(listEventsByGroup({ groupId, params: { limit: 50 } }))
        }
    }
    const onJoinGroup = (groupId) => {
        handleCleanAlertMessages()
        if (groupId) {
            dispatch(joinGroup({ groupId }))
        }
    }
    const onLeaveGroup = (groupId) => {
        handleCleanAlertMessages()
        if (groupId && user) {
            dispatch(leaveGroup({ groupId, userId: user.userId }))
        }
    }
    const onDeleteGroup = (groupId) => {
        handleCleanAlertMessages()
        if (groupId) {
            dispatch(deleteGroup(groupId))
        }
    }

    const onUpdateGroupInitiation = (group) => {
        handleCleanAlertMessages()
        setOpenGroupForm(true)
        setIsUpdateGroup(true)
        setFormGroup({
            name: group.name,
            tags: group.tags,
            description: group.description,
        })
    }

    const handleCleanAlertMessages = () => {
        setErrorMessage('')
        setErrorMessageMember('')
        setSuccessMessageGroup('')
        setSuccessMessageMember('')
    }

    const onReresh = () => {
        dispatch(getUser())
        dispatch(getUsers())
        dispatch(listGroups())
        dispatch(resetGroupStatus())
        dispatch(resetGroupMamberStatus())
        handleCleanAlertMessages()
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Profile + actions */}
                <div className="lg:col-span-1 space-y-6">
                    <ProfileHeader user={user} fullName={fullName} />
                    <DiscoverGroups groups={otherGroups} onViewGroup={onViewGroup} selectedGroup={selectedGroup} />
                    <ActionsBar onRefresh={onReresh} />
                </div>

                {/* Right column: Groups/Events/Discover/Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Groups */}
                    <Section title="My Groups" className="space-y-4">
                        <AlertMessage message={errorMessage} />
                        <AlertMessage message={successMessageGroup} type='success' />

                        <GroupForm
                            open={openGroupForm}
                            setOpen={setOpenGroupForm}
                            isUpdateGroup={isUpdateGroup}
                            formGoup={formGoup}
                            onChange={onFormGroupChange}
                            onTagChange={onTagChange}
                            onSubmit={onCreateOrUpdateGroup}
                            createGroupStatus={createGroupStatus}
                            updateGroupStatus={updateGroupStatus}
                        />

                        {(createGroupStatus === 'loading') && (<div className="text-sm text-gray-500 dark:text-gray-400">Loading groups…</div>)}

                        <GroupGrid
                            groups={myGroups}
                            selectedGroup={selectedGroup}
                            onViewGroup={onViewGroup}
                            emptyMessage="You don't have groups yet."
                        />
                    </Section>

                    {/* Members of selected group */}
                    {(selectedGroup && Object.keys(selectedGroup).length) && (
                        <SelectedGroupSection
                            selectedGroup={selectedGroup}
                            statuses={{ listMembersStatus }}
                            alerts={{ error: errorMessageMember, success: successMessageMember }}
                            tags={selectedGroup?.tags || []}
                            members={membersState.members}
                            usersMap={usersMap}
                            headerActions={(
                                <SelectedGroupHeaderActions
                                    user={user}
                                    members={members}
                                    selectedGroup={selectedGroup}
                                    myGroupsMap={myGroupsMap}
                                    joinGroupStatus={joinGroupStatus}
                                    leaveGroupStatus={leaveGroupStatus}
                                    updateGroupStatus={updateGroupStatus}
                                    deleteGroupStatus={deleteGroupStatus}
                                    onJoin={onJoinGroup}
                                    onLeave={onLeaveGroup}
                                    onUpdate={onUpdateGroupInitiation}
                                    onDelete={onDeleteGroup}
                                />
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
