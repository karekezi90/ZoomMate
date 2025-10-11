export default function ErrorMessage({ message }) {
    if (!message) return null
    return (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert" aria-live="polite">
            {message}
        </div>
    )
}