const KeyValue = ({ label, value }) => {
    return (
        <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <p className="mt-1 text-sm text-gray-700">{value || '—'}</p>
        </div>
    )
}

export default KeyValue