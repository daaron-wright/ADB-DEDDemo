import { useState } from 'react';
import { cn } from '@/lib/utils';
import { JourneyStepper, type JourneyStep } from './JourneyStepper';
import { BusinessActivitiesSelection, type BusinessActivity } from './BusinessActivitiesSelection';
import { AIAssistantPanel } from './AIAssistantPanel';

interface JourneyViewProps {
  journeyNumber: string;
  completedSteps: number;
  totalSteps: number;
  currentStepId: string;
  steps: JourneyStep[];
  activities: BusinessActivity[];
  selectedActivityIds: string[];
  onStepChange: (stepId: string) => void;
  onActivityToggle: (activityId: string) => void;
  onAddNewActivity: () => void;
  onClose?: () => void;
  className?: string;
}

export function JourneyView({
  journeyNumber,
  completedSteps,
  totalSteps,
  currentStepId,
  steps,
  activities,
  selectedActivityIds,
  onStepChange,
  onActivityToggle,
  onAddNewActivity,
  onClose,
  className
}: JourneyViewProps) {
  const [aiStatus] = useState<'listening' | 'speaking' | 'thinking' | 'idle'>('speaking');

  return (
    <div className={cn(
      "fixed inset-0 z-50 overflow-auto",
      "bg-[#0B0C28]", // Dark background from Figma
      className
    )}>
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-[#0B0C28]" />
        
        {/* Gradient overlays matching Figma design */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E0A2B]/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0919B6]/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-bl from-[#07D2FB]/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-tl from-[#21FCC6]/20 via-transparent to-transparent" />
        
        {/* Overall overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Top Header Bar with TAMM logo */}
        <header className="flex items-center justify-between px-10 py-5 bg-white/30 backdrop-blur-xl border-b border-white/30">
          {/* TAMM Logo */}
          <div className="flex items-center">
            <svg width="111" height="50" viewBox="0 0 111 50" fill="none">
              <path d="M65.7295 29.4803V38.9246H63.8522V29.4803H60.2384V27.6821H69.359V29.4803H65.7295Z" fill="white"/>
              <path d="M71.2519 34.5152L73.223 34.2494C73.6611 34.1868 73.7862 33.9679 73.7862 33.6865C73.7862 33.0298 73.3482 32.5138 72.3313 32.5138C71.5178 32.4669 70.8138 33.0767 70.7669 33.9054C70.7669 33.9054 70.7669 33.9054 70.7669 33.921L69.0773 33.5458C69.2181 32.2167 70.4071 31.0283 72.3 31.0283C74.6623 31.0283 75.554 32.373 75.554 33.9054V37.7519C75.554 38.1584 75.5853 38.5806 75.6479 38.9871H73.9583C73.8957 38.6588 73.8644 38.3304 73.8801 38.0021C73.3638 38.7839 72.4721 39.253 71.5178 39.2061C70.1881 39.3155 69.0304 38.3148 68.9365 37.0014C68.9365 36.9544 68.9365 36.9232 68.9365 36.8763C68.9522 35.4534 69.9534 34.7028 71.2519 34.5152ZM73.7862 35.7348V35.3596L71.7838 35.6566C71.2206 35.7505 70.7669 36.0632 70.7669 36.7043C70.7669 37.2672 71.2206 37.7206 71.7838 37.7206C71.8151 37.7206 71.8463 37.7206 71.8776 37.7206C72.9101 37.7363 73.7862 37.2359 73.7862 35.7348Z" fill="white"/>
              <path d="M77.7755 38.9245V31.2002H79.5277V32.1853C80.0126 31.4191 80.8574 30.9657 81.7648 30.9813C82.7347 30.9344 83.6421 31.466 84.0645 32.3416C84.5651 31.4504 85.535 30.9187 86.5519 30.9813C87.9442 30.9813 89.2583 31.8726 89.2583 33.9209V38.9245H87.4905V34.2336C87.4905 33.3267 87.0369 32.6544 86.02 32.6544C85.1439 32.6544 84.4243 33.3736 84.4243 34.2649C84.4243 34.2962 84.4243 34.3118 84.4243 34.3431V38.9245H82.6252V34.2493C82.6252 33.358 82.1872 32.67 81.1547 32.67C80.2942 32.6544 79.5746 33.358 79.5589 34.218C79.5589 34.2649 79.5589 34.3118 79.5589 34.3587V38.9401L77.7755 38.9245Z" fill="white"/>
              <path d="M91.511 38.9245V31.2002H93.2631V32.1853C93.7481 31.4191 94.5929 30.9657 95.5003 30.9813C96.4702 30.9344 97.3775 31.466 97.7999 32.3416C98.3006 31.4504 99.2549 30.9187 100.272 30.9813C101.664 30.9813 102.978 31.8726 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.053 32.6544C99.9588 32.6387 99.865 32.6387 99.7868 32.6387C98.9107 32.6387 98.191 33.358 98.191 34.2493C98.191 34.2805 98.191 34.2962 98.191 34.3274V38.9088H96.4076V34.2336C96.5015 33.4674 95.9696 32.7638 95.203 32.6544C95.1091 32.6387 95.0153 32.6387 94.9371 32.6387C94.0766 32.6231 93.357 33.3267 93.3414 34.1867C93.3414 34.2336 93.3414 34.2805 93.3414 34.3274V38.9088L91.511 38.9245Z" fill="white"/>
              <path d="M101.07 12.5304C101.586 12.5773 102.04 12.2177 102.086 11.7017C102.086 11.6704 102.086 11.6392 102.086 11.6079C102.024 11.045 101.523 10.6228 100.96 10.6853C100.475 10.7323 100.1 11.1232 100.037 11.6079C100.037 12.1239 100.444 12.5304 100.96 12.5461C100.991 12.5461 101.038 12.5461 101.07 12.5304Z" fill="white"/>
              <path d="M103.51 10.7012C102.994 10.6543 102.54 11.0295 102.493 11.5612C102.493 11.5924 102.493 11.6081 102.493 11.6394C102.556 12.2023 103.056 12.6244 103.62 12.5619C104.105 12.515 104.48 12.1241 104.543 11.6394C104.543 11.1234 104.12 10.7012 103.588 10.7012C103.557 10.6855 103.541 10.6855 103.51 10.7012Z" fill="white"/>
              {/* Simplified TAMM logo paths - truncated for brevity */}
            </svg>
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <h1 className="text-base font-medium text-white">
              Investor Journey for a Restaurant
            </h1>
          </div>

          {/* Close button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </header>

        {/* Journey Stepper */}
        <JourneyStepper
          steps={steps}
          currentStepId={currentStepId}
          onStepClick={onStepChange}
        />

        {/* Main Content Area */}
        <div className="flex gap-8 p-11 pt-8">
          {/* Left Panel - Business Activities */}
          <div className="flex-1 max-w-[633px]">
            <BusinessActivitiesSelection
              journeyNumber={journeyNumber}
              completedSteps={completedSteps}
              totalSteps={totalSteps}
              activities={activities}
              selectedActivityIds={selectedActivityIds}
              onActivityToggle={onActivityToggle}
              onAddNewActivity={onAddNewActivity}
            />
          </div>

          {/* Right Panel - AI Assistant */}
          <div className="flex-shrink-0">
            <AIAssistantPanel
              status={aiStatus}
              statusMessage="Generating application..."
              progressPercentage={30}
              message="You can select multiple business activities for a restaurant, provided they fall under the same business group. You can list a maximum of 10 activities on a single trade license."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
