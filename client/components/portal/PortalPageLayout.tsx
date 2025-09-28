import type { ReactNode } from 'react';

interface PortalPageLayoutProps {
  title: string;
  subtitle: string;
  description?: string;
  filters: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function PortalPageLayout({
  title,
  subtitle,
  description,
  filters,
  headerActions,
  children,
}: PortalPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"160\" height=\"160\" viewBox=\"0 0 160 160\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cdefs%3E%3CradialGradient id=\"a\" cx=\"80\" cy=\"80\" r=\"120\" gradientUnits=\"userSpaceOnUse\"%3E%3Cstop stop-color=\"%23ffffff\" stop-opacity=\"0.18\"/%3E%3Cstop offset=\"1\" stop-color=\"%234c1d95\" stop-opacity=\"0\"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width=\"160\" height=\"160\" fill=\"url(%23a)\"/%3E%3C/svg%3E')] opacity-40"} />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2 text-neutral-100">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-200/80">{subtitle}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {description ? (
              <p className="text-base text-neutral-200/80">{description}</p>
            ) : null}
          </div>
          {headerActions ? <div className="flex items-center gap-3">{headerActions}</div> : null}
        </header>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:w-80 xl:w-96">
            <div className="space-y-8 rounded-3xl border border-white/10 bg-neutral-950/85 p-6 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur">
              {filters}
            </div>
          </aside>
          <main className="flex-1 space-y-8 pb-20 text-neutral-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
