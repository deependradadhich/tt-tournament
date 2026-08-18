export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-tint">
        <div className="h-4 w-4 rounded-full bg-accent" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
