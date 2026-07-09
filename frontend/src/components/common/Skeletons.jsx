export const ChatListSkeleton = () => (
  <div className="space-y-3 p-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-2.5 w-3/4 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export const MessageSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 0, 1, 1, 0].map((sent, i) => (
      <div key={i} className={`flex ${sent ? 'justify-end' : 'justify-start'}`}>
        <div className={`skeleton h-9 ${i % 2 ? 'w-40' : 'w-56'} rounded-2xl`} />
      </div>
    ))}
  </div>
);
