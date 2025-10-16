import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getUser, updateUser } from '../features/users/userSlice'
import { deleteSelf, resetAuth } from '../features/auth/authSlice'
import { filterAllowedFields } from '../_utitls'
import FormSection from '../components/FormSection'
import SelectField from '../components/SelectField'
import RadioGroup from '../components/RadioGroup'
import ChipInput from '../components/ChipInput'
import TextInput from '../components/TextInput'
import AlertMessage from '../components/AlertMessage'

const emptyUser = {
  bio: '',
  firstName: '',
  lastName: '',
  gender: '',
  pronouns: '',
  maritalStatus: '',
  employmentStatus: '',
  jobTitle: '',
  company: '',
  industry: '',
  yearsExperience: 0,
  hobbies: [],
  sports: [],
  interests: [],
  website: '',
  linkedin: '',
  twitter: '',
  preferredMeetingTimes: '',
}

const Account = () => {
  const dispatch = useDispatch()
  const [errorMessage, setErrorMessage] = useState('')

  const { deleteStatus } = useSelector(state => state.auth)
  const { error, user, updateUserStatus, getUserStatus } = useSelector(state => state.user)

  const [form, setForm] = useState(emptyUser)

  useEffect(() => {
    dispatch(getUser())
  }, [])


  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        ...(user || {}) 
      }))
    }

    if (getUserStatus === 'failed' || deleteStatus === 'failed') {
      setErrorMessage(error)
    } 

    if (deleteStatus === 'succeeded') {
      dispatch(resetAuth())
    }
    
  }, [user, getUserStatus, deleteStatus])

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  
  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function onSubmit(e) {
    e.preventDefault()
    setErrorMessage('') 

    if (user) {
      dispatch(updateUser(filterAllowedFields(form)))
    }
  }

  const handleDeleteAccount = () => {
    dispatch(deleteSelf())
  }

  return (
    <div className='mx-auto max-w-6xl sm:p-4 md:p-6 lg:p-10 rounded-lg border-gray-300 dark:bg-gray-900'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-row'>
          <h1 className='text-2xl font-semibold'>Account settings</h1>
          <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>Update your info, preferences, and what you enjoy.</p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleDeleteAccount} className="btn-danger">{deleteStatus === 'loading' ? 'Deleting Account...' : 'Delete My Account'}</button>
        </div>
      </div>

      {updateUserStatus === 'succeeded' && (
        <AlertMessage message='Your changes have been saved.' type='success'/>
      )}
      <AlertMessage message={errorMessage} />

      <form onSubmit={onSubmit} className='grid gap-6 lg:grid-cols-3'>
        {/* Column 1-2 */}
        <div className='lg:col-span-2 space-y-6'>
          <FormSection 
            title='Profile' 
            desc='Basic details other people may see.'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <TextInput 
                id='firstName' 
                name='firstName' 
                label='First Name' 
                placeholder='John' 
                onChange={onChange} 
                value={form.firstName} 
                autoComplete='firstName' 
              />
              <TextInput 
                id='lastName' 
                name='lastName' 
                label='Last Name' 
                placeholder='Doe' 
                onChange={onChange} 
                value={form.lastName} 
                autoComplete='lastName' 
              />
              <div className='field sm:col-span-2'>
                <label htmlFor='bio' className='field-label'>Bio</label>
                <textarea 
                  id='bio' 
                  name='bio'
                  value={form.bio} 
                  className='textarea' 
                  onChange={onChange} 
                  placeholder='Tell people a little about yourself' 
                />
              </div>
            </div>
          </FormSection>

          <FormSection 
            title='Work' 
            desc='Your professional background.'
          >
            <div className='grid gap-4 sm:grid-cols-2'>
              <TextInput 
                id='jobTitle' 
                label='Job Title' 
                name='jobTitle' 
                value={form.jobTitle} 
                onChange={onChange} 
                autoComplete='jobTitle' 
                placeholder='Accountant' 
              />
              <TextInput 
                id='company' 
                label='Company / Organization' 
                name='company' 
                value={form.company} 
                onChange={onChange} 
                autoComplete='company' 
                placeholder='Google' 
              />
              <TextInput 
                id='industry' 
                label='Industry' 
                name='industry' 
                value={form.industry} 
                onChange={onChange} 
                autoComplete='industry' 
                placeholder='Tech' 
              />
              <TextInput 
                type='number'
                id='yearsExperience' 
                label='Years of experience' 
                name='yearsExperience' 
                value={form.yearsExperience} 
                onChange={onChange} 
                autoComplete='yearsExperience' 
                placeholder='5' 
              />
              <SelectField 
                id='employmentStatus' 
                name='employmentStatus' 
                label='Employment status' 
                value={form.employmentStatus} 
                onChange={onChange}
              >
                <option value='employed'>Employed</option>
                <option value='self-employed'>Self-employed</option>
                <option value='student'>Student</option>
                <option value='seeking'>Seeking opportunities</option>
                <option value='retired'>Retired</option>
                <option value='unspecified'>Prefer not to say</option>
              </SelectField>
            </div>
          </FormSection>

          <FormSection title='Personal' desc='Tell us how you like to be addressed.'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <RadioGroup
                name='gender'
                label='Gender'
                value={form.gender}
                onChange={onChange}
                inline
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'nonbinary', label: 'Non-binary' },
                  { value: 'unspecified', label: 'Prefer not to say' },
                ]}
              />
              <TextInput 
                id='pronouns' 
                label='Pronouns' 
                name='pronouns' 
                value={form.pronouns} 
                onChange={onChange} 
                autoComplete='pronouns' 
                placeholder='e.g., she/her, he/him, they/them' 
              />
              <SelectField 
                id='maritalStatus' 
                name='maritalStatus' 
                label='Status in life' 
                value={form.maritalStatus} 
                onChange={onChange}
              >
                <option value='single'>Single</option>
                <option value='in-relationship'>In a relationship</option>
                <option value='married'>Married</option>
                <option value='separated'>Separated</option>
                <option value='widowed'>Widowed</option>
                <option value='unspecified'>Prefer not to say</option>
              </SelectField>
              <SelectField 
                id='preferredMeetingTimes' 
                name='preferredMeetingTimes' 
                label='Preferred meeting times' 
                value={form.preferredMeetingTimes} 
                onChange={e=>setField('preferredMeetingTimes', e.target.value)} 
                hint='Helps others propose times that work.'
              >
                <option value='business-hours'>Business hours</option>
                <option value='mornings'>Mornings</option>
                <option value='afternoons'>Afternoons</option>
                <option value='evenings'>Evenings</option>
                <option value='weekends'>Weekends</option>
              </SelectField>
            </div>
          </FormSection>

          <FormSection title='What you enjoy' desc='Share hobbies, sports, and interests.'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <ChipInput id='hobbies'  label='Hobbies' values={form.hobbies}  onChange={v=>setField('hobbies', v)}  hint='Press Enter or comma to add.' />
              <ChipInput id='sports'   label='Sports'  values={form.sports}   onChange={v=>setField('sports', v)}   />
              <div className='sm:col-span-2'>
                <ChipInput id='interests' label='Interests' values={form.interests} onChange={v=>setField('interests', v)} />
              </div>
            </div>
          </FormSection>
          
          <FormSection title='Contact & Links' desc='Ways people can learn more about you.'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className="field">
                <p className="field-label">
                  Email
                </p>
                <p className='px-3 py-[6px] rounded-xl light:border dark:py-[7px] dark:bg-gray-900 dark:text-white/70'>{form?.email}</p>
              </div>  
              <TextInput 
                id='phone' 
                name='phone' 
                label='Phone' 
                value={form.phone} 
                onChange={onChange} 
                autoComplete='phone' 
                placeholder='+1 (415) 839-2746' 
              />
              <TextInput 
                id='website' 
                name='website' 
                label='Website' 
                onChange={onChange} 
                value={form.website} 
                autoComplete='website' 
                placeholder='https://example.com' 
              />
              <TextInput 
                id='linkedin' 
                name='linkedin' 
                label='LinkedIn' 
                onChange={onChange} 
                value={form.linkedin} 
                autoComplete='linkedin' 
                placeholder='https://linkedin.com/in/…'
              />
              <TextInput 
                id='twitter' 
                name='twitter' 
                label='Twitter / X' 
                onChange={onChange} 
                value={form.twitter} 
                autoComplete='twitter' 
                placeholder='https://x.com/…'
              />
            </div>
          </FormSection> 
        </div>

        {/* Column 3: Save panel */}
        <div className='space-y-6'>
          <FormSection title='Photo' desc='This helps teammates recognize you.'>
            <div className='flex items-center gap-4'>
              <img
                src={form.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(form.email)}
                alt='avatar'
                className='h-16 w-16 rounded-xl ring-1 ring-black/5'
              />
              <div className='space-y-2'>
                <label className='btn-muted cursor-pointer'>
                  <input type='file' accept='image/*' className='hidden' onChange={() => {}} />
                  Upload new
                </label>
                {form.avatarUrl && (
                  <button type='button' className='text-xs text-red-600 hover:underline' onClick={()=>{ setField('avatarUrl',''); setAvatarFile(null); }}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </FormSection>
          
          <FormSection title='Save changes'>
            <button type='submit' className='btn-primary w-full'>{updateUserStatus === 'loading' ? 'Saving…' : 'Save'}</button>
            <p className='mt-3 text-xs text-gray-500'>Your details help ZoomMate personalize meeting/event suggestions.</p>
          </FormSection>
        </div>
      </form>
    </div>
  )
}

export default Account