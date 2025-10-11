import { useTheme } from '../context/ThemeContext'

const SunIcon = (props) => {
    return (
        <svg viewBox='0 0 24 24' aria-hidden='true' {...props}>
            <path d='M12 4.5a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 12 4.5Zm0 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1-.75-.75ZM4.5 12a.75.75 0 0 1 .75-.75v-.5a.75.75 0 1 1 1.5 0v.5A.75.75 0 0 1 6 12a.75.75 0 0 1-.75.75v.5a.75.75 0 0 1-1.5 0v-.5A.75.75 0 0 1 4.5 12Zm12.75-6.03a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Zm-10.89 10.9a.75.75 0 0 1 1.06 0l.35.35a.75.75 0 1 1-1.06 1.06l-.35-.35a.75.75 0 0 1 0-1.06Zm12.3 1.41a.75.75 0 0 1-1.06 0l-.35-.35a.75.75 0 0 1 1.06-1.06l.35.35a.75.75 0 0 1 0 1.06ZM6.21 6.21a.75.75 0 0 1-1.06 1.06l-.35-.35a.75.75 0 0 1 1.06-1.06l.35.35ZM12 7.5A4.5 4.5 0 1 1 7.5 12 4.505 4.505 0 0 1 12 7.5Z'/>
        </svg>
    )
}

const MoonIcon = (props) => {
    return (
        <svg viewBox='0 0 24 24' aria-hidden='true' {...props}>
            <path d='M21 12.75A8.25 8.25 0 1 1 11.25 3a.75.75 0 0 1 .84.99 6.75 6.75 0 0 0 8.82 8.82.75.75 0 0 1 .09 1.41 8.225 8.225 0 0 1-.99.53Z'/>
        </svg>
    )
}

const ThemeToggle = () => {
    const { dark, toggle } = useTheme()

    return (
        <button
            type='button'
            role='switch'
            onClick={toggle}
            aria-checked={dark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={[
                'relative inline-flex h-9 w-16 items-center rounded-full',
                'transition shadow-sm border',
                dark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-gray-100 border-gray-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500',
            ].join(' ')}
        >
            {/* Track icons */}
            <span className='pointer-events-none absolute left-1 flex h-6 w-6 items-center justify-center'>
                <SunIcon className='h-4 w-4 fill-yellow-500 opacity-100 transition-opacity duration-200' />
            </span>
            <span className='pointer-events-none absolute right-1 flex h-6 w-6 items-center justify-center'>
                <MoonIcon className='h-4 w-4 fill-indigo-200 dark:fill-brand-200 opacity-100 transition-opacity duration-200' />
            </span>

            {/* Thumb */}
            <span
                className={[
                    'pointer-events-none inline-block h-7 w-7 rounded-full bg-white',
                    'shadow ring-1 ring-black/5 transform transition-transform duration-200',
                    dark ? 'translate-x-7' : 'translate-x-0',
                ].join(' ')}
            />

            {/* Accessible text for screen readers (kept hidden visually) */}
            <span className='sr-only'>{dark ? 'Dark mode' : 'Light mode'}</span>
        </button>
  )
}

export default ThemeToggle
