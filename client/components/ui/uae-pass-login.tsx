import React, { useState, useRef, useCallback, useEffect } from "react";
import { Modal, Close } from "@aegov/design-system-react";
import { AnimatePresence, motion } from "framer-motion";
import { chatCardClass } from "@/lib/chat-style";
import { cn } from "@/lib/utils";
import { ENTREPRENEUR_PROFILE } from "@/lib/profile";

interface UAEPassLoginProps {
  trigger: React.ReactElement;
  onLogin: (userType: "applicant" | "reviewer", userData: any) => void;
  onClose?: () => void;
  mode?: "quick" | "full";
  defaultUserType?: "applicant" | "reviewer";
  autoLogin?: boolean;
}

type UserType = "applicant" | "reviewer" | null;

type LoginStep = "userType" | "login" | "success" | "fingerprint";

const MOCK_USER_PROFILES = {
  applicant: {
    name: ENTREPRENEUR_PROFILE.name,
    email: "khalid.entrepreneur@email.ae",
    emiratesId: "784-1985-1234567-8",
    userType: "applicant" as const,
    role: "Business Applicant",
    avatarUrl: ENTREPRENEUR_PROFILE.avatar,
  },
  reviewer: {
    reviewerId: "Reviewer ID RV-45812",
    name: "Reviewer ID RV-45812",
    email: "rv-45812@adm.ae",
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
    accent: "#1f8a83",
    gradientFrom: "from-emerald-400/12",
    gradientTo: "to-teal-400/10",
    badge: "BA",
  },
  reviewer: {
    label: "License reviewer",
    description:
      "Monitor queues, collaborate with colleagues, and approve or return applications.",
    secondary: "For municipal officers and reviewers",
    accent: "#0f766e",
    gradientFrom: "from-emerald-500/10",
    gradientTo: "to-emerald-400/10",
    badge: "LR",
  },
};

const MODAL_MIN_DIMENSIONS: React.CSSProperties = {
  minWidth: "min(100%, 800px)",
  minHeight: 556,
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
    className="space-y-8"
  >
    <div className="space-y-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
        Abu Dhabi Government Services
      </span>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Choose your workspace
        </h3>
        <p className="text-sm text-slate-600">
          Select the experience you need to demonstrate either the applicant
          journey or the reviewer console.
        </p>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {(["applicant", "reviewer"] as const).map((type) => {
        const detail = USER_TYPE_DETAILS[type];
        const isReviewer = type === "reviewer";
        const badgeStyle = isReviewer
          ? undefined
          : {
              background: `linear-gradient(140deg, ${detail.accent} 0%, ${detail.accent}cc 100%)`,
            };

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={chatCardClass(
              "group flex h-full flex-col justify-between border border-slate-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:border-slate-400 hover:shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
            )}
            aria-label={`Continue as ${detail.label}`}
            style={{
              boxShadow: "0 12px 30px -24px rgba(15, 23, 42, 0.3)",
            }}
          >
            <div className="space-y-4">
              <div
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold shadow-sm",
                  isReviewer
                    ? "border-2 border-[#0f766e] bg-white text-[#0f766e]"
                    : "text-white",
                )}
                style={badgeStyle}
              >
                {detail.badge}
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-slate-900">
                  {detail.label}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {detail.description}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {detail.secondary}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition group-hover:translate-x-0.5",
                isReviewer
                  ? "border border-[#0f766e] bg-white text-[#0f766e]"
                  : "text-white",
              )}
              style={isReviewer ? undefined : { backgroundColor: detail.accent }}
            >
              Continue
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(isReviewer ? "text-[#0f766e]" : "text-white/90")}
              >
                <path
                  d="M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.5 4l3.5 4-3.5 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
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

