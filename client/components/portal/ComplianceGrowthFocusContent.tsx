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
        <div className="space-y-5">
          <div
            className={chatCardClass(
              "overflow-hidden rounded-3xl border border-white/20 bg-white/12 p-6 text-left backdrop-blur-xl shadow-[0_30px_80px_-65px_rgba(15,23,42,0.4)]",
            )}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  Growth Status
                </h3>
                <span className="rounded-full border border-white/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  Live feed
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-1.5 rounded-full bg-gradient-to-b from-[#f9c27e] to-[#f58b2e]" />
                    <div>
                      <div className="text-[22px] font-semibold leading-6 text-white">9</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-white/70">
                        New growth steps
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-1.5 rounded-full bg-white/50" />
                    <div>
                      <div className="text-[22px] font-semibold leading-6 text-white">3</div>
                      <div className="text-xs uppercase tracking-[0.16em] text-white/70">
                        Actions to take
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg className="h-24 w-24 -rotate-90 transform">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255, 255, 255, 0.24)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#fab66c"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(75 / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-3 border-t border-white/15 pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <svg width="15" height="19" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.75 0.375C11.1147 0.375 11.4648 0.519481 11.7227 0.777344C11.9805 1.03521 12.125 1.38533 12.125 1.75V2.4375H14.1875C14.5522 2.4375 14.9023 2.58198 15.1602 2.83984C15.418 3.09771 15.5625 3.44783 15.5625 3.8125V18.25C15.5625 18.6147 15.418 18.9648 15.1602 19.2227C14.9023 19.4805 14.5522 19.625 14.1875 19.625H1.8125C1.44783 19.625 1.09771 19.4805 0.839844 19.2227C0.581981 18.9648 0.4375 18.6147 0.4375 18.25V3.8125C0.4375 3.44783 0.581981 3.09771 0.839844 2.83984C1.09771 2.58198 1.44783 2.4375 1.8125 2.4375H3.875V1.75C3.875 1.38533 4.01948 1.03521 4.27734 0.777344C4.53521 0.519481 4.88533 0.375 5.25 0.375H10.75ZM1.8125 3.8125V18.25H14.1875V3.8125H12.125V5.875H3.875V3.8125H1.8125ZM5.25 15.5H3.875V8.625H5.25V15.5ZM8.6875 15.5H7.3125V12.75H8.6875V15.5ZM12.125 15.5H10.75V11.375H12.125V15.5ZM5.25 1.75V4.5H10.75V1.75H5.25Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-sm text-white">5 new economic trends</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.25 16.5034V15.1284C19.2469 13.0609 18.4682 11.0698 17.0679 9.5487C15.6677 8.02758 13.7477 7.08714 11.6875 6.91327V5.50342H13.75V4.12842H8.25V5.50342H10.3125V6.91327C8.25232 7.08714 6.33233 8.02758 4.93206 9.5487C3.53178 11.0698 2.75313 13.0609 2.75 15.1284V16.5034H1.375V17.8784H20.625V16.5034H19.25ZM11 8.25342C12.5841 8.2555 14.1191 8.80368 15.3462 9.80555C16.5733 10.8074 17.4175 12.2017 17.7364 13.7534H4.26353C4.58245 12.2017 5.42661 10.8074 6.65372 9.8055C7.88083 8.80362 9.41584 8.25546 11 8.25342ZM4.125 15.1284H17.875V16.5034H4.125V15.1284Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-sm text-white">3 relevant services</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.875 20.625C7.63439 20.625 8.25 20.0094 8.25 19.25C8.25 18.4906 7.63439 17.875 6.875 17.875C6.11561 17.875 5.5 18.4906 5.5 19.25C5.5 20.0094 6.11561 20.625 6.875 20.625Z" fill="white"/>
                      <path d="M16.5 20.625C17.2594 20.625 17.875 20.0094 17.875 19.25C17.875 18.4906 17.2594 17.875 16.5 17.875C15.7406 17.875 15.125 18.4906 15.125 19.25C15.125 20.0094 15.7406 20.625 16.5 20.625Z" fill="white"/>
                      <path d="M19.25 4.81264H4.00125L3.4375 1.92514C3.40536 1.76751 3.31896 1.62615 3.19334 1.52565C3.06772 1.42516 2.91084 1.3719 2.75 1.37514H0V2.75014H2.18625L4.8125 15.9501C4.84464 16.1078 4.93104 16.2491 5.05666 16.3496C5.18228 16.4501 5.33916 16.5034 5.5 16.5001H17.875V15.1251H6.06375L5.5 12.3751H17.875C18.0339 12.379 18.1893 12.3277 18.3146 12.2299C18.44 12.1322 18.5276 11.994 18.5625 11.8389L19.9375 5.65139C19.9605 5.54938 19.96 5.44346 19.9359 5.34169C19.9119 5.23992 19.8649 5.14499 19.7986 5.06411C19.7323 4.98323 19.6484 4.91854 19.5534 4.87496C19.4583 4.83139 19.3545 4.81007 19.25 4.81264ZM17.325 11.0001H5.23875L4.27625 6.18764H18.3906L17.325 11.0001Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="text-sm text-white">17 new suppliers in marketplace</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.94151 10.175L10.2947 2.75C10.9617 2.75 11.6014 3.01076 12.073 3.47491C12.5447 3.93906 12.8096 4.56858 12.8096 5.22498V8.52496H17.5544C17.7974 8.52225 18.0382 8.57158 18.2599 8.66952C18.4816 8.76746 18.6791 8.91167 18.8386 9.09216C18.9981 9.27265 19.1158 9.48511 19.1835 9.71481C19.2513 9.94452 19.2675 10.186 19.231 10.4225L18.0742 17.8474C18.0135 18.2408 17.8105 18.5995 17.5024 18.8572C17.1943 19.1149 16.8019 19.2544 16.3976 19.2499H6.94151M6.94151 10.175V19.2499M6.94151 10.175H4.4266C3.98194 10.175 3.55549 10.3488 3.24107 10.6582C2.92664 10.9677 2.75 11.3873 2.75 11.8249V17.5999C2.75 18.0375 2.92664 18.4572 3.24107 18.7666C3.55549 19.0761 3.98194 19.2499 4.4266 19.2499H6.94151" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-sm text-white">1 social media report</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Button
                  className="rounded-full bg-[#169F9F] px-8 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-24px_rgba(23,135,126,0.45)] transition hover:bg-[#128080]"
                >
                  Follow up
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div
              className={chatCardClass(
                "overflow-hidden rounded-3xl border border-white/20 bg-white/12 p-6 backdrop-blur-xl",
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-medium text-white">Visitors to Abu Dhabi</h3>
                  <div className="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16L18 10L6 10L12 16Z" fill="#14E544"/>
                    </svg>
                    <span className="text-xl font-semibold text-[#14E544]">12%</span>
                  </div>
                </div>

                <div className="text-4xl font-semibold text-white">5,932,234</div>

                <div className="space-y-3 pt-2">
                  <div className="text-sm text-gray-400">Nationalities</div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <svg width="27" height="20" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M0 0H26.6667V6.66667H0V0Z" fill="#FF9933"/>
                          <path d="M0 6.6665H26.6667V13.3332H0V6.6665Z" fill="white"/>
                          <path d="M0 13.3335H26.6667V20.0002H0V13.3335Z" fill="#128807"/>
                          <circle cx="13.3333" cy="10" r="2.66667" fill="#000088"/>
                        </svg>
                        <span className="text-sm text-white">India</span>
                      </div>
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
                          <div className="absolute h-full w-[83%] rounded-full bg-[#FFE100]" />
                        </div>
                        <span className="text-sm font-semibold text-white">1,651,000</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <svg width="27" height="20" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="26.6667" height="20" fill="#000066"/>
                          <path d="M0 0H13.3333V10H0V0Z" fill="#000066"/>
                          <path d="M1.5625 0L6.64583 3.77083L11.7083 0H13.3333V1.29167L8.33333 5.02083L13.3333 8.72917V10H11.6667L6.66667 6.27083L1.6875 10H0V8.75L4.97917 5.04167L0 1.33333V0H1.5625Z" fill="white"/>
                          <path d="M8.83333 5.85417L13.3333 9.16667V10L7.6875 5.85417H8.83333Z" fill="#C8102E"/>
                        </svg>
                        <span className="text-sm text-white">Australia</span>
                      </div>
                      <div className="flex flex-1 items-center gap-3">
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
                          <div className="absolute h-full w-[70%] rounded-full bg-[#36367B]" />
                        </div>
                        <span className="text-sm font-semibold text-white">1,221,498</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={chatCardClass(
                "overflow-hidden rounded-3xl border border-white/25 bg-white/14 p-5 backdrop-blur-xl",
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#73CED0]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.2401 14.2964H2.84277V12.9967C2.84277 12.135 3.18509 11.3085 3.79443 10.6992C4.40377 10.0899 5.2302 9.74755 6.09193 9.74755H9.99092C10.8527 9.74755 11.6791 10.0899 12.2884 10.6992C12.8978 11.3085 13.2401 12.135 13.2401 12.9967V14.2964ZM8.04143 8.44788C6.97336 8.44788 6.04143 7.51595 6.04143 6.44788C6.04143 5.37981 6.97336 4.44788 8.04143 4.44788C9.1095 4.44788 10.0414 5.37981 10.0414 6.44788C10.0414 7.51595 9.1095 8.44788 8.04143 8.44788Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white">Social Media Engagement</div>
                    <div className="mt-1">
                      <span className="text-base font-semibold text-white">14,445</span>
                      <span className="ml-1 text-xs text-white">new followers</span>
                    </div>
                  </div>
                </div>

                <div className="relative h-20">
                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 226 77" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M33.06 46.849C17.5778 50 0 56 0 56V77H226V1.5C202.93 12.5777 201.578 18.8492 172.639 20C152.263 20.8103 140.622 21.5 121.161 25C99.2055 28.9486 89.1444 35 68.4278 40.5C48.2469 45.8577 53.9241 42.6026 33.06 46.849Z" fill="url(#paint0_linear_growth)"/>
                    <path d="M1.07031 55C1.07031 55 19.7211 49.2895 33.7386 46.6824C50.8499 43.5 60.7437 44.1995 79.7277 37C102.955 28.1911 99.8166 29 119.905 25C138.911 21.2158 153.76 20.8056 173.894 20C202.491 18.8558 201.948 12.514 224.744 1.5" stroke="#73CED0" strokeWidth="1.3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="paint0_linear_growth" x1="113.535" y1="-11.6868" x2="113.32" y2="77.0007" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4BA2A4"/>
                        <stop offset="1" stopColor="#041616" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute right-[30%] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white ring-4 ring-[#73CED0]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
