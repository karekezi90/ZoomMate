const RadioGroup = ({ name, label, options = [], value, onChange, hint, inline=false }) => {
    return (
        <div className="field">
            {label && <div className="field-label">{label}</div>}
            <div className={inline ? "flex flex-wrap gap-4" : "space-y-2"}>
                {options.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} />
                        <span>{opt.label}</span>
                    </label>
                ))}
            </div>
            {hint && <p className="field-hint">{hint}</p>}
        </div>
    )
}

export default RadioGroup