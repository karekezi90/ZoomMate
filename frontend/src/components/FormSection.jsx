const FormSection = ({ title, desc, children, className = "" }) => {
    return (
        <section className={`card p-6 ${className}`}>
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
                {desc && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{desc}</p>}
            </div>
            {children}
        </section>
    )
}

export default FormSection