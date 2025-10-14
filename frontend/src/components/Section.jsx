const Section = ({ title, action, children, className = '' }) => {
    return (
        <section className={`card p-6 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    )
}

export default Section