import * as React from "react";
import { X, ArrowLeft, AlertCircle, CheckCircle, AlertTriangle, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComplianceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const COMPLIANCE_STATUS_ICONS: Record<
  ComplianceStatus,
  { Icon: React.ElementType; iconClass: string }
> = {
  error: {
    Icon: AlertCircle,
    iconClass: "text-[#FF5F5F]",
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: "text-[#FFE100]",
  },
  success: {
    Icon: CheckCircle,
    iconClass: "text-[#54FFD4]",
  },
  info: {
    Icon: FileEdit,
    iconClass: "text-white",
  },
};

export function ComplianceDetailModal({
  isOpen,
  onClose,
}: ComplianceDetailModalProps) {
  if (!isOpen) return null;

  const thingsToDo = 22;
  const complete = 78;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-6xl rounded-3xl bg-white/10 backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[340px_1fr]">
          {/* Left Panel - Compliance Status */}
          <div className="space-y-6 border-r border-white/10 p-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>

              <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-white">
                Compliance Status
              </h2>
            </div>

            {/* Progress Stats */}
            <div className="relative flex items-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center">
                {/* Background circle */}
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 62 62">
                  <circle
                    cx="31"
                    cy="31"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="31"
                    cy="31"
                    r="28"
                    fill="none"
                    stroke="#54FFD4"
                    strokeWidth="3"
                    strokeDasharray={`${(complete / 100) * 176} 176`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-medium text-white">{thingsToDo}%</span>
                  </div>
                  <p className="text-xs text-white/70">Things to do</p>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-medium text-white">{complete}%</span>
                  </div>
                  <p className="text-xs text-white/70">Complete</p>
                </div>
              </div>
            </div>

            {/* Compliance Items */}
            <div className="space-y-4">
              {COMPLIANCE_ITEMS.map((item) => {
                const { Icon, iconClass } = COMPLIANCE_STATUS_ICONS[item.status];

                return (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex h-5 w-5 items-center justify-center">
                        <Icon className={cn("h-5 w-5", iconClass)} />
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs leading-relaxed text-white">
                          {item.label}
                        </p>
                        <p className="text-xs text-white/70">{item.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10" />

            {/* Action Button */}
            <Button
              onClick={onClose}
              className="w-full rounded-full bg-[#169F9F] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#128080]"
            >
              Follow up
            </Button>
          </div>

          {/* Right Panel - Images */}
          <div className="space-y-6 p-6">
            {/* Kitchen Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-white">
                Kitchen
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fb8e81338fc04dbb1961cecf6a6b349e10dd288d5?format=webp&width=412"
                    alt="Kitchen inspection area"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F35354ebad5489f0ffae354b2521357c0e9b5d5fa?format=webp&width=458"
                    alt="Kitchen preparation area"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Fire Exits Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-white">
                Fire Exits
              </h3>
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F37e3d308bae6fa63163fe9e0bbe47135f19cab55?format=webp&width=412"
                  alt="Fire exit"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