const LoginStepView: React.FC<LoginStepViewProps> = ({
  detail,
  isLoggingIn,
  onLogin,
}) => {
  const isReviewer = detail.badge === "LR";
  const badgeStyle = isReviewer
    ? undefined
    : {
        background: `linear-gradient(140deg, ${detail.accent} 0%, ${detail.accent}CC 100%)`,
      };

  return (
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
          Abu Dhabi Government Services
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900">
            Sign in with UAE PASS
          </h3>
          <p className="text-sm text-slate-500">
            You're continuing as{" "}
            <span className="font-semibold text-slate-900">{detail.label}</span>
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.45)]">
        <div className="flex items-start gap-4 px-6 pt-6">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-base font-semibold shadow-md",
              isReviewer
                ? "border-2 border-[#0f766e] bg-white text-[#0f766e]"
                : "text-white",
            )}
            style={badgeStyle}
          >
            {detail.badge}
          </div>
          <div className="space-y-1 text-left">
            <p className="text-sm font-semibold text-slate-900">
              {detail.label}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {detail.description}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {detail.secondary}
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          <button
            className={cn(
              "w-full flex items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
              isReviewer
                ? "border border-[#0f766e] bg-white text-[#0f766e] shadow-[0_14px_36px_-24px_rgba(15,118,110,0.28)] hover:shadow-[0_18px_42px_-26px_rgba(15,118,110,0.32)]"
                : "text-white shadow-[0_10px_30px_-15px_rgba(15,118,110,0.6)] hover:shadow-[0_18px_40px_-20px_rgba(15,23,42,0.4)]",
            )}
            type="button"
            onClick={onLogin}
            disabled={isLoggingIn}
            style={isReviewer ? undefined : { backgroundColor: detail.accent }}
          >
            {isLoggingIn ? (
              <>
                <div
                  className={cn(
                    "h-4 w-4 animate-spin rounded-full border-2 border-t-transparent",
                    isReviewer ? "border-[#0f766e]/70" : "border-white/80",
                  )}
                />
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
                  className={cn("-ml-1", isReviewer ? "text-[#0f766e]" : undefined)}
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

          <div
            className={cn(
              "rounded-xl border border-dashed px-4 py-3 text-sm",
              isReviewer
                ? "border-[#0f766e]/60 bg-white text-slate-600"
                : "border-slate-200 bg-slate-50/60 text-slate-600",
            )}
          >
            <p>
              You'll be redirected to the official UAE PASS experience to verify
              your identity securely.
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 text-center">
        A single trusted digital identity for all citizens, residents and
        visitors.
      </p>

      <div className="text-center text-sm text-slate-600">
        Need a UAE PASS account?{" "}
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
};

export const UAEPassLogin: React.FC<UAEPassLoginProps> = ({
  trigger,
  onLogin,
  onClose,
  mode = "full",
  defaultUserType = "applicant",
  autoLogin = false,
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

  useEffect(() => {
    if (!autoLogin) {
      return;
    }

    if (loginStep !== "login") {
      return;
    }

    if (isLoggingIn) {
      return;
    }

    const timer = setTimeout(() => {
      handleDirectLogin();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [autoLogin, loginStep, isLoggingIn, handleDirectLogin]);

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
      className="w-full max-w-[900px] rounded-3xl border border-white/25 bg-white/90 shadow-[0_24px_60px_-20px_rgba(24,32,63,0.28)] backdrop-blur-xl [&>div:first-child]:sr-only [&>div:first-child]:m-0 [&>div:first-child]:h-0 [&>div:first-child]:p-0 [&>div:first-child>button]:hidden"
      style={MODAL_MIN_DIMENSIONS}
    >
      <div
        className="relative mx-auto flex w-full max-w-[840px] flex-col justify-between gap-10 rounded-md border border-[#d8e4df] p-6 text-center [&>*]:w-full"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div className="flex w-full justify-end">
          <Close asChild>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={resetFlow}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.35)] transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.667 3.33301L3.33366 12.6663M3.33366 3.33301L12.667 12.6663"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Close>
        </div>

        <div className="flex justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fe6de6e62cbb84e44b95343a7667af213?format=webp&width=320"
            alt="UAE PASS logo"
            className="h-12 w-auto"
          />
        </div>

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
