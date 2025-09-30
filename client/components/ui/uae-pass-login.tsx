import React, { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Close } from "@aegov/design-system-react";
import { AnimatePresence, motion } from "framer-motion";

interface UAEPassLoginProps {
  trigger: React.ReactElement;
  onLogin: (userType: "applicant" | "reviewer", userData: any) => void;
  onClose?: () => void;
  mode?: "quick" | "full";
  defaultUserType?: "applicant" | "reviewer";
}

type UserType = "applicant" | "reviewer" | null;

type LoginStep = "userType" | "login" | "success" | "fingerprint";

const MOCK_USER_PROFILES = {
  applicant: {
    name: "Ahmed Al Mansoori",
    email: "ahmed.almansoori@email.ae",
    emiratesId: "784-1985-1234567-8",
    userType: "applicant" as const,
    role: "Business Applicant",
  },
  reviewer: {
    name: "Sarah Al Zaabi",
    email: "sarah.alzaabi@adm.ae",
    emiratesId: "784-1982-7654321-2",
    userType: "reviewer" as const,
    role: "License Reviewer",
    department: "Abu Dhabi Municipality",
  },
};

const createMockUserData = (type: "applicant" | "reviewer") => ({
  id: `${type}-${Date.now()}`,
  ...MOCK_USER_PROFILES[type],
});

const USER_TYPE_DETAILS: Record<"applicant" | "reviewer", {
  label: string;
  description: string;
  secondary: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  badge: string;
}> = {
  applicant: {
    label: "Business applicant",
    description: "Start a new license, renew an existing one, and manage submissions for your venture.",
    secondary: "Ideal for entrepreneurs and business owners",
    accent: "#0f766e",
    gradientFrom: "from-emerald-500/15",
    gradientTo: "to-teal-500/10",
    badge: "BA",
  },
  reviewer: {
    label: "License reviewer",
    description: "Monitor application queues, collaborate with teams, and approve or return submissions.",
    secondary: "For municipal officers and reviewers",
    accent: "#2563eb",
    gradientFrom: "from-blue-500/15",
    gradientTo: "to-sky-500/10",
    badge: "LR",
  },
};

