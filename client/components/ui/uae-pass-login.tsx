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
        setLoginStep("fingerprint");
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
      <div className="space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              UAE Pass
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {mode === "quick" ? "Fingerprint quick sign-in" : "Sign in"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === "quick"
                ? "Authenticate instantly with your UAE PASS fingerprint."
                : "Continue with UAE PASS to access your workspace."}
            </p>
          </div>
          <Close asChild>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={resetFlow}
              className="rounded-full p-2 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
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
        </header>

        <AnimatePresence mode="wait">
          {mode === "full" && loginStep === "userType" && (
            <motion.div
              key="userType"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-500">
                Choose how you'd like to continue with UAE PASS.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleUserTypeSelect("applicant")}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_12px_32px_-20px_rgba(24,32,63,0.55)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition group-hover:border-slate-900 group-hover:text-slate-900">
                      BA
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        Business applicant
                      </span>
                      <span className="block text-xs text-slate-500">
                        Start or renew a business license.
                      </span>
                    </span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-slate-400 transition group-hover:text-slate-700"
                  >
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleUserTypeSelect("reviewer")}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_12px_32px_-20px_rgba(24,32,63,0.55)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition group-hover:border-slate-900 group-hover:text-slate-900">
                      LR
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">
                        License reviewer
                      </span>
                      <span className="block text-xs text-slate-500">
                        Review and approve applications.
                      </span>
                    </span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-slate-400 transition group-hover:text-slate-700"
                  >
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {mode === "full" && loginStep === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15v5m0-11v1m0 10a10 10 0 1 0-10-10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Continue as{" "}
                  {selectedUserType === "applicant"
                    ? "business applicant"
                    : "license reviewer"}
                </h3>
                <p className="text-sm text-slate-500">
                  We'll redirect you to UAE PASS to finish signing in.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500">
                <p className="font-medium text-slate-600">What stays secure</p>
                <ul className="space-y-1">
                  <li>• Verified Emirates ID details</li>
                  <li>• Biometric confirmation</li>
                  <li>• Government-grade encryption</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-14px_rgba(24,32,63,0.55)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                    Connecting to UAE PASS…
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 7l5 5-5 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M15 12H3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Continue with UAE PASS
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLoginStep("userType")}
                className="w-full rounded-full border border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Back to account options
              </button>
            </motion.div>
          )}

          {mode === "quick" && loginStep === "fingerprint" && (
            <motion.div
              key="fingerprint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col items-center gap-6 py-4"
            >
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_20px_45px_-30px_rgba(24,32,63,0.45)]">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[#54FFD4]/40"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.2, 0.55] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-[#54FFD4]/30"
                  animate={{
                    scale: [0.95, 1.03, 0.95],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                {isLoggingIn && (
                  <motion.div
                    className="absolute inset-3 overflow-hidden rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-[#54FFD4]/45 via-transparent to-[#54FFD4]/20"
                      animate={{ y: ["100%", "-100%"] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                )}
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10"
                >
                  <g
                    stroke="#0F172A"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M32 9C20.402 9 11 18.402 11 30" />
                    <path d="M32 15C23.163 15 16 22.163 16 31" />
                    <path d="M32 21C26.477 21 22 25.477 22 31" />
                    <path d="M32 27C29.239 27 27 29.239 27 32" />
                    <path d="M32 33c0 6 2 11 4 15" />
                    <path d="M24 33c0 8 3 14 5.5 18.5" />
                    <path d="M39 31c0 9-3 16-5.2 20.2" />
                    <path d="M45 28c0 10-3 18-6 23" />
                  </g>
                </svg>
              </div>

              <div className="space-y-2 text-center">
                <h3 className="text-base font-semibold text-slate-900">
                  Confirm with UAE PASS
                </h3>
                <p className="text-sm text-slate-500">
                  Place your finger on the sensor to sign in securely.
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
                {mode === "quick" ? "Fingerprint verified" : "You're signed in"}
              </h3>
              <p className="text-sm text-slate-500">
                {mode === "quick"
                  ? "We’re getting your workspace ready…"
                  : "We’re preparing your business license portal…"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
