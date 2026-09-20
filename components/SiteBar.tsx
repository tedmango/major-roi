import Link from "next/link";
import { GraduationCapIcon } from "lucide-react";

export function SiteBar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-line bg-surface px-6 py-3 lg:px-10">
      <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
        <GraduationCapIcon className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight">Degree Payback</span>
      </Link>
      <p className="hidden text-sm text-muted sm:block">
        What a major earns, what it costs, and when it pays for itself
      </p>
      {children && <div className="ml-auto">{children}</div>}
    </div>
  );
}

export function SampleBanner() {
  return (
    <div className="border-b border-gold/30 bg-gold/10 px-6 py-2.5 text-sm text-ink lg:px-10">
      Showing fictional sample schools. Add <span className="font-mono">SCORECARD_API_KEY</span> to
      your environment to search real colleges.
    </div>
  );
}
