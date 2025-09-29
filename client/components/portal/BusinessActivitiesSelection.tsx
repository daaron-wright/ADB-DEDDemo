import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface BusinessActivity {
  id: string;
  label: string;
  description?: string;
  isRecommended?: boolean;
}

interface BusinessActivitiesSelectionProps {
  journeyNumber: string;
  completedSteps: number;
  totalSteps: number;
  activities: BusinessActivity[];
  selectedActivityIds: string[];
  onActivityToggle: (activityId: string) => void;
  onAddNewActivity: () => void;
  className?: string;
}

export function BusinessActivitiesSelection({
  journeyNumber,
  completedSteps,
  totalSteps,
  activities,
  selectedActivityIds,
  onActivityToggle,
  onAddNewActivity,
  className
}: BusinessActivitiesSelectionProps) {
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
              
              return (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => onActivityToggle(activity.id)}
                  className={cn(
                    "flex items-center gap-10 w-full text-left",
                    "hover:bg-white/5 rounded-lg p-2 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  )}
                >
                  {/* Radio Button */}
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {isSelected ? (
                      <div className="w-7 h-7 rounded-full bg-[#54FFD4] flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-black" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-transparent" />
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-lg font-normal text-white flex-1">
                    {activity.label}
                  </span>
                </button>
              );
            })}

            {/* Add New Activity */}
            <button
              type="button"
              onClick={onAddNewActivity}
              className={cn(
                "flex items-center gap-10 w-full text-left",
                "hover:bg-white/5 rounded-lg p-2 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              )}
            >
              {/* Plus Icon */}
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
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
              <span className="text-lg font-normal text-white flex-1">
                Add a new activity
              </span>
            </button>
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
