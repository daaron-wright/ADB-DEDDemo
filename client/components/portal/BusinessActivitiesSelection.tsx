import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ActorOption {
  id: string;
  label: string;
  description?: string;
}

export interface BusinessActivity {
  id: string;
  label: string;
  description?: string;
  isRecommended?: boolean;
  actors?: string[];
}

interface BusinessActivitiesSelectionProps {
  journeyNumber: string;
  completedSteps: number;
  totalSteps: number;
  activities: BusinessActivity[];
  selectedActivityIds: string[];
  availableActivities: BusinessActivity[];
  actorOptions: ActorOption[];
  onActivityToggle: (activityId: string) => void;
  onAddActivity: (activityId: string) => void;
  className?: string;
}

export function BusinessActivitiesSelection({
  journeyNumber,
  completedSteps,
  totalSteps,
  activities,
  selectedActivityIds,
  availableActivities,
  actorOptions,
  onActivityToggle,
  onAddActivity,
  className,
}: BusinessActivitiesSelectionProps) {
  const [showCatalog, setShowCatalog] = useState(false);

  const renderActorBadges = (actorIds: string[] | undefined) => {
    if (!actorIds || actorIds.length === 0) {
      return null;
    }

    return (
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        {actorIds.map((actorId) => {
          const actor = actorOptions.find((item) => item.id === actorId);
          if (!actor) {
            return null;
          }

          return (
            <span
              key={actorId}
              className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/70"
            >
              {actor.label}
            </span>
          );
        })}
      </div>
    );
  };

  const handleAddActivity = (activityId: string) => {
    onAddActivity(activityId);
    setShowCatalog(false);
  };

  const hasAvailableActivities = availableActivities.length > 0;

  return (
    <div
      className={cn(
        "relative rounded-3xl bg-white/[0.14] backdrop-blur-md",
        "min-h-[1030px]",
        className,
      )}
      style={{ width: "633px" }}
    >
      <div className="relative p-8 text-white">
        {/* Journey Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-[0.058px] leading-[160%]">
              Journey Number: {journeyNumber}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-base font-normal text-[#54FFD4] leading-[160%] tracking-[0.051px]">
              {completedSteps} of {totalSteps} complete
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px w-full bg-white/[0.18]" />

        {/* Legal Structure Section */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold tracking-[0.058px] leading-[160%]">
            Legal Structure
          </h3>

          <div className="space-y-4">
            {/* Completed Item 1 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[31px] w-[31px] flex-shrink-0 items-center justify-center">
                <svg
                  width="31"
                  height="31"
                  viewBox="0 0 29 29"
                  fill="none"
                  className="h-[27px] w-[27px]"
                >
                  <path
                    d="M14.4998 0.936523C18.0968 0.936523 21.5472 2.36572 24.0906 4.90918C26.6339 7.45254 28.0622 10.9023 28.0623 14.499C28.0623 17.1813 27.2673 19.8039 25.7771 22.0342C24.2869 24.2645 22.1684 26.0028 19.6902 27.0293C17.2121 28.0558 14.4851 28.325 11.8543 27.8018C9.22351 27.2785 6.80667 25.9865 4.90995 24.0898C3.01325 22.1931 1.72137 19.7763 1.19804 17.1455C0.674753 14.5148 0.943146 11.7877 1.96952 9.30957C2.99598 6.83147 4.73446 4.71291 6.96464 3.22266C9.19492 1.73243 11.8175 0.936565 14.4998 0.936523ZM18.949 3.75977C16.8249 2.87992 14.4872 2.64914 12.2322 3.09766C9.97722 3.5462 7.90584 4.65355 6.28007 6.2793C4.65429 7.90508 3.54698 9.97643 3.09843 12.2314C2.64987 14.4865 2.87969 16.8241 3.75956 18.9482C4.63943 21.0724 6.13007 22.8877 8.04179 24.165C9.95343 25.4423 12.2007 26.124 14.4998 26.124C17.5829 26.124 20.5404 24.8998 22.7205 22.7197C24.9006 20.5396 26.1248 17.5821 26.1248 14.499C26.1247 12.2 25.4431 9.95262 24.1658 8.04102C22.8885 6.12943 21.073 4.63966 18.949 3.75977ZM21.281 11.0273L12.5623 19.7451L7.71854 14.9004L9.08768 13.5312L12.5623 17.0059L19.9109 9.65625L21.281 11.0273Z"
                    fill="#54FFD4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[136%]">
                  New Business - Limited Liability Company
                </span>
              </div>
            </div>

            {/* Completed Item 2 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[31px] w-[31px] flex-shrink-0 items-center justify-center">
                <svg
                  width="31"
                  height="31"
                  viewBox="0 0 29 29"
                  fill="none"
                  className="h-[27px] w-[27px]"
                >
                  <path
                    d="M14.4998 0.936523C18.0968 0.936523 21.5472 2.36572 24.0906 4.90918C26.6339 7.45254 28.0622 10.9023 28.0623 14.499C28.0623 17.1813 27.2673 19.8039 25.7771 22.0342C24.2869 24.2645 22.1684 26.0028 19.6902 27.0293C17.2121 28.0558 14.4851 28.325 11.8543 27.8018C9.22351 27.2785 6.80667 25.9865 4.90995 24.0898C3.01325 22.1931 1.72137 19.7763 1.19804 17.1455C0.674753 14.5148 0.943146 11.7877 1.96952 9.30957C2.99598 6.83147 4.73446 4.71291 6.96464 3.22266C9.19492 1.73243 11.8175 0.936565 14.4998 0.936523ZM18.949 3.75977C16.8249 2.87992 14.4872 2.64914 12.2322 3.09766C9.97722 3.5462 7.90584 4.65355 6.28007 6.2793C4.65429 7.90508 3.54698 9.97643 3.09843 12.2314C2.64987 14.4865 2.87969 16.8241 3.75956 18.9482C4.63943 21.0724 6.13007 22.8877 8.04179 24.165C9.95343 25.4423 12.2007 26.124 14.4998 26.124C17.5829 26.124 20.5404 24.8998 22.7205 22.7197C24.9006 20.5396 26.1248 17.5821 26.1248 14.499C26.1247 12.2 25.4431 9.95262 24.1658 8.04102C22.8885 6.12943 21.073 4.63966 18.949 3.75977ZM21.281 11.0273L12.5623 19.7451L7.71854 14.9004L9.08768 13.5312L12.5623 17.0059L19.9109 9.65625L21.281 11.0273Z"
                    fill="#54FFD4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[136%]">
                  Ownership - Single Owner
                </span>
              </div>
            </div>

            {/* In Progress Item */}
            <div className="flex items-center gap-10">
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="h-[28px] w-[28px]"
                >
                  <path
                    d="M14.0003 -0.000976562C17.7132 -0.000904838 21.2743 1.47421 23.8997 4.09961C26.5251 6.72502 28.0002 10.2861 28.0003 13.999C28.0003 17.7121 26.5252 21.2739 23.8997 23.8994C21.2743 26.5248 17.7131 27.999 14.0003 27.999V25.999C17.1828 25.999 20.2353 24.7347 22.4856 22.4844C24.7358 20.234 26.0003 17.1815 26.0003 13.999C26.0002 10.8168 24.7357 7.76495 22.4856 5.51465C20.2353 3.26428 17.1828 1.9991 14.0003 1.99902V-0.000976562ZM6.23953 23.1396C7.31689 24.0473 8.54651 24.7578 9.87039 25.2393L9.17996 27.1094C7.65385 26.5489 6.23876 25.7232 5.00027 24.6699L6.23953 23.1396ZM2.18973 16C2.42418 17.4036 2.8981 18.7566 3.59012 20L1.85965 21C1.04008 19.579 0.474926 18.0256 0.189728 16.4102L2.18973 16ZM3.59012 8C2.90902 9.22052 2.44529 10.5503 2.22 11.9297L0.220001 11.5898C0.501306 9.97773 1.05567 8.42536 1.85965 7L3.59012 8ZM9.81961 2.76074C8.51355 3.24749 7.3017 3.95784 6.23953 4.86035L5.00027 3.33008C6.22376 2.28182 7.62163 1.45639 9.13016 0.890625L9.81961 2.76074Z"
                    fill="#54FFD4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[136%]">
                  Nationality - UAE National
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px w-full bg-white/[0.18]" />

        {/* Business Activities Section */}
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold tracking-[0.058px] leading-[160%]">
            Business Activities
          </h3>
          <p className="mb-6 text-sm font-normal leading-[160%] tracking-[0.045px]">
            Choose from the below AI recommended activities
          </p>

          <div className="space-y-4">
            {activities.map((activity) => {
              const isSelected = selectedActivityIds.includes(activity.id);

              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => onActivityToggle(activity.id)}
                  className={cn(
                    "flex w-full items-center gap-10 text-left transition-colors",
                    "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                    "rounded-lg px-0 py-1",
                  )}
                >
                  <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                    {isSelected ? (
                      <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border-2 border-white">
                        <div className="h-4 w-4 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="h-[32px] w-[32px] rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                      {activity.label}
                    </div>
                    {renderActorBadges(activity.actors)}
                  </div>
                </button>
              );
            })}

            {/* Add Activity Button */}
            <button
              type="button"
              onClick={() => setShowCatalog((prev) => !prev)}
              className={cn(
                "flex w-full items-center gap-10 text-left transition-colors",
                "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                "rounded-lg px-0 py-1",
              )}
            >
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 28 28"
                  fill="none"
                  className="h-[28px] w-[28px]"
                >
                  <path
                    d="M14 -0.000976562C21.6999 -0.000975067 27.9998 6.29922 28 13.999C28 21.699 21.7 27.999 14 27.999C6.3 27.999 0 21.699 0 13.999C0.000232596 6.29922 6.30014 -0.000976562 14 -0.000976562ZM14 1.99902C7.40014 1.99902 2.00023 7.39922 2 13.999C2 20.599 7.4 25.999 14 25.999C20.6 25.999 26 20.599 26 13.999C25.9998 7.39922 20.5999 1.99902 14 1.99902ZM15 6V13H22V15H15V22H13V15H6V13H13V6H15Z"
                    fill="white"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <span className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                  Add a new activity
                </span>
              </div>
            </button>

            {/* Catalog Section */}
            {showCatalog && hasAvailableActivities ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-white/20 bg-white/5 p-4">
                <h4 className="text-sm font-semibold text-white">
                  Available Activities
                </h4>
                {availableActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 p-3"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-white">
                        {activity.label}
                      </div>
                      {activity.description ? (
                        <p className="text-xs text-white/70">
                          {activity.description}
                        </p>
                      ) : null}
                      {renderActorBadges(activity.actors)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddActivity(activity.id)}
                      className="rounded-full bg-[#54FFD4] px-4 py-2 text-sm font-semibold text-[#0B0C28] transition hover:bg-[#45ddb6]"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Divider */}
        <div className="mb-8 h-px w-full bg-white/[0.18]" />

        {/* Physical Space Requirements Section */}
        <div>
          <h3 className="mb-2 text-lg font-semibold tracking-[0.058px] leading-[160%]">
            Physical Space Requirements
          </h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <div className="h-[32px] w-[32px] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                  Step 1: Business Registration
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <div className="h-[32px] w-[32px] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                  Step 2: Submission of Documents
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <div className="h-[32px] w-[32px] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                  Step 3: Business Licensing
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-10">
              <div className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center">
                <div className="h-[32px] w-[32px] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-normal leading-[160%] tracking-[0.058px] text-white">
                  Step 4: Pre-Operational Inspection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
