import { memo } from 'react'
import TextInput from './TextInput'
import ChipInput from './ChipInput'

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

export default GroupForm
