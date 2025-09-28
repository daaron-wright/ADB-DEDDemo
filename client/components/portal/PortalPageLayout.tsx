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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-[#f3ecff] to-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-purple-100/50 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-96 w-96 rounded-full bg-white/60 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-purple-500/70">{subtitle}</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
            {description ? (
              <p className="text-base text-slate-600">{description}</p>
            ) : null}
          </div>
          {headerActions ? <div className="flex items-center gap-3">{headerActions}</div> : null}
        </header>

        <div className="mt-12 flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="lg:w-80 xl:w-96">
            <div className="space-y-8 rounded-3xl border border-white/40 bg-white/90 p-6 shadow-[0_24px_55px_-34px_rgba(24,32,63,0.55)] backdrop-blur-xl lg:sticky lg:top-24">
              {filters}
            </div>
          </aside>
          <main className="flex-1 space-y-8 pb-20">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
