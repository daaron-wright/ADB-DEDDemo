import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleQuestionnaire, { SimpleQuestionnaireHandle } from './simple-questionnaire';
import AIChatPanel from './ai-chat-panel';

interface User {
  id: string;
  name: string;
  email: string;
  emiratesId: string;
  userType: 'applicant' | 'reviewer';
  role: string;
  department?: string;
}

interface BusinessLicensePortalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

const BusinessLicensePortalSimplified: React.FC<BusinessLicensePortalProps> = ({ isOpen, user, onClose }) => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showExplainability, setShowExplainability] = useState(false);
  const questionnaireRef = useRef<SimpleQuestionnaireHandle>(null);

  // Auto-refresh and activity tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > 30000) { // 30 seconds of inactivity
        showNotification('💡 Tip: Check service status for updates');
        setLastActivity(Date.now());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity]);

  const showNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setLastActivity(Date.now());
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 4000);
  };

  const handleTimelineClick = (itemId: string) => {
    questionnaireRef.current?.scrollToItem(itemId);
    setLastActivity(Date.now());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background with gradients and filters */}
      <div className="absolute inset-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-[#0B0C28]"></div>

        {/* Gradient overlays to match Figma design */}
        <div className="absolute -left-96 -top-48 w-[2310px] h-[1719px] rounded-full bg-[#0E0A2B] opacity-40 blur-[200px]"></div>
        <div className="absolute left-60 top-8 w-[1227px] h-[934px] rounded-full bg-[#0919B6] opacity-30 blur-[200px] rotate-[30deg]"></div>
        <div className="absolute left-44 -top-[506px] w-[775px] h-[767px] rounded-full bg-[#07D2FB] opacity-20 blur-[140px]"></div>
        <div className="absolute -left-20 -top-[455px] w-[806px] h-[698px] rounded-full bg-[#21FCC6] opacity-25 blur-[200px]"></div>

        {/* Top overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/30"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full h-[87px] bg-white/30 backdrop-blur-[40px] border-b border-white/30 z-10">
        <div className="flex items-center justify-between h-full px-10">
          {/* TAMM Logo */}
          <div className="flex items-center">
            <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M65.7295 29.4803V38.9246H63.8522V29.4803H60.2384V27.6821H69.359V29.4803H65.7295Z" fill="white"/>
              <path d="M71.2519 34.5152L73.223 34.2494C73.6611 34.1868 73.7862 33.9679 73.7862 33.6865C73.7862 33.0298 73.3482 32.5138 72.3313 32.5138C71.5178 32.4669 70.8138 33.0767 70.7669 33.9054C70.7669 33.9054 70.7669 33.9054 70.7669 33.921L69.0773 33.5458C69.2181 32.2167 70.4071 31.0283 72.3 31.0283C74.6623 31.0283 75.554 32.373 75.554 33.9054V37.7519C75.554 38.1584 75.5853 38.5806 75.6479 38.9871H73.9583C73.8957 38.6588 73.8644 38.3304 73.8801 38.0021C73.3638 38.7839 72.4721 39.253 71.5178 39.2061C70.1881 39.3155 69.0304 38.3148 68.9365 37.0014C68.9365 36.9544 68.9365 36.9232 68.9365 36.8763C68.9522 35.4534 69.9534 34.7028 71.2519 34.5152ZM73.7862 35.7348V35.3596L71.7838 35.6566C71.2206 35.7505 70.7669 36.0632 70.7669 36.7043C70.7669 37.2672 71.2206 37.7206 71.7838 37.7206C71.8151 37.7206 71.8463 37.7206 71.8776 37.7206C72.9101 37.7363 73.7862 37.2359 73.7862 35.7348Z" fill="white"/>
            </svg>
          </div>

          {/* Center Title */}
          <div className="text-white text-center font-['DM_Sans'] text-base font-medium leading-[130%]">
            Investor Journey for a Restaurant
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowExplainability(prev => !prev)}
              className="flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition-colors duration-200 hover:bg-white/18 hover:text-white"
              aria-pressed={showExplainability}
              aria-label="Explainability"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white/70"
              >
                <path
                  d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm0-14a1 1 0 1 0-1-1 1 1 0 0 0 1 1Zm-1 3h2v6h-2Z"
                  fill="currentColor"
                />
              </svg>
              Explainability
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 text-white">
              <div className="text-right">
                <div className="font-['DM_Sans'] text-sm font-semibold">{user.name}</div>
                <div className="font-['DM_Sans'] text-xs opacity-75">Emirates ID: {user.emiratesId}</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-['DM_Sans'] text-sm font-bold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 transition-colors duration-200 hover:bg-white/20 hover:text-white"
              aria-label="Close portal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showExplainability && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute right-10 top-[120px] z-40 w-[340px] space-y-4 rounded-3xl border border-white/15 bg-white/14 p-6 backdrop-blur-2xl shadow-[0_20px_55px_rgba(8,15,38,0.45)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Explainability</span>
                <h3 className="text-lg font-semibold text-white/90">Actions that stay with you</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExplainability(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 transition-colors duration-200 hover:bg-white/20 hover:text-white"
                aria-label="Close explainability"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-white/65">
              We surface these details so you understand what continues to live in your TAMM workspace even after this session ends.
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-3">
                <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-emerald-200/80" />
                <div className="space-y-1">
                  <p className="font-semibold text-white/85">Completed steps</p>
                  <p className="text-white/55">Every task you finish is recorded so your journey resumes from the same spot next time.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-sky-200/80" />
                <div className="space-y-1">
                  <p className="font-semibold text-white/85">Selected activities</p>
                  <p className="text-white/55">Activity choices stay linked to your license profile to keep recommendations relevant.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 block h-2.5 w-2.5 rounded-full bg-white/65" />
                <div className="space-y-1">
                  <p className="font-semibold text-white/85">Uploaded documents</p>
                  <p className="text-white/55">Supporting files remain securely stored for reviewers and follow-up submissions.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps Bar */}
      <div className="w-full h-20 bg-white/30 backdrop-blur-[40px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_4px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center absolute top-[87px] left-0 z-10">
        <div className="w-full h-full flex items-center">
          {/* Step 1: Questionnaire - Active */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 bg-white/10 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Questionnaire
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4001 1.50024C10.3234 1.50024 8.29333 2.11606 6.56661 3.26981C4.83989 4.42357 3.49408 6.06344 2.69936 7.98207C1.90464 9.90069 1.69671 12.0119 2.10185 14.0487C2.507 16.0855 3.50703 17.9564 4.97548 19.4249C6.44393 20.8933 8.31485 21.8933 10.3517 22.2985C12.3885 22.7036 14.4997 22.4957 16.4183 21.701C18.3369 20.9063 19.9768 19.5604 21.1305 17.8337C22.2843 16.107 22.9001 14.0769 22.9001 12.0002C22.9001 9.21547 21.7938 6.54475 19.8247 4.57562C17.8556 2.60649 15.1849 1.50024 12.4001 1.50024ZM12.4001 21.0002C10.6201 21.0002 8.88001 20.4724 7.39997 19.4835C5.91992 18.4945 4.76637 17.0889 4.08518 15.4444C3.40399 13.7999 3.22576 11.9903 3.57303 10.2444C3.9203 8.4986 4.77746 6.89496 6.03614 5.63628C7.29481 4.37761 8.89846 3.52044 10.6443 3.17318C12.3901 2.82591 14.1997 3.00414 15.8442 3.68533C17.4888 4.36652 18.8944 5.52007 19.8833 7.00011C20.8723 8.48015 21.4001 10.2202 21.4001 12.0002C21.4001 14.3872 20.4519 16.6764 18.7641 18.3642C17.0762 20.052 14.787 21.0002 12.4001 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2: Business Registration - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Business Registration
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.2 1.50024C10.1233 1.50024 8.09328 2.11606 6.36656 3.26981C4.63984 4.42357 3.29403 6.06344 2.49931 7.98207C1.70459 9.90069 1.49666 12.0119 1.9018 14.0487C2.30695 16.0855 3.30697 17.9564 4.77543 19.4249C6.24388 20.8933 8.1148 21.8933 10.1516 22.2985C12.1884 22.7036 14.2996 22.4957 16.2182 21.701C18.1368 20.9063 19.7767 19.5604 20.9305 17.8337C22.0842 16.107 22.7 14.0769 22.7 12.0002C22.7 9.21547 21.5938 6.54475 19.6247 4.57562C17.6555 2.60649 14.9848 1.50024 12.2 1.50024ZM12.2 21.0002C10.42 21.0002 8.67996 20.4724 7.19992 19.4835C5.71987 18.4945 4.56632 17.0889 3.88513 15.4444C3.20394 13.7999 3.02571 11.9903 3.37298 10.2444C3.72025 8.4986 4.57741 6.89496 5.83609 5.63628C7.09476 4.37761 8.69841 3.52044 10.4442 3.17318C12.1901 2.82591 13.9997 3.00414 15.6442 3.68533C17.2887 4.36652 18.6943 5.52007 19.6833 7.00011C20.6722 8.48015 21.2 10.2202 21.2 12.0002C21.2 14.3872 20.2518 16.6764 18.564 18.3642C16.8762 20.052 14.587 21.0002 12.2 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 3: Submit Documents - Inactive */}
          <button
            type="button"
            onClick={() => handleTimelineClick('documents')}
            className="group relative flex-1 cursor-pointer border-r border-white/30 px-5 py-2 opacity-50 transition duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <span className="absolute top-2 right-3 rounded-full bg-[#54FFD4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-900">
              Submitting docs
            </span>
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Submit Documents
              </div>
              <div className="flex h-6 w-6 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0002 2.00024C9.92348 2.00024 7.89342 2.61606 6.1667 3.76981C4.43998 4.92357 3.09417 6.56344 2.29945 8.48207C1.50473 10.4007 1.2968 12.5119 1.70194 14.5487C2.10709 16.5855 3.10712 18.4564 4.57557 19.9249C6.04402 21.3933 7.91494 22.3933 9.95174 22.7985C11.9885 23.2036 14.0997 22.9957 16.0184 22.201C17.937 21.4063 19.5769 20.0604 20.7306 18.3337C21.8844 16.607 22.5002 14.5769 22.5002 12.5002C22.5002 9.71547 21.3939 7.04475 19.4248 5.07562C17.4557 3.10649 14.785 2.00024 12.0002 2.00024ZM12.0002 21.5002C10.2202 21.5002 8.4801 20.9724 7.00006 19.9835C5.52001 18.9945 4.36646 17.5889 3.68527 15.9444C3.00408 14.2999 2.82585 12.4903 3.17312 10.7444C3.52039 8.9986 4.37755 7.39496 5.63623 6.13628C6.8949 4.87761 8.49855 4.02044 10.2444 3.67318C11.9902 3.32591 13.7998 3.50414 15.4443 4.18533C17.0889 4.86652 18.4945 6.02007 19.4834 7.50011C20.4723 8.98015 21.0002 10.7202 21.0002 12.5002C21.0002 14.8872 20.052 17.1764 18.3641 18.8642C16.6763 20.552 14.3871 21.5002 12.0002 21.5002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </button>

          {/* Step 4: Business Licensing - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-2 border-r border-white/30 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Business Licensing
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8002 1.50024C10.7235 1.50024 8.69346 2.11606 6.96675 3.26981C5.24003 4.42357 3.89422 6.06344 3.0995 7.98207C2.30478 9.90069 2.09685 12.0119 2.50199 14.0487C2.90714 16.0855 3.90716 17.9564 5.37562 19.4249C6.84407 20.8933 8.71499 21.8933 10.7518 22.2985C12.7886 22.7036 14.8998 22.4957 16.8184 21.701C18.737 20.9063 20.3769 19.5604 21.5307 17.8337C22.6844 16.107 23.3002 14.0769 23.3002 12.0002C23.3002 9.21547 22.194 6.54475 20.2249 4.57562C18.2557 2.60649 15.585 1.50024 12.8002 1.50024ZM12.8002 21.0002C11.0202 21.0002 9.28015 20.4724 7.8001 19.4835C6.32006 18.4945 5.16651 17.0889 4.48532 15.4444C3.80413 13.7999 3.6259 11.9903 3.97317 10.2444C4.32044 8.4986 5.1776 6.89496 6.43628 5.63628C7.69495 4.37761 9.2986 3.52044 11.0444 3.17318C12.7903 2.82591 14.5999 3.00414 16.2444 3.68533C17.8889 4.36652 19.2945 5.52007 20.2835 7.00011C21.2724 8.48015 21.8002 10.2202 21.8002 12.0002C21.8002 14.3872 20.852 16.6764 19.1642 18.3642C17.4764 20.052 15.1872 21.0002 12.8002 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 5: Pre-Operational Inspection - Inactive */}
          <button
            type="button"
            onClick={() => handleTimelineClick('inspection')}
            className="group relative flex-1 cursor-pointer px-5 py-2 opacity-50 transition duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <span className="absolute top-2 right-3 rounded-full bg-[#54FFD4] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-900">
              Pre op inspection
            </span>
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Pre-Operational Inspection
              </div>
              <div className="flex h-6 w-6 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6001 1.50024C10.5234 1.50024 8.49333 2.11606 6.76661 3.26981C5.0399 4.42357 3.69409 6.06344 2.89937 7.98207C2.10465 9.90069 1.89671 12.0119 2.30186 14.0487C2.707 16.0855 3.70703 17.9564 5.17548 19.4249C6.64393 20.8933 8.51485 21.8933 10.5517 22.2985C12.5885 22.7036 14.6997 22.4957 16.6183 21.701C18.5369 20.9063 20.1768 19.5604 21.3305 17.8337C22.4843 16.107 23.1001 14.0769 23.1001 12.0002C23.1001 9.21547 21.9939 6.54475 20.0247 4.57562C18.0556 2.60649 15.3849 1.50024 12.6001 1.50024ZM12.6001 21.0002C10.8201 21.0002 9.08001 20.4724 7.59997 19.4835C6.11993 18.4945 4.96638 17.0889 4.28519 15.4444C3.604 13.7999 3.42577 11.9903 3.77303 10.2444C4.1203 8.4986 4.97747 6.89496 6.23614 5.63628C7.49481 4.37761 9.09846 3.52044 10.8443 3.17318C12.5901 2.82591 14.3997 3.00414 16.0443 3.68533C17.6888 4.36652 19.0944 5.52007 20.0833 7.00011C21.0723 8.48015 21.6001 10.2202 21.6001 12.0002C21.6001 14.3872 20.6519 16.6764 18.9641 18.3642C17.2762 20.052 14.9871 21.0002 12.6001 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute top-[167px] left-0 w-full h-[calc(100vh-167px)] flex gap-6 px-11 py-12">
        {/* Left Panel - Simplified Questionnaire */}
        <div className="w-full max-w-[633px]">
          <SimpleQuestionnaire
            ref={questionnaireRef}
            journeyNumber="0987654321"
            completedCount={2}
            totalCount={8}
            onItemUpdate={(sectionId, itemId, status) => {
              showNotification(`✅ Item ${status === 'completed' ? 'completed' : 'updated'}: ${itemId}`);
            }}
          />
        </div>

        {/* Right Panel - AI Chat Interface */}
        <AIChatPanel className="flex-shrink-0" />
      </div>

      {/* Enhanced Notification Toast System */}
      <div className="fixed top-24 right-6 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }
              }}
              exit={{
                opacity: 0,
                x: 300,
                scale: 0.8,
                transition: {
                  duration: 0.2
                }
              }}
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-3 rounded-lg shadow-lg font-['DM_Sans'] text-sm font-medium max-w-sm border ${
                notification.includes('✅')
                  ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300'
                  : notification.includes('❌') || notification.includes('🗑️')
                  ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300'
                  : notification.includes('📋') || notification.includes('🔄')
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300'
                  : 'bg-gradient-to-r from-[#54FFD4] to-[#21FCC6] text-black border-[#54FFD4]'
              } cursor-pointer`}
              onClick={() => {
                setNotifications(prev => prev.filter((_, i) => i !== index));
              }}
            >
              <div className="flex items-center gap-2">
                {notification.includes('✅') && (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    🎉
                  </motion.div>
                )}
                <span>{notification}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusinessLicensePortalSimplified;
