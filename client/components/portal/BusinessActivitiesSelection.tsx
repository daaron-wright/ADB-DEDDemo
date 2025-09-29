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
      <div className="flex flex-wrap gap-2 text-xs">
        {actorIds.map((actorId) => {
          const actor = actorOptions.find((item) => item.id === actorId);
          if (!actor) {
            return null;
          }

          return (
            <span
              key={actorId}
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
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
        "relative overflow-hidden rounded-3xl border border-white/20 bg-white/[0.14] backdrop-blur-xl",
        className,
      )}
    >
      <div className="p-8 text-white">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-lg font-semibold text-white">
              Journey Number: {journeyNumber}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-base font-normal text-[#54FFD4]">
              {completedSteps} of {totalSteps} complete
            </span>
          </div>
        </div>

        <div className="mb-8 h-px w-full bg-white/[0.18]" />

        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white">
            2. Business Activities
          </h4>
          <p className="mb-6 text-sm font-normal text-white/90">
            Choose from the recommended activities below. Reviewers are assigned
            automatically for each selection.
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
                    "flex w-full items-start gap-6 rounded-2xl p-3 text-left transition-colors",
                    "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  )}
                >
                  <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center">
                    {isSelected ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#54FFD4]">
                        <div className="h-4 w-4 rounded-full bg-black" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-normal text-white">
                        {activity.label}
                      </span>
                      {activity.isRecommended ? (
                        <span className="inline-flex items-center rounded-full border border-[#54FFD4]/40 bg-[#54FFD4]/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#54FFD4]">
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    {renderActorBadges(activity.actors)}
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Need to add another activity?
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    Select from the catalog below. Reviewers will be assigned
                    based on the activity type.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCatalog((prev) => !prev)}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  {showCatalog ? "Hide catalog" : "Browse catalog"}
                </button>
              </div>

              {showCatalog ? (
                <div className="mt-4 space-y-3">
                  {hasAvailableActivities ? (
                    availableActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="rounded-2xl border border-white/15 bg-white/10 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-white">
                                {activity.label}
                              </span>
                              {activity.isRecommended ? (
                                <span className="inline-flex items-center rounded-full border border-[#54FFD4]/40 bg-[#54FFD4]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#54FFD4]">
                                  Recommended
                                </span>
                              ) : null}
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
                            className="inline-flex items-center justify-center rounded-full bg-[#54FFD4] px-4 py-2 text-sm font-semibold text-[#0B0C28] transition hover:bg-[#45ddb6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#54FFD4]/50"
                          >
                            Add activity
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/70">
                      All predefined activities have already been added to this
                      journey.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mb-8 h-px w-full bg-white/[0.18]" />

        <div>
          <h4 className="mb-2 text-lg font-semibold text-white">
            3. Physical Space Requirements
          </h4>
          <p className="text-sm font-normal text-white/90">
            Physical space requirements will be generated once the above steps
            are complete.
          </p>
        </div>
      </div>
    </div>
  );
}
