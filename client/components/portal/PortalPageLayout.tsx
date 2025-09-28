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
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/40 to-white" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2 text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500/80">{subtitle}</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {description ? (
              <p className="text-base text-slate-600">{description}</p>
            ) : null}
          </div>
          {headerActions ? <div className="flex items-center gap-4">{headerActions}</div> : null}
        </header>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:w-80 xl:w-96">
            <div className="space-y-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)]">
              {filters}
            </div>
          </aside>
          <main className="flex-1 space-y-8 pb-20 text-slate-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
