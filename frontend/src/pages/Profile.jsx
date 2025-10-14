import { useEffect, useMemo, useState } from 'react'
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
        return {
            myGroups,
            otherGroups,
            myGroupsMap
        }
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
            setFormGroup({
                name: '',
                description: '', 
                tags: []
            })
        } 

        if (updateGroupStatus === 'succeeded') {
            dispatch(resetGroupStatus())
            setIsUpdateGroup(false)
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
        setFormGroup((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }
    const onTagChange = (key, value) => {
        setFormGroup((prev) => ({
            ...prev,
            [key]: value
        }))
    }
    const onCreateOrUpdateGroup = (e) => {
        e.preventDefault()
        if (isUpdateGroup && selectedGroup) {
            dispatch(updateGroup({ 
                groupId: selectedGroup.groupId, 
                payload: formGoup
            }))
        } else {
            dispatch(createGroup(formGoup))
        }
    }

    const onViewGroup = (g) => {
        setOpenGroupForm(false)
        if (g) {
            const groupId = g.groupId
            setSelectedGroup(g)
            dispatch(listMembers({ groupId, params: { limit: 100 } }))
            dispatch(listEventsByGroup({ groupId, params: { limit: 50 } }))
        }
    }
    const onJoinGroup = (groupId) => {
        if (groupId) {
            dispatch(joinGroup({ groupId }))
        }
    }
    const onLeaveGroup = (groupId) => {
        if (groupId && user) {
            dispatch(leaveGroup({ groupId, userId: user.userId }))
        }
    }
    const onDeleteGroup = (groupId) => {
        if (groupId) {
            dispatch(deleteGroup(groupId))
        }
    }

    const onUpdateGroupInitiation = (group) => {
        setOpenGroupForm(true)
        setIsUpdateGroup(true)
        setFormGroup({
            name: group.name,
            tags: group.tags,
            description: group.description,
        })
    }

    const onReresh = () => {
        dispatch(getUser())
        dispatch(getUsers())
        dispatch(listGroups())
        dispatch(resetGroupStatus())
        dispatch(resetGroupMamberStatus())
        setErrorMessage('')
        setSuccessMessageGroup('')
        setSuccessMessageMember('')
        setErrorMessageMember('')
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column: Profile + actions */}
                <div className="lg:col-span-1 space-y-6">
                    <Section title="Profile">
                        <div className="flex items-center gap-4">
                            <img
                                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user?.email || '')}
                                alt='avatar'
                                className='h-16 w-16 rounded-xl ring-1 ring-black/5'
                            />
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
                                    {
                                        user.interests.length 
                                            ? user.interests.map((i) => (<Chip key={i}>{i}</Chip>)) 
                                            : (
                                                <p className='text-xs '>Setup interests in your account</p>
                                            )
                                    }
                                </div>
                            </div>
                        )}
                    </Section>
                    
                    <Section title="Discover Groups" className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                            {(otherGroups || []).map((g) => (
                                <div key={g.groupId} className={`card p-4 space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedGroup?.groupId === g.groupId ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={() => { onViewGroup(g) }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold">{g.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{g.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Actions">
                        <div className="flex items-center gap-3">
                            <Link to="/account" className="btn btn-indigo">Edit account</Link>
                            <button onClick={onReresh} className="btn btn-muted">Refresh</button>
                        </div>
                    </Section>
                </div>

                {/* Right column: Groups/Events/Discover/Forms */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Groups */}
                    <Section title="My Groups" className="space-y-4">
                        <AlertMessage message={errorMessage} />
                        <AlertMessage message={successMessageGroup} type='success' />
                        <div className='border rounded border-gray-100 dark:border-gray-700'>
                            <button
                                onClick={() => setOpenGroupForm(!openGroupForm)}
                                className="btn-muted w-full px-4 py-2 rounded"
                            >
                                {!openGroupForm ? 'Create a new group' : 'Close panel'}
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-500 ease-in-out  ${
                                    openGroupForm ? 'max-h-[26rem]  p-5' : 'max-h-0'
                                }`}
                            >
                                <form onSubmit={onCreateOrUpdateGroup} className="space-y-3">
                                    <TextInput 
                                        id='name' 
                                        name='name' 
                                        label='Name' 
                                        autoComplete='name' 
                                        value={formGoup.name} 
                                        onChange={onFormGroupChange} 
                                        placeholder='Miami beach club' 
                                    />
                                    <div className="field">
                                        <label className="field-label">Description</label>
                                        <textarea 
                                            id='description'
                                            name='description'
                                            className="textarea" 
                                            onChange={onFormGroupChange} 
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
                                                onChange={(value) => onTagChange('tags', value)} 
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

                        {(createGroupStatus === 'loading') && (<div className="text-sm text-gray-500 dark:text-gray-400">Loading groups…</div>)}

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {(myGroups || []).map((g) => (
                                <div key={g.groupId} className={`card p-4 space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedGroup?.groupId === g.groupId ? 'bg-gray-100 dark:bg-gray-700' : ''}`} onClick={() => { onViewGroup(g) }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-semibold">{g.name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{g.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>

                    {/* Members of selected group */}
                    {(selectedGroup && Object.keys(selectedGroup).length) && (
                        <Section 
                            title={selectedGroup.name} 
                            action={(
                                <>
                                    {(members?.length && user && members.find((m) => m.userId === user.userId)) ? (
                                        <button 
                                            className="btn btn-muted ml-auto"
                                            onClick={() => { onLeaveGroup(selectedGroup.groupId) }} 
                                            disabled={leaveGroupStatus === 'loading'}
                                        >
                                                {leaveGroupStatus === 'loading' ? 'Leaving group...' : 'Leave'}
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-primary ml-auto"
                                            disabled={joinGroupStatus === 'loading'}
                                            onClick={() => { onJoinGroup(selectedGroup.groupId) }} 
                                        >
                                            {joinGroupStatus === 'loading' ? 'Joining group...' : 'Join'}
                                        </button>
                                    )} 
                                    {myGroupsMap && myGroupsMap[selectedGroup.groupId] ? (
                                        <>
                                            <button 
                                                className="btn btn-indigo ml-2"
                                                disabled={updateGroupStatus === 'loading'}
                                                onClick={() => { onUpdateGroupInitiation(selectedGroup) }} 
                                            >
                                                Update
                                            </button> 
                                            <button 
                                                className="btn btn-danger ml-2"
                                                disabled={deleteGroupStatus === 'loading'}
                                                onClick={() => { onDeleteGroup(selectedGroup.groupId) }} 
                                            >
                                                {deleteGroupStatus === 'loading' ? 'Deleting group...' : 'Delete'}
                                            </button>
                                        </>
                                    ) : <></>}
                                </>
                            )}
                            className="space-y-4 transition-all duration-500 ease-in-out overflow-hidden"
                        >
                            <AlertMessage message={errorMessageMember} />
                            <AlertMessage message={successMessageMember}  type='success' />
                            <p>
                                {selectedGroup.description}
                            </p>
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
                            
                            {(listMembersStatus === 'loading') && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">Loading members…</div>
                            )}
                            <Section title="Members" className="space-y-4">
                                {listMembersStatus === 'loading' ? (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading members…</div>
                                ) : members && members.length ? (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                                        {membersState.members.map((m) => {
                                            const memberInfo = usersMap && usersMap[m.userId] ? usersMap[m.userId] : null
                                            return (
                                                <li key={m.userId} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            alt='avatar'
                                                            className='h-9 w-9 rounded-full ring-1 ring-black/5'
                                                            src={user?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(user?.email || '')}
                                                        />
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
                                ) : (
                                    <p>✨No members here yet! Invite others or join to get things started. You can as well be first to join</p>
                                )}
                            </Section>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
