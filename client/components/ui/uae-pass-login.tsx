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

const USER_TYPE_DETAILS: Record<
  "applicant" | "reviewer",
  {
    label: string;
    description: string;
    secondary: string;
    accent: string;
    gradientFrom: string;
    gradientTo: string;
    badge: string;
  }
> = {
  applicant: {
    label: "Business applicant",
    description:
      "Start a new license, renew an existing one, and manage submissions for your venture.",
    secondary: "Ideal for entrepreneurs and business owners",
    accent: "#0f766e",
    gradientFrom: "from-emerald-500/15",
    gradientTo: "to-teal-500/10",
    badge: "BA",
  },
  reviewer: {
    label: "License reviewer",
    description:
      "Monitor queues, collaborate with colleagues, and approve or return applications.",
    secondary: "For municipal officers and reviewers",
    accent: "#2563eb",
    gradientFrom: "from-blue-500/15",
    gradientTo: "to-sky-500/10",
    badge: "LR",
  },
};

interface UserTypeSelectionProps {
  onSelect: (type: "applicant" | "reviewer") => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({ onSelect }) => (
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
      {(["applicant", "reviewer"] as const).map((type) => {
        const detail = USER_TYPE_DETAILS[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_16px_40px_-24px_rgba(15,23,42,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div
              className={`flex items-center gap-4 px-5 py-4 bg-gradient-to-r ${detail.gradientFrom} ${detail.gradientTo}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/80 text-base font-semibold text-slate-900 shadow-sm">
                {detail.badge}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{detail.label}</p>
                <p className="mt-1 text-xs text-slate-600">{detail.secondary}</p>
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
            <div className="px-5 pb-4 text-sm text-slate-500">{detail.description}</div>
          </button>
        );
      })}
    </div>
  </motion.div>
);

interface LoginStepViewProps {
  detail: (typeof USER_TYPE_DETAILS)["applicant"];
  isLoggingIn: boolean;
  onLogin: () => void;
}

const LoginStepView: React.FC<LoginStepViewProps> = ({ detail, isLoggingIn, onLogin }) => (
  <motion.div
    key="login"
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
          Sign in with UAE PASS
        </h3>
        <p className="text-sm text-slate-500">
          You're continuing as <span className="font-semibold text-slate-900">{detail.label}</span>
        </p>
      </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-start gap-4 px-6 pt-6">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold text-white shadow-md"
          style={{
            background: `linear-gradient(140deg, ${detail.accent} 0%, ${detail.accent}CC 100%)`,
          }}
        >
          {detail.badge}
        </div>
        <div className="space-y-1 text-left">
          <p className="text-sm font-semibold text-slate-900">{detail.label}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{detail.description}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {detail.secondary}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 space-y-4">
        <button
          className="w-full flex items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-15px_rgba(15,118,110,0.6)] transition-all duration-200 hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onLogin}
          disabled={isLoggingIn}
          style={{ backgroundColor: detail.accent }}
        >
          {isLoggingIn ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              Connecting to UAE PASS…
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="-ml-1"
              >
                <path
                  d="M3.5 10h13"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5l4.5 5L12 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign in with UAE PASS
            </>
          )}
        </button>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
          <p>
            You'll be redirected to the official UAE PASS experience to verify your identity securely.
          </p>
        </div>
      </div>
    </div>

    <p className="text-sm text-slate-500 text-center">
      A single trusted digital identity for all citizens, residents and visitors.
    </p>

    <div className="text-center text-sm text-slate-600">
      Need a UAE PASS account?{' '}
      <a
        href="https://uaepass.ae/signup"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-emerald-700 transition-colors duration-200 hover:text-emerald-800"
      >
        Create an account
      </a>
    </div>
  </motion.div>
);

export const UAEPassLogin: React.FC<UAEPassLoginProps> = ({
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
  const activeUserType: "applicant" | "reviewer" =
    selectedUserType ?? defaultUserType ?? "applicant";
  const activeUserDetail = USER_TYPE_DETAILS[activeUserType];
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const cancelTimeout = useCallback((timeoutId: ReturnType<typeof setTimeout>) => {
    clearTimeout(timeoutId);
    timeouts.current = timeouts.current.filter((id) => id !== timeoutId);
  }, []);

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

  const handleDirectLogin = useCallback(() => {
    const userType = selectedUserType ?? defaultUserType ?? "applicant";
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
            <UserTypeSelection onSelect={handleUserTypeSelect} />
          )}

          {loginStep === "login" && (
            <LoginStepView
              detail={activeUserDetail}
              isLoggingIn={isLoggingIn}
              onLogin={handleDirectLogin}
            />
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
