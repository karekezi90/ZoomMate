export default function OAuthButtons({ onGoogle, onFacebook, disabled }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={onGoogle} disabled={disabled} className="btn-muted w-full">
                <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.826 31.91 29.323 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.871 5.1 29.729 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.818C14.316 16.057 18.727 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.871 5.1 29.729 3 24 3 15.315 3 8.254 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 43c5.267 0 10.053-2.021 13.637-5.31l-6.292-5.329C29.163 34.778 26.715 36 24 36c-5.303 0-9.796-3.071-11.289-7.46l-6.51 5.02C8.124 39.556 15.475 43 24 43z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.373 3.91-5.156 7-11.303 7-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.871 5.1 29.729 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/></svg>
                    <span>Google</span>
                </span>
            </button>
            <button type="button" onClick={onFacebook} disabled={disabled} className="btn-muted w-full">
                <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-4 w-4"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.5 90.5 225.9 209 245V327h-63v-71h63v-54.6c0-62.2 37-96.6 93.7-96.6 27.1 0 55.5 4.8 55.5 4.8v61h-31.3c-30.8 0-40.4 19.1-40.4 38.7V256h68.8l-11 71H295v174c118.5-19.1 209-121.5 209-245z"/></svg>
                    <span>Facebook</span>
                </span>
            </button>
        </div>
    )
}