const SelectField = ({ id, name, label, value, onChange, children, hint, error }) => {
    return (
        <div className="field">
            <label htmlFor={id} className="field-label">{label}</label>
            <select id={id} name={name} className="select" value={value} onChange={onChange} aria-invalid={!!error}>
                {children}
            </select>
            {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
        </div>
    )
}

export default SelectField