export const UAEPassLogin: React.FC<UAEPassLoginProps> = ({
  trigger,
  trigger,
  onLogin,
  onClose,
  mode = "full",
  defaultUserType = "applicant",
}) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(
    mode === "quick" ? defaultUserType : null,
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>("userType");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelTimeout = useCallback(
    (timeoutId: ReturnType<typeof setTimeout>) => {
      clearTimeout(timeoutId);
      timeouts.current = timeouts.current.filter((id) => id !== timeoutId);
    },
    [],
  );

  const clearAllTimeouts = useCallback(() => {
    timeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeouts.current = [];
  }, []);

  useEffect(() => () => clearAllTimeouts(), [clearAllTimeouts]);

  const scheduleTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      timeouts.current = timeouts.current.filter((id) => id !== timeoutId);
      callback();
    }, delay);
    timeouts.current.push(timeoutId);
    return timeoutId;
  }, []);

  const resetFlow = useCallback(() => {
    clearAllTimeouts();
    setSelectedUserType(mode === "quick" ? defaultUserType : null);
    setIsLoggingIn(false);
    setLoginStep("userType");
    onClose?.();
  }, [clearAllTimeouts, mode, defaultUserType, onClose]);

  const handleUserTypeSelect = (type: UserType) => {
    if (!type) return;
    setSelectedUserType(type);
    setLoginStep("login");
  };

  const handleLogin = useCallback(() => {
    if (!selectedUserType) return;
    setIsLoggingIn(true);

    scheduleTimeout(() => {
      setLoginStep("success");
      setIsLoggingIn(false);
      const mockUserData = createMockUserData(selectedUserType);

      scheduleTimeout(() => {
        onLogin(selectedUserType, mockUserData);
        closeButtonRef.current?.click();
      }, 900);
    }, 1500);
  }, [selectedUserType, scheduleTimeout, onLogin]);

  const handleDirectLogin = useCallback(() => {
    const userType = selectedUserType || defaultUserType;
    setIsLoggingIn(true);

    scheduleTimeout(() => {
      setLoginStep("success");
      setIsLoggingIn(false);
      const mockUserData = createMockUserData(userType);

      scheduleTimeout(() => {
        onLogin(userType, mockUserData);
        closeButtonRef.current?.click();
      }, 900);
    }, 1500);
  }, [selectedUserType, defaultUserType, scheduleTimeout, onLogin]);

  useEffect(() => {
    if (mode !== "quick" || loginStep !== "fingerprint") {
      return;
    }

    const userType = selectedUserType ?? defaultUserType;
    if (!userType) {
      return;
    }

    setIsLoggingIn(true);

    const fingerprintTimeout = scheduleTimeout(() => {
      setLoginStep("success");
      setIsLoggingIn(false);
      const mockUserData = createMockUserData(userType);

      scheduleTimeout(() => {
        onLogin(userType, mockUserData);
        closeButtonRef.current?.click();
      }, 700);
    }, 1400);

    return () => {
      cancelTimeout(fingerprintTimeout);
    };
  }, [
    mode,
    loginStep,
    selectedUserType,
    defaultUserType,
    scheduleTimeout,
    cancelTimeout,
    onLogin,
  ]);

  const enhancedTrigger = React.cloneElement(trigger, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      resetFlow();
      if (mode === "quick") {
        setLoginStep("login");
      }
      if (typeof trigger.props.onClick === "function") {
        trigger.props.onClick(event);
      }
    },
  });

  return (
    <Modal
      trigger={enhancedTrigger}
      size="md"
      title="Sign in with UAE PASS"
      className="rounded-3xl border border-white/25 bg-white/90 shadow-[0_24px_60px_-20px_rgba(24,32,63,0.28)] backdrop-blur-xl sm:max-w-md [&>div:first-child]:sr-only [&>div:first-child]:m-0 [&>div:first-child]:h-0 [&>div:first-child]:p-0 [&>div:first-child>button]:hidden"
    >
      <div className="w-full sm:w-[26rem] mx-auto p-6 text-center space-y-10 border border-[#d8e4df] rounded-md min-h-[32rem] xl:min-h-[35rem] flex flex-wrap justify-between flex-col content-between [&>*]:w-full">
        {/* Close Button */}
        <Close asChild>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={resetFlow}
            className="absolute top-4 right-4 rounded-full p-2 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </Close>

        <AnimatePresence mode="wait">
          {mode === "full" && loginStep === "userType" && (
            <motion.div
              key="userType"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="space-y-3 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Ministry of Economy
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    Who's signing in today?
                  </h3>
                  <p className="text-sm text-slate-500">
                    Select your role to continue securely with UAE PASS.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {( ["applicant", "reviewer"] as const ).map((type) => {
                  const detail = USER_TYPE_DETAILS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleUserTypeSelect(type)}
                      className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <div
                        className={`flex items-center gap-4 px-5 py-4 bg-gradient-to-r ${detail.gradientFrom} ${detail.gradientTo}`}
                      >
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-base font-semibold text-slate-900 shadow-sm"
                        >
                          {detail.badge}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {detail.label}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {detail.secondary}
                          </p>
                        </div>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-slate-400 transition group-hover:text-slate-700"
                        >
                          <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="px-5 pb-4 text-sm text-slate-500">
                        {detail.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {loginStep === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col justify-between h-full"
            >
              {/* Ministry Logo */}
              <div>
                <img 
                  src="/img/block_assets/logo-ministry.svg" 
                  alt="" 
                  className="max-h-12 sm:max-h-14 md:max-h-16 lg:max-h-[4.688rem] xl:max-h-20 2xl:max-h-24 max-w-[8.75rem] sm:max-w-[10.625rem] md:max-w-[11.25rem] lg:max-w-[13rem] xl:max-w-[15rem] 2xl:max-w-[25rem] mx-auto"
                />
              </div>

              {/* Login Content */}
              <div className="space-y-3 login-content">
                <button 
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#0f766e] text-white rounded-md text-sm font-semibold transition-all duration-200 hover:bg-[#0c5f58] disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                  onClick={handleDirectLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                      Connecting to UAE PASS…
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="25" viewBox="0 0 26 25" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M6.87822 3.28215C10.8502 1.18612 14.8245 1.35333 18.7965 3.28285C19.2381 3.49729 19.6908 3.64602 19.9518 3.09109C20.1805 2.60491 19.8393 2.33972 19.4237 2.12948C17.3167 1.06358 15.0853 0.494618 12.7063 0.500699C10.4141 0.48199 8.27526 1.04113 6.27465 2.122C5.85161 2.35024 5.45289 2.62572 5.77046 3.15797C6.05132 3.62872 6.47015 3.49729 6.87822 3.28215Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.59061 20.759C5.22089 20.759 4.91992 21.0525 4.91992 21.4134C4.91992 21.774 5.22089 22.0674 5.59061 22.0674C5.96057 22.0674 6.2613 21.774 6.2613 21.4134C6.2613 21.0525 5.96057 20.759 5.59061 20.759Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.3202 9.76151C14.3202 9.40091 14.0194 9.10742 13.6495 9.10742C13.2797 9.10742 12.979 9.40091 12.979 9.76151C12.979 10.1221 13.2797 10.4156 13.6495 10.4156C14.0194 10.4156 14.3202 10.1221 14.3202 9.76151Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M21.5269 19.2668C21.1569 19.2668 20.8562 19.5603 20.8562 19.9209C20.8562 20.2815 21.1569 20.575 21.5269 20.575C21.8966 20.575 22.1973 20.2815 22.1973 19.9209C22.1973 19.5603 21.8966 19.2668 21.5269 19.2668Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.481 16.6118C16.111 16.6118 15.8105 16.9053 15.8105 17.2659C15.8105 17.6265 16.111 17.92 16.481 17.92C16.8507 17.92 17.1517 17.6265 17.1517 17.2659C17.1517 16.9053 16.8507 16.6118 16.481 16.6118Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.481 16.6118C16.111 16.6118 15.8105 16.9053 15.8105 17.2659C15.8105 17.6265 16.111 17.92 16.481 17.92C16.8507 17.92 17.1517 17.6265 17.1517 17.2659C17.1517 16.9053 16.8507 16.6118 16.481 16.6118Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M24.5618 12.3096C24.1918 12.3096 23.8911 12.6031 23.8911 12.9637C23.8911 13.3245 24.1918 13.6177 24.5618 13.6177C24.9315 13.6177 25.2325 13.3245 25.2325 12.9637C25.2325 12.6031 24.9315 12.3096 24.5618 12.3096Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M24.2379 10.8211C24.2379 10.4605 23.9371 10.167 23.5672 10.167C23.1975 10.167 22.8967 10.4605 22.8967 10.8211C22.8967 11.1819 23.1975 11.4752 23.5672 11.4752C23.9371 11.4752 24.2379 11.1819 24.2379 10.8211Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.23685 5.159C4.60657 5.159 4.90754 4.86575 4.90754 4.50492C4.90754 4.14432 4.60657 3.85083 4.23685 3.85083C3.86713 3.85083 3.56616 4.14432 3.56616 4.50492C3.56616 4.86575 4.23685 5.159 4.23685 5.159Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.75462 10.9082C1.50416 10.9082 1.28785 11.0445 1.1728 11.2433L1.17046 11.2421C1.16788 11.2487 1.16531 11.255 1.16274 11.2616C1.13912 11.3053 1.12018 11.3514 1.10732 11.4002C0.53578 12.8805 0.5 14.4169 0.5 14.4169C0.5 14.7778 0.800735 15.071 1.17046 15.071C1.48733 15.071 1.75205 14.8549 1.82174 14.5664L1.82291 14.5661C1.82291 14.5647 1.82291 14.5636 1.82314 14.5624C1.8339 14.5156 1.84115 14.4672 1.84115 14.4169C1.84115 14.3943 1.83647 14.3725 1.83413 14.3503C1.92346 12.881 2.37082 11.82 2.37082 11.82C2.40567 11.741 2.42531 11.6537 2.42531 11.5623C2.42531 11.2017 2.12434 10.9082 1.75462 10.9082Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.48217 6.84771C3.97166 8.99331 2.54983 14.1269 4.04719 19.1467C4.05538 19.1907 4.06801 19.233 4.08461 19.2735C4.18446 19.5125 4.42463 19.6818 4.70549 19.6818C4.74571 19.6818 4.78477 19.6769 4.82312 19.6703C4.90426 19.6563 4.9798 19.6268 5.04808 19.5871C5.24359 19.4727 5.37595 19.266 5.37595 19.0277C5.37595 18.9852 5.37104 18.9435 5.36308 18.9028C5.36075 18.8918 5.357 18.8818 5.3542 18.8708C5.22184 18.397 5.09485 17.9214 4.99827 17.4406C3.92699 12.1124 7.51687 7.54226 12.7846 7.54226C17.6231 7.54226 20.8767 10.4902 20.8767 14.9252C20.8767 16.6899 20.1559 17.5692 18.8772 17.543C18.8751 17.543 18.8732 17.5423 18.8711 17.5423L18.866 17.5427C18.8412 17.5423 18.8162 17.5437 18.7916 17.5423C18.7886 17.5451 18.7867 17.5481 18.7837 17.5509C18.4556 17.5933 18.2007 17.8652 18.2007 18.1964C18.2007 18.4976 18.4109 18.7485 18.695 18.8245C18.7035 18.828 18.7126 18.8313 18.7285 18.8355L18.7325 18.8362C18.7378 18.8371 18.7437 18.8376 18.7491 18.8385C18.7631 18.8404 18.7799 18.842 18.8007 18.8437C18.8241 18.8458 18.847 18.8505 18.8711 18.8505C18.8798 18.8505 18.8877 18.8483 18.8964 18.8481C19.0318 18.8521 19.1932 18.8505 19.1932 18.8505C21.2932 18.6882 22.0478 16.9815 22.0478 14.5162C22.0478 8.3701 15.3362 4.56835 9.48217 6.84771Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.79442 5.09369C9.82234 5.0891 9.84734 5.07869 9.87442 5.07202C9.8465 5.0791 9.81942 5.0866 9.7915 5.0941L9.79442 5.09369Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.3248 4.32914C10.3227 4.31838 10.3189 4.30833 10.3163 4.2978C10.2448 4.01741 9.98684 3.80835 9.67769 3.80835C9.63723 3.80835 9.59794 3.81326 9.55959 3.82004C9.50908 3.83431 9.46044 3.84974 9.41086 3.86447C8.33444 4.18555 7.44229 4.62333 6.52699 5.15908C5.26558 5.89759 4.26142 6.73104 3.20183 8.06097C3.05053 8.25085 2.78043 8.50038 2.602 8.76837C2.5122 8.86659 2.45373 8.991 2.43783 9.12851C2.40088 9.30764 2.44321 9.48677 2.61954 9.65491C2.62585 9.66146 2.63287 9.6673 2.63941 9.67362C2.66303 9.6949 2.68852 9.71594 2.71682 9.73699C2.71986 9.73933 2.7229 9.74097 2.72594 9.74331C3.43896 10.2575 3.89193 9.28589 4.20974 8.88483C5.88108 6.77665 7.49607 5.67777 9.79157 5.08449C9.80724 5.08051 9.82244 5.07607 9.83834 5.07209C9.90078 5.05642 9.96065 5.03397 10.0149 5.0024C10.2074 4.88992 10.3376 4.6867 10.3376 4.45215C10.3376 4.41005 10.3327 4.36913 10.3248 4.32914Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M22.6987 8.30498C22.6669 8.24792 22.6288 8.19484 22.5815 8.1497C20.1406 5.03595 16.879 3.52971 12.9704 3.4502C12.7971 3.45253 12.3591 3.4502 12.3081 3.4502C11.9384 3.4502 11.6375 3.74368 11.6375 4.10428C11.6375 4.46512 11.9384 4.75837 12.3081 4.75837C15.7479 4.57971 19.2129 5.96926 21.5554 8.97076C21.5629 8.98222 21.5727 8.99275 21.5809 9.0035C21.703 9.16229 21.8954 9.26659 22.1141 9.26659C22.4829 9.26659 22.7824 8.97404 22.7824 8.6146C22.7824 8.50212 22.7504 8.39736 22.6987 8.30498Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M19.2904 14.927C19.2801 14.721 19.2511 14.5147 19.2132 14.3115C18.8973 12.6184 17.9198 11.0869 16.6116 10.1377C16.7234 10.2275 16.8062 10.351 16.8422 10.4925C16.8448 10.5037 16.849 10.514 16.8513 10.5252C16.8593 10.5663 16.8642 10.6089 16.8642 10.6524C16.8642 10.8951 16.7295 11.1056 16.5305 11.2218C16.4608 11.2625 16.3838 11.2925 16.301 11.3067C16.2622 11.3135 16.2225 11.3184 16.1816 11.3184C16.0454 11.3184 15.9196 11.2787 15.8132 11.2115C16.8864 12.0979 17.7933 13.5664 17.9535 15.0456C18.0049 15.5201 18.0538 16.0048 18.6574 15.9854C19.3425 15.9637 19.3145 15.413 19.2904 14.927Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.3011 11.3067C16.3839 11.2922 16.4606 11.2625 16.5303 11.2218C16.7295 11.1055 16.8642 10.8951 16.8642 10.6523C16.8642 10.6088 16.8593 10.5663 16.8511 10.5249C16.8488 10.5139 16.8448 10.5036 16.8423 10.4924C16.806 10.3509 16.7235 10.2274 16.6114 10.1376C16.6028 10.1313 16.5941 10.1248 16.5855 10.1187C16.4725 10.0361 16.3334 9.98633 16.1814 9.98633C15.8049 9.98633 15.4985 10.285 15.4985 10.6523C15.4985 10.694 15.5034 10.7342 15.5112 10.7735C15.5196 10.8181 15.5322 10.8612 15.5493 10.9023C15.583 10.9828 15.6332 11.0546 15.6943 11.1158C15.7343 11.1467 15.7738 11.1787 15.8131 11.2115C15.9195 11.2786 16.0455 11.3184 16.1814 11.3184C16.2225 11.3184 16.2621 11.3134 16.3011 11.3067Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M15.906 11.2861C15.8356 11.2278 15.7652 11.1707 15.6943 11.1157C15.7585 11.1799 15.8285 11.2374 15.906 11.2861Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M13.5032 11.9663C13.5011 11.9659 13.4999 11.9655 13.4978 11.9651C13.4999 11.9659 13.502 11.9663 13.5041 11.9672L13.5032 11.9663Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.2028 22.6782C15.8326 22.5477 15.4474 22.4455 15.0962 22.2769C12.2631 20.9164 10.7388 18.6903 10.5927 15.6142C10.5274 14.2389 11.4392 13.2738 12.7137 13.2247L12.7322 13.2184C12.8096 13.206 12.8825 13.1805 12.949 13.1447C13.154 13.0346 13.2948 12.8243 13.2948 12.5804C13.2948 12.3382 13.1559 12.1291 12.9532 12.0182C12.8636 11.9696 12.7628 11.9397 12.6543 11.9359C12.6466 11.9357 12.6393 11.9336 12.6316 11.9336C12.6166 11.9336 12.6024 11.9371 12.5877 11.938C10.8819 12.0451 9.50827 13.2673 9.28424 14.9269C8.78006 18.6653 12.0294 23.1433 15.7877 23.8935C16.2159 23.9791 16.6031 23.9562 16.7348 23.4752C16.8506 23.0528 16.5877 22.8138 16.2028 22.6782Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M16.2224 14.7238C16.2161 14.6726 16.203 14.624 16.1854 14.577C16.0613 14.0992 15.8686 13.5398 15.5922 13.1608C15.5716 13.1282 15.548 13.0978 15.522 13.0693C15.5176 13.0639 15.5136 13.0576 15.5091 13.0525L15.5054 13.0497C15.3833 12.9253 15.2124 12.8469 15.0223 12.8469C14.6523 12.8469 14.3516 13.1404 14.3516 13.501C14.3516 13.5698 14.3654 13.6345 14.3857 13.6967L14.3831 13.6993C14.3831 13.6993 14.3871 13.7077 14.3939 13.7229C14.4023 13.7456 14.4121 13.7674 14.4229 13.7887C14.4926 13.95 14.6465 14.3298 14.8275 14.917C14.8373 14.9773 14.8543 15.0351 14.8794 15.0889C14.9902 15.3283 15.2358 15.4958 15.522 15.4958C15.6452 15.4958 15.7591 15.4623 15.8599 15.4081C16.0783 15.2909 16.2282 15.0669 16.2282 14.8068C16.2282 14.7788 16.2259 14.7512 16.2224 14.7238Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.0693 23.6112L12.07 23.6103C12.0677 23.6091 12.0656 23.608 12.0632 23.6066C12.0565 23.6021 12.049 23.5984 12.042 23.5944C11.4201 23.2516 10.3877 22.243 10.322 22.1929C10.3213 22.192 10.3206 22.1913 10.3199 22.1906C10.2715 22.1541 10.2188 22.1221 10.1592 22.0991C9.81521 21.9668 9.42491 22.1319 9.28927 22.4677C9.21444 22.6527 9.23478 22.8505 9.32412 23.0135L9.33253 23.0455C10.1639 24.1409 11.4835 24.6856 11.4835 24.6856C11.806 24.8095 12.1715 24.6547 12.2987 24.3402C12.4079 24.0701 12.3048 23.7693 12.0693 23.6112Z" fill="#E82227" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.2137 9.28857C11.1063 9.28857 10.9115 9.35943 10.9115 9.35943C8.14553 10.1695 6.27845 12.6621 6.30721 15.6852C6.3631 17.5761 7.19375 19.8756 7.74401 20.8372C7.7695 20.8884 7.81393 20.9632 7.84129 21.0086C7.85345 21.0289 7.86257 21.0437 7.86467 21.0469C7.87707 21.0694 7.89087 21.0935 7.9049 21.1178C8.0265 21.2864 8.22715 21.3977 8.45422 21.3977C8.57138 21.3977 8.68012 21.3657 8.77623 21.314C8.98436 21.2024 9.12701 20.9892 9.12701 20.7413C9.12701 20.6382 9.10105 20.542 9.05709 20.4553C9.04353 20.4326 9.0309 20.4097 9.01734 20.387C8.08263 18.8281 7.60837 17.1077 7.66871 15.2018C7.73886 12.9832 9.31971 11.1877 11.3421 10.5841C11.3823 10.5766 11.4209 10.5647 11.4583 10.5502C11.5182 10.5338 11.6954 10.4223 11.7125 10.3755C11.8182 10.26 11.8841 10.1094 11.8841 9.94266C11.8841 9.58206 11.5834 9.28857 11.2137 9.28857Z" fill="#00AC75" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.01733 20.3872C9.0415 20.4276 9.064 20.4685 9.08817 20.5089C9.06692 20.4668 9.04358 20.4264 9.01733 20.3872Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.84131 21.0085C7.87256 21.0773 7.91048 21.1423 7.95464 21.2031C7.92964 21.1602 7.90506 21.1169 7.88256 21.0773C7.87923 21.0715 7.86298 21.0448 7.84131 21.0085Z" fill="white" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M19.3805 20.3173C19.2893 20.2675 19.1868 20.2371 19.0762 20.2336C19.0383 20.2374 19.0004 20.2397 18.9628 20.243C16.089 20.4869 13.7542 18.6046 13.5051 15.8023C13.4621 15.3162 13.4778 14.7481 12.7942 14.7977C12.164 14.8438 12.1586 15.4623 12.1911 15.952C12.4009 19.1167 15.1281 21.5631 18.4343 21.5977C18.6492 21.5977 18.8669 21.5769 19.0846 21.5469C19.1274 21.5411 19.1702 21.5352 19.2133 21.5285C19.2705 21.514 19.3253 21.4927 19.3762 21.4651C19.5853 21.3531 19.7287 21.1386 19.7287 20.8898C19.7287 20.6431 19.5872 20.4301 19.3805 20.3173Z" fill="white" />
                      </svg>
                      Sign in with UAE PASS
                    </>
                  )}
                </button>
                <p className="text-sm px-6 text-slate-600">
                  A single trusted digital identity for all citizens, residents and visitors.
                </p>
              </div>

              {/* Footer */}
              <div>
                <p className="text-slate-600">
                  Need a UAE PASS account? {" "}
                  <a 
                    href="https://uaepass.ae/signup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#0f766e] hover:text-[#0c5f58] transition-colors duration-200 underline"
                  >
                    Create an account
                  </a>
                </p>
              </div>
            </motion.div>
          )}

          {loginStep === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="space-y-4 py-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                You're signed in
              </h3>
              <p className="text-sm text-slate-500">
                We're preparing your business license portal…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
