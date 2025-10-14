import { useState } from 'react'

const ChipInput = ({ id, label, values = [], onChange, placeholder='Type and press Enter', hint }) => {
    const [text, setText] = useState('')

    function addToken(token) {
        const t = token.trim()
        if (!t) {
            return
        }
        if (values.includes(t)) {
            return
        }
        onChange([...values, t])
        setText('')
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addToken(text)
        } else if (e.key === 'Backspace' && !text && values.length) {
            onChange(values.slice(0, -1))
        }
    }

    function removeToken(t) {
        onChange(values.filter(v => v !== t))
    }

    return (
        <div className='field'>
            {label && <label htmlFor={id} className='field-label'>{label}</label>}
            <div className='input flex flex-wrap gap-2'>
                {values.map(v => (
                    <span key={v} className='chip'>
                        {v}
                        <button type='button' className='chip-btn' onClick={()=>removeToken(v)} aria-label={`Remove ${v}`}>×</button>
                    </span>
                ))}
                <input
                    id={id}
                    value={text}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    onChange={e=>setText(e.target.value)}
                    className='flex-1 outline-none bg-transparent'
                />
            </div>
            {hint && <p className='field-hint'>{hint}</p>}
        </div>
    )
}

export default ChipInput
