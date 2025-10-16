
import { useEffect, useMemo, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getUser, getUsers } from '../features/users/userSlice'
import { listGroups, createGroup, updateGroup, deleteGroup, resetGroupStatus } from '../features/groups/groupSlice'
import { listMembers, joinGroup, leaveGroup, resetGroupMamberStatus } from '../features/groupMembers/memberSlice'
import { listEventsByGroup } from '../features/events/eventsSlice'

import Section from '../components/Section'
import AlertMessage from '../components/AlertMessage'
import ProfileHeader from '../components/ProfileHeader'
import DiscoverGroups from '../components/DiscoverGroups'
import ActionsBar from '../components/ActionsBar'
import GroupForm from '../components/GroupForm'
import GroupGrid from '../components/GroupGrid'
import SelectedGroupHeaderActions from '../components/SelectedGroupHeaderActions'
import SelectedGroupSection from '../components/SelectedGroupSection'

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
                            formGoup={formGoup}
                            open={openGroupForm}
                            onTagChange={onTagChange}
                            setOpen={setOpenGroupForm}
                            isUpdateGroup={isUpdateGroup}
                            onChange={onFormGroupChange}
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
