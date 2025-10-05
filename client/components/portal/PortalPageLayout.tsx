import type { ReactNode } from "react";

interface PortalBranding {
  href?: string;
  logoSrc: string;
  logoAlt: string;
  label?: string;
}

interface PortalPageLayoutProps {
  title: string;
  subtitle: string;
  description?: string;
  filters: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  fullWidthSection?: ReactNode;
  brand?: PortalBranding;
}

export function PortalPageLayout({
  title,
  subtitle,
  description,
  filters,
  headerActions,
  children,
  fullWidthSection,
  brand,
}: PortalPageLayoutProps) {
  const defaultBrand = {
    href: "https://www.tamm.abudhabi/",
    logoSrc:
      "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F397f9a8d2a3c4c8cb1d79ae828b476be",
    logoAlt: "TAMM logo",
    label: "Abu Dhabi Government Services",
  } as const satisfies PortalBranding;

  const brandConfig: PortalBranding = {
    ...defaultBrand,
    ...brand,
    href: brand?.href ?? defaultBrand.href,
    logoSrc: brand?.logoSrc ?? defaultBrand.logoSrc,
    logoAlt: brand?.logoAlt ?? defaultBrand.logoAlt,
    label: brand?.label ?? defaultBrand.label,
  };

  return (
    <div className="relative min-h-screen bg-[#f5f8f6]">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-14 lg:px-12 xl:px-16">
        <header className="rounded-3xl border border-[#d8e4df] bg-white/95 px-8 py-10 shadow-[0_16px_40px_-32px_rgba(11,64,55,0.28)] backdrop-blur-sm lg:px-12 xl:px-14">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <a
                href={brandConfig.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3"
              >
                <img
                  src={brandConfig.logoSrc}
                  alt={brandConfig.logoAlt}
                  className="h-10 w-auto"
                />
                {brandConfig.label ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                    {brandConfig.label}
                  </span>
                ) : null}
              </a>
              {headerActions ? (
                <div className="flex items-center gap-4">{headerActions}</div>
              ) : null}
            </div>

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
            </div>
          </div>
        </header>

        <div className="mt-12 space-y-12">
          {fullWidthSection ?? null}

          <div className="grid gap-12 lg:grid-cols-[340px,minmax(0,1fr)] xl:grid-cols-[360px,minmax(0,1fr)] 2xl:grid-cols-[400px,minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-32">
              <div className="space-y-8 rounded-3xl border border-[#d8e4df] bg-white px-7 py-8 shadow-[0_12px_32px_-28px_rgba(11,64,55,0.18)] lg:max-h-[calc(100vh_-_10rem)] lg:overflow-y-auto">
                {filters}
              </div>
            </aside>
            <main className="flex-1 space-y-10 text-slate-900 lg:space-y-12">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
