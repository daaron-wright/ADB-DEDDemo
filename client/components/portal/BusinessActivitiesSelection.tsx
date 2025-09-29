import { useState } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

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
  actorOptions: ActorOption[];
  onActivityToggle: (activityId: string) => void;
  onCreateActivity: (activityName: string, actorIds: string[]) => void;
  className?: string;
}

export function BusinessActivitiesSelection({
  journeyNumber,
  completedSteps,
  totalSteps,
  activities,
  selectedActivityIds,
  actorOptions,
  onActivityToggle,
  onCreateActivity,
  className
}: BusinessActivitiesSelectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityActors, setNewActivityActors] = useState<string[]>([]);

  const toggleNewActivityActor = (actorId: string, checked: boolean) => {
    setNewActivityActors((prev) => {
      if (checked) {
        if (prev.includes(actorId)) {
          return prev;
        }
        return [...prev, actorId];
      }
      return prev.filter((id) => id !== actorId);
    });
  };

  const handleCreateActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = newActivityName.trim();
    if (!label || newActivityActors.length === 0) {
      return;
    }

    onCreateActivity(label, newActivityActors);
    setNewActivityName('');
    setNewActivityActors([]);
    setIsAdding(false);
  };

  const handleCancelCreate = () => {
    setNewActivityName('');
    setNewActivityActors([]);
    setIsAdding(false);
  };

  const isCreateDisabled = !newActivityName.trim() || newActivityActors.length === 0;

  return (
    <div className={cn(
      "relative rounded-3xl overflow-hidden",
      "bg-white/[0.14] backdrop-blur-xl",
      "border border-white/20",
      className
    )}>
      {/* Content */}
      <div className="p-8 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Journey Number: {journeyNumber}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[#54FFD4] text-base font-normal">
              {completedSteps} of {totalSteps} complete
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.18] mb-8" />

        {/* Business Activities Section */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-2">
            2. Business Activities
          </h4>
          <p className="text-sm font-normal text-white/90 mb-6">
            Choose from the below AI recommended activities
          </p>

          {/* Activities List */}
          <div className="space-y-4">
            {activities.map((activity) => {
              const isSelected = selectedActivityIds.includes(activity.id);
              const assignedActors = activity.actors ?? [];

              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => onActivityToggle(activity.id)}
                  className={cn(
                    "flex w-full items-start gap-6 text-left",
                    "hover:bg-white/5 rounded-2xl p-3 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  )}
                >
                  {/* Radio Button */}
                  <div className="mt-1 w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#54FFD4] flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-black" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-transparent" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 space-y-2">
                    <span className="block text-lg font-normal text-white">
                      {activity.label}
                    </span>
                    {assignedActors.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {assignedActors.map((actorId) => {
                          const actor = actorOptions.find((item) => item.id === actorId);
                          if (!actor) {
                            return null;
                          }
                          return (
                            <span
                              key={`${activity.id}-${actorId}`}
                              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white/80"
                            >
                              {actor.label}
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {/* Add New Activity */}
            {isAdding ? (
              <form
                onSubmit={handleCreateActivity}
                className="rounded-2xl border border-white/20 bg-white/5 p-4"
              >
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-activity-name" className="text-sm font-medium text-white">
                      Activity name
                    </label>
                    <Input
                      id="new-activity-name"
                      value={newActivityName}
                      onChange={(event) => setNewActivityName(event.target.value)}
                      placeholder="Enter the activity title"
                      className="mt-2 h-11 rounded-2xl border-white/20 bg-white/10 text-sm text-white placeholder:text-white/60 focus-visible:ring-white/50"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white">Assign relevant reviewers</p>
                    <p className="mt-1 text-xs text-white/70">
                      Choose the actors who must review this activity.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {actorOptions.map((actor) => {
                        const isChecked = newActivityActors.includes(actor.id);
                        return (
                          <label
                            key={actor.id}
                            className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/5 px-3 py-3"
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(state) =>
                                toggleNewActivityActor(actor.id, state === true)
                              }
                              className="border-white/50 text-[#54FFD4] data-[state=checked]:border-[#54FFD4] data-[state=checked]:bg-[#54FFD4]/20"
                            />
                            <div className="space-y-1 text-left">
                              <span className="text-sm font-medium text-white">{actor.label}</span>
                              {actor.description ? (
                                <span className="block text-xs text-white/70">
                                  {actor.description}
                                </span>
                              ) : null}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelCreate}
                      className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreateDisabled}
                      className="rounded-full bg-[#54FFD4] px-5 py-2 text-sm font-semibold text-[#0B0C28] transition hover:bg-[#45ddb6] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save activity
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className={cn(
                  "flex items-center gap-6 w-full text-left",
                  "hover:bg-white/5 rounded-2xl p-3 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                )}
              >
                {/* Plus Icon */}
                <div className="mt-1 w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="text-black"
                    >
                      <path
                        d="M10 4.5V15.5M4.5 10H15.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Label */}
                <div className="flex-1">
                  <span className="text-lg font-normal text-white">
                    Add a new activity
                  </span>
                  <p className="mt-1 text-xs text-white/70">
                    Capture the activity name and assign reviewers from the actor list.
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.18] mb-8" />

        {/* Physical Space Requirements */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">
            3. Physical Space Requirements
          </h4>
          <p className="text-sm font-normal text-white/90">
            Physical space requirements will be generated once the above steps are complete
          </p>
        </div>
      </div>
    </div>
  );
}
