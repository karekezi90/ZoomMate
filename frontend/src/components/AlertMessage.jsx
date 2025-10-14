const AlertMessage = ({ message, type = 'error' }) => {
    if (!message) {
        return null
    }

    const styles = {
        error: {
            container: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-100',
        },
        warning: {
            container: 'border border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-900 dark:text-yellow-100',
        },
        info: {
            container: 'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100',
        },
        success: {
            container: 'border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200'
        }
    }

    const { container } = styles[type] || styles.error

    return (
        <div
            aria-live="polite"
            role="alert"
            className={`mb-4 rounded-xl p-3 text-sm ${container}`}
        >
            {message}
        </div>
    )
}

export default AlertMessage