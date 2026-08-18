import Link from "next/link";

/** Small persistent link back to the tournament list — the tab screens otherwise have no way home. */
export function HomeLink() {
  return (
    <div className="flex items-center border-b border-card-border px-5 py-2.5">
      <Link href="/" className="text-xs font-bold text-muted">
        🏓 All Tournaments
      </Link>
    </div>
  );
}
