export default function MessagesIndexPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-frogtown-50 gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-frogtown-100 text-frogtown-700">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path
            d="M12 4C7.03 4 3 7.36 3 11.5c0 2.3 1.26 4.36 3.25 5.73-.1.98-.42 2.16-1.19 3.27a.4.4 0 0 0 .43.62c1.6-.4 3.06-1.13 4.1-1.76.75.16 1.55.24 2.41.24 4.97 0 9-3.36 9-7.5S16.97 4 12 4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-green">Select a conversation to start messaging.</p>
    </div>
  )
}
