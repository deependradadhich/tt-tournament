import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";

export function ScreenHeader({
  title,
  subtitle,
  backHref,
  right,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 pb-2 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-faint-bg text-foreground"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Link>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        {right}
      </div>
      {subtitle && <p className="pl-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
  );
}
