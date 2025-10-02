import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChatActivityOption {
  id: string;
  label: string;
  description?: string;
  group: string;
  isRecommended?: boolean;
  spatial: {
    minArea: number;
    seatingCapacity: number;
    kitchenArea: number;
    ventilation: string;
    utilities: string[];
    notes: string[];
  };
}

export interface PhysicalSpaceActivityDetail {
  id: string;
  label: string;
  minArea: number;
  seatingCapacity: number;
  kitchenArea: number;
  ventilation: string;
  notes: string[];
}

export interface PhysicalSpacePlan {
  summary: {
    totalArea: number;
    seatingCapacity: number;
    kitchenArea: number;
    complianceNotes: string[];
    timelineWeeks: number;
    utilities: string[];
  };
  activities: PhysicalSpaceActivityDetail[];
}

interface BusinessActivitiesChatCardProps {
  activities: ChatActivityOption[];
  selectedActivityIds: string[];
  onToggleActivity: (activityId: string) => void;
  onAddActivity: (name: string, description?: string) => void;
  maxSelection: number;
  physicalPlan: PhysicalSpacePlan | null;
  className?: string;
}

export function BusinessActivitiesChatCard({
  activities,
  selectedActivityIds,
  onToggleActivity,
  onAddActivity,
  maxSelection,
  physicalPlan,
  className,
}: BusinessActivitiesChatCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const selectionLimitReached = selectedActivityIds.length >= maxSelection;

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      if (a.isRecommended === b.isRecommended) {
        return a.label.localeCompare(b.label);
      }
      return a.isRecommended ? -1 : 1;
    });
  }, [activities]);

  const handleToggle = (activityId: string, isSelected: boolean) => {
    if (!isSelected && selectionLimitReached) {
      return;
    }
    onToggleActivity(activityId);
  };

  const handleAddActivity = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Enter an activity name to add it to the license.");
      return;
    }
    setError("");
    onAddActivity(trimmedName, description.trim() || undefined);
    setName("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <div
      className={cn(
        "w-full max-w-[540px] space-y-8 rounded-3xl border border-white/35 bg-white/75 p-6 text-slate-900 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.42)] backdrop-blur-[18px]",
        className,
      )}
    >
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
          <span>License build</span>
          <span className="h-1 w-1 rounded-full bg-[#0E766E]/60" aria-hidden="true" />
          <span>Step 2 · Activities</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold leading-tight">Business Activities</h3>
          <p className="text-sm text-slate-600">
            Choose from the below AI recommended activities. Activities must fall within the same business group for a restaurant license.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-[#0E766E]/10 px-3 py-1 font-semibold text-[#0E766E]">
            {selectedActivityIds.length} of {maxSelection} selected
          </span>
          {selectionLimitReached && (
            <span className="text-[#9a3412]">
              Maximum activities reached for a single license (10).
            </span>
          )}
        </div>
      </header>

      <section className="space-y-4">
        <ul className="space-y-3">
          {sortedActivities.map((activity) => {
            const isSelected = selectedActivityIds.includes(activity.id);
            const isDisabled = !isSelected && selectionLimitReached;

            return (
              <li key={activity.id}>
                <button
                  type="button"
                  onClick={() => handleToggle(activity.id, isSelected)}
                  disabled={isDisabled}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left transition",
                    isSelected
                      ? "border-[#0E766E] bg-[#0E766E]/12 text-[#0A4A46] shadow-[0_16px_36px_-28px_rgba(14,118,110,0.45)]"
                      : "border-[#dbe9e3] bg-white/90 text-slate-700 hover:border-[#0E766E]/50 hover:bg-white",
                    isDisabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2",
                      isSelected ? "border-[#0E766E] bg-[#0E766E] text-white" : "border-[#cbdad5] text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M13 4L6.5 10.5L3 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold leading-tight text-slate-900">
                        {activity.label}
                      </p>
                      {activity.isRecommended && (
                        <span className="rounded-full bg-[#0E766E]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                          Recommended
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-2xl border border-dashed border-[#0E766E]/40 bg-[#0E766E]/5 p-4">
          {!isAdding ? (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setError("");
              }}
              disabled={selectionLimitReached}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-[#0E766E]/50 bg-white px-4 py-2 text-sm font-semibold text-[#0E766E] shadow-sm transition",
                selectionLimitReached && "cursor-not-allowed opacity-60",
              )}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M8 3.33337V12.6667M3.33337 8H12.6667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Add a new activity
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Activity name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-10 rounded-xl border border-[#cbdad5] bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-[#0E766E] focus:outline-none focus:ring-2 focus:ring-[#0E766E]/25"
                    placeholder="e.g. Dessert tasting bar"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Optional context
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="h-10 rounded-xl border border-[#cbdad5] bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-[#0E766E] focus:outline-none focus:ring-2 focus:ring-[#0E766E]/25"
                    placeholder="Describe the service"
                  />
                </label>
              </div>
              {error && <p className="text-sm text-[#b91c1c]">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddActivity}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0E766E] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(14,118,110,0.45)] transition hover:bg-[#0a5a55]"
                >
                  Add activity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setName("");
                    setDescription("");
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#0E766E]/40 hover:text-[#0E766E]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-slate-900">Physical Space Requirements</h4>
          {physicalPlan ? (
            <p className="text-sm text-slate-600">
              Generated to cover the combined footprint, back-of-house provisions, and compliance for the selected activities.
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Physical space requirements will be generated once the above steps are complete.
            </p>
          )}
        </div>

        {physicalPlan && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard title="Estimated total area" value={`${physicalPlan.summary.totalArea.toLocaleString()} sq ft`} />
              <MetricCard title="Kitchen allocation" value={`${physicalPlan.summary.kitchenArea.toLocaleString()} sq ft`} />
              <MetricCard title="Seat capacity" value={`${physicalPlan.summary.seatingCapacity} guests`} />
            </div>

            <div className="rounded-2xl border border-[#dbe9e3] bg-white/85 p-4 shadow-[0_22px_54px_-46px_rgba(15,23,42,0.45)]">
              <div className="grid gap-4 md:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
                <div className="space-y-3 text-sm text-slate-700">
                  <h5 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                    Compliance checkpoints
                  </h5>
                  <ul className="space-y-2">
                    {physicalPlan.summary.complianceNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0E766E]" aria-hidden="true" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#e4eeeb] bg-[#f6faf8] p-4 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-800">Fit-out timeline:</span> {physicalPlan.summary.timelineWeeks} weeks with staged inspections.
                  </p>
                  <p className="mt-3">
                    <span className="font-semibold text-slate-800">Utilities:</span> {physicalPlan.summary.utilities.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                Activity-specific fit out
              </h5>
              <div className="grid gap-3 md:grid-cols-2">
                {physicalPlan.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-2xl border border-[#dbe9e3] bg-white/90 p-4 text-sm text-slate-600 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.45)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h6 className="text-sm font-semibold text-slate-900">{activity.label}</h6>
                      <span className="rounded-full bg-[#0E766E]/12 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                        {activity.minArea} sq ft
                      </span>
                    </div>
                    <dl className="mt-3 space-y-1 text-xs text-slate-500">
                      <div className="flex items-center justify-between">
                        <dt>Seating</dt>
                        <dd className="font-medium text-slate-700">{activity.seatingCapacity} guests</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Kitchen</dt>
                        <dd className="font-medium text-slate-700">{activity.kitchenArea} sq ft</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt>Ventilation</dt>
                        <dd className="font-medium text-slate-700">{activity.ventilation}</dd>
                      </div>
                    </dl>
                    <ul className="mt-3 space-y-1 text-xs text-slate-500">
                      {activity.notes.map((note, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1 h-1 w-1 rounded-full bg-[#0E766E]" aria-hidden="true" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#dbe9e3] bg-white/90 p-4 text-center shadow-[0_18px_44px_-40px_rgba(15,23,42,0.45)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
        {title}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
