import * as React from "react";

import { Button } from "@/components/ui/button";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, FileEdit } from "lucide-react";

interface ComplianceGrowthFocusContentProps {
  journeyNumber?: string;
  completionStatus?: string;
  progressPercent?: number;
}

type ComplianceStatus = "error" | "warning" | "success" | "info";

interface ComplianceItem {
  id: string;
  label: string;
  status: ComplianceStatus;
  detail: string;
}

const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "civil-defence",
    label: "Civil Defence",
    status: "error",
    detail: "2 issues to resolve",
  },
  {
    id: "ded-inspection",
    label: "DED inspection",
    status: "warning",
    detail: "29 days remaining",
  },
  {
    id: "food-safety",
    label: "Food & Safety inspection",
    status: "success",
    detail: "Pass",
  },
  {
    id: "employment-visas",
    label: "6 Employment Visas",
    status: "success",
    detail: "Renewed",
  },
  {
    id: "tawtheeq",
    label: "Tawtheeq",
    status: "info",
    detail: "Expires in 320 days",
  },
];

const STATUS_ICONS: Record<ComplianceStatus, React.ElementType> = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: FileEdit,
};

const STATUS_STYLES: Record<ComplianceStatus, { iconClass: string; textClass: string }> = {
  error: {
    iconClass: "text-red-500",
    textClass: "text-white",
  },
  warning: {
    iconClass: "text-yellow-400",
    textClass: "text-white",
  },
  success: {
    iconClass: "text-[#54FFD4]",
    textClass: "text-white",
  },
  info: {
    iconClass: "text-white",
    textClass: "text-white",
  },
};

type ToggleView = "compliance" | "growth";

export function ComplianceGrowthFocusContent({
  journeyNumber = "0987654321",
  completionStatus = "78% complete",
  progressPercent = 78,
}: ComplianceGrowthFocusContentProps) {
  const [activeView, setActiveView] = React.useState<ToggleView>("compliance");
  const [showAlert, setShowAlert] = React.useState(true);

  const thingsToDo = 22;
  const complete = 78;

  const urgentItems = COMPLIANCE_ITEMS.filter(item => item.status === "error" || item.status === "warning");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          onClick={() => setActiveView("compliance")}
          className={cn(
            "flex-1 rounded-2xl px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-all",
            activeView === "compliance"
              ? "bg-[#169F9F] text-white shadow-md"
              : "bg-white/20 text-white/70 hover:bg-white/30"
          )}
        >
          Compliance
        </Button>
        <Button
          onClick={() => setActiveView("growth")}
          className={cn(
            "flex-1 rounded-2xl px-6 py-3 text-sm font-semibold uppercase tracking-wide transition-all",
            activeView === "growth"
              ? "bg-[#169F9F] text-white shadow-md"
              : "bg-white/20 text-white/70 hover:bg-white/30"
          )}
        >
          Growth
        </Button>
      </div>

      {activeView === "compliance" && (
        <div className="space-y-5">
          {showAlert && urgentItems.length > 0 && (
            <div
              className={chatCardClass(
                "relative overflow-hidden rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-600/90 to-red-700/90 p-6 backdrop-blur-lg",
              )}
            >
              <button
                onClick={() => setShowAlert(false)}
                className="absolute right-4 top-4 text-white/60 hover:text-white"
                aria-label="Dismiss alert"
              >
                ✕
              </button>

              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/30">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-base font-medium text-white">
                      {urgentItems[0].label}
                    </h3>
                    <p className="mt-1 text-sm text-white/90">
                      {urgentItems[0].detail}
                    </p>
                  </div>
                  <Button
                    className="rounded-full border-2 border-white bg-transparent px-6 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Follow up
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div
            className={chatCardClass(
              "overflow-hidden rounded-3xl border border-white/25 bg-white/14 p-6 backdrop-blur-xl",
            )}
          >
            <div className="space-y-6">
              <h3 className="text-sm font-medium uppercase tracking-widest text-white">
                Compliance Status
              </h3>

              <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-white/30" />
                    <div>
                      <div className="text-lg font-medium text-white">{thingsToDo}%</div>
                      <div className="text-xs text-white/70">Things to do</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-[#54FFD4]" />
                    <div>
                      <div className="text-lg font-medium text-white">{complete}%</div>
                      <div className="text-xs text-white/70">Complete</div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90 transform">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#54FFD4"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(complete / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-1 border-t border-white/20 pt-6">
                {COMPLIANCE_ITEMS.map((item) => {
                  const Icon = STATUS_ICONS[item.status];
                  const styles = STATUS_STYLES[item.status];

                  return (
                    <div key={item.id} className="flex items-start gap-3 py-2">
                      <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", styles.iconClass)} />
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-xs font-normal leading-relaxed", styles.textClass)}>
                          {item.label}
                        </div>
                        <div className={cn("text-xs leading-snug", styles.textClass, "opacity-90")}>
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Button
                  className="rounded-full bg-[#169F9F] px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#128080]"
                >
                  Follow up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === "growth" && (
        <div
          className={chatCardClass(
            "rounded-3xl border border-white/25 bg-white/14 p-8 backdrop-blur-xl",
          )}
        >
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#169F9F]/20">
              <svg
                className="h-8 w-8 text-[#54FFD4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Growth Opportunities</h3>
              <p className="mt-2 text-sm text-white/70">
                Explore expansion options, new licenses, and business development resources
                to scale your operations.
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left">
                <h4 className="text-sm font-medium text-white">Additional Licenses</h4>
                <p className="mt-1 text-xs text-white/70">
                  Expand your business activities with complementary licenses
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left">
                <h4 className="text-sm font-medium text-white">New Locations</h4>
                <p className="mt-1 text-xs text-white/70">
                  Open additional branches across Abu Dhabi
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left">
                <h4 className="text-sm font-medium text-white">Business Support</h4>
                <p className="mt-1 text-xs text-white/70">
                  Access funding, mentorship, and growth programs
                </p>
              </div>
            </div>
            <Button
              className="rounded-full bg-[#169F9F] px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#128080]"
            >
              Explore Growth Options
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
