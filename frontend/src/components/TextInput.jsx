
const cx = (...args) => {
  return args.filter(Boolean).join(" ");
}

const TextInput = ({ 
    id,
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    autoComplete,
    error,
    hint,
    name,
    required = false,
    disabled = false,
    size = "md",
    variant = "default",
    leadingIcon,
    trailingIcon,
    className,
    inputProps = {},
 }) => {

    const sizeCls = size === "sm" ? "input-sm" : size === "lg" ? "input-lg" : ""
    const variantCls = variant === "ghost" ? "input-ghost" : variant === "solid" ? "input-solid" : ""

    const hasL = Boolean(leadingIcon);
    const hasR = Boolean(trailingIcon);
    return (
        <div className={cx("field", className)}>
            {label && (
                <label htmlFor={id} className="field-label">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="input-wrap">
                {hasL && <span className="input-icon-l">{leadingIcon}</span>}
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
                    className={cx(
                        "input",
                        sizeCls,
                        variantCls,
                        hasL && "has-icon-l",
                        hasR && "has-icon-r"
                    )}
                    {...inputProps}
                />
                {hasR && <span className="input-icon-r">{trailingIcon}</span>}
            </div>

            {/* Error takes priority over hint */}
            {error ? (
                <p id={`${id}-error`} className="field-error">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="field-hint">
                    {hint}
                </p>
            ) : null}
        </div>
    )
}

export default TextInput