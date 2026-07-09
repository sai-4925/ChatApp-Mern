const TypingIndicator = ({ name }) => (
  <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-light dark:text-muted-dark">
    <div className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 dark:bg-white/10">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </div>
    {name && <span>{name} is typing...</span>}
  </div>
);

export default TypingIndicator;
