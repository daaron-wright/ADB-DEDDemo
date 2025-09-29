import { useState } from 'react';
import { cn } from '@/lib/utils';
import { JourneyStepper, type JourneyStep } from './JourneyStepper';
import { BusinessActivitiesSelection, type BusinessActivity, type ActorOption } from './BusinessActivitiesSelection';
import { AIAssistantPanel } from './AIAssistantPanel';

interface JourneyViewProps {
  journeyNumber: string;
  completedSteps: number;
  totalSteps: number;
  currentStepId: string;
  steps: JourneyStep[];
  activities: BusinessActivity[];
  selectedActivityIds: string[];
  availableActivities: BusinessActivity[];
  actorOptions: ActorOption[];
  onStepChange: (stepId: string) => void;
  onActivityToggle: (activityId: string) => void;
  onAddActivity: (activityId: string) => void;
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
  availableActivities,
  actorOptions,
  onStepChange,
  onActivityToggle,
  onAddActivity,
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
              <path d="M69.6406 18.3628C69.6406 18.2377 69.6406 18.1126 69.6406 17.9719C69.6406 15.8141 68.3264 14.3756 66.3553 14.3756C64.7126 14.313 63.289 15.5326 63.1013 17.1744C61.2866 17.2683 60.2384 18.4723 60.2384 20.505V22.7409H62.0062V20.8021C62.0062 19.8013 62.3347 19.1133 63.1326 19.0039C63.4455 20.5206 64.8065 21.5839 66.3396 21.5057C67.3878 21.5526 68.3734 21.0679 68.9991 20.2235H102.963V13.5781H101.179V18.3628H69.6406ZM67.8571 17.925C67.8571 18.957 67.2939 19.645 66.3553 19.645C65.5105 19.645 64.8065 18.9726 64.8065 18.1126C64.8065 18.0501 64.8065 17.9875 64.8221 17.925C64.8221 16.8774 65.4323 16.1737 66.3553 16.1737C67.2626 16.1737 67.8571 16.8774 67.8571 17.925Z" fill="white"/>
              <path d="M27.4987 23.1028L26.8104 20.3821C26.3254 20.5072 25.8248 20.5853 25.3242 20.601C24.8079 20.5541 24.276 20.4915 23.7754 20.3821L23.0558 23.0715C23.8224 23.2904 24.6046 23.3999 25.4024 23.3999C26.1064 23.3999 26.8104 23.306 27.4987 23.1028Z" fill="white"/>
              <path d="M29.3916 31.1085C27.5925 32.4376 26.4036 33.1099 25.2616 33.1099C22.8211 33.1099 20.8968 31.0616 20.8968 31.0616L20.2085 33.7197C21.6634 34.8455 23.4155 35.4866 25.2616 35.5804C26.7478 35.5804 28.2027 34.9237 30.1582 33.5946L29.5011 30.999L29.3916 31.1085Z" fill="white"/>
              <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
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
              availableActivities={availableActivities}
              actorOptions={actorOptions}
              onActivityToggle={onActivityToggle}
              onAddActivity={onAddActivity}
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
