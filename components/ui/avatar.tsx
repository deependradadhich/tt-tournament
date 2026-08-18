export function AvatarCircle({ name, className = "" }: { name: string; className?: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-tint text-sm font-semibold text-accent ${className}`}
    >
      {initial}
    </div>
  );
}
