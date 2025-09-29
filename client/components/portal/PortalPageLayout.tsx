import type { ReactNode } from "react";

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
    <div className="relative min-h-screen bg-[#f5f8f6]">
      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12 lg:px-12">
        <header className="rounded-3xl border border-[#d8e4df] bg-white/95 px-8 py-10 shadow-[0_16px_40px_-32px_rgba(11,64,55,0.28)] backdrop-blur-sm lg:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3 text-slate-900">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                {subtitle}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              {description ? (
                <p className="text-base leading-relaxed text-slate-600">
                  {description}
                </p>
              ) : null}
            </div>
            {headerActions ? (
              <div className="flex items-center gap-4">{headerActions}</div>
            ) : null}
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[320px,1fr] xl:grid-cols-[360px,1fr]">
          <aside className="lg:sticky lg:top-32">
            <div className="space-y-8 rounded-3xl border border-[#d8e4df] bg-white px-6 py-8 shadow-[0_12px_32px_-28px_rgba(11,64,55,0.18)] lg:max-h-[calc(100vh_-_10rem)] lg:overflow-y-auto">
              {filters}
            </div>
          </aside>
          <main className="flex-1 space-y-8 text-slate-900">{children}</main>
        </div>
      </div>
    </div>
  );
}
