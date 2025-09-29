import React, { useState, useRef, useCallback } from 'react';
import { Modal, Close } from '@aegov/design-system-react';
import { DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';

interface UAEPassLoginProps {
  trigger: React.ReactElement;
  onLogin: (userType: 'applicant' | 'reviewer', userData: any) => void;
  onClose?: () => void;
}

type UserType = 'applicant' | 'reviewer' | null;

type LoginStep = 'userType' | 'login' | 'success';

export const UAEPassLogin: React.FC<UAEPassLoginProps> = ({ trigger, onLogin, onClose }) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState<LoginStep>('userType');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const resetFlow = useCallback(() => {
    setSelectedUserType(null);
    setIsLoggingIn(false);
    setLoginStep('userType');
    onClose?.();
  }, [onClose]);

  const handleUserTypeSelect = (type: UserType) => {
    if (!type) return;
    setSelectedUserType(type);
    setLoginStep('login');
  };

  const handleLogin = async () => {
    if (!selectedUserType) return;
    setIsLoggingIn(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoginStep('success');

    setTimeout(() => {
      const mockUserData = {
        id: `${selectedUserType}-${Date.now()}`,
        name: selectedUserType === 'applicant' ? 'Ahmed Al Mansoori' : 'Sarah Al Zaabi',
        email: selectedUserType === 'applicant' ? 'ahmed.almansoori@email.ae' : 'sarah.alzaabi@adm.ae',
        emiratesId: selectedUserType === 'applicant' ? '784-1985-1234567-8' : '784-1982-7654321-2',
        userType: selectedUserType,
        role: selectedUserType === 'applicant' ? 'Business Applicant' : 'License Reviewer',
        department: selectedUserType === 'reviewer' ? 'Abu Dhabi Municipality' : undefined,
      };

      onLogin(selectedUserType, mockUserData);
      setIsLoggingIn(false);
      closeButtonRef.current?.click();
    }, 1200);
  };

  const enhancedTrigger = React.cloneElement(trigger, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      resetFlow();
      if (typeof trigger.props.onClick === 'function') {
        trigger.props.onClick(event);
      }
    },
  });

  return (
    <Modal
      trigger={enhancedTrigger}
      size="md"
      className="rounded-3xl border border-white/25 bg-white/90 shadow-[0_24px_60px_-20px_rgba(24,32,63,0.28)] backdrop-blur-xl sm:max-w-md"
    >
      <div className="space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">UAE Pass</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">
              Continue with UAE PASS to access your workspace.
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </Close>
        </header>

        <AnimatePresence mode="wait">
          {loginStep === 'userType' && (
            <motion.div
              key="userType"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-500">
                Choose how you'd like to continue with UAE PASS.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleUserTypeSelect('applicant')}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_12px_32px_-20px_rgba(24,32,63,0.55)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition group-hover:border-slate-900 group-hover:text-slate-900">
                      BA
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">Business applicant</span>
                      <span className="block text-xs text-slate-500">Start or renew a business license.</span>
                    </span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400 transition group-hover:text-slate-700">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => handleUserTypeSelect('reviewer')}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-all duration-200 hover:border-slate-900 hover:shadow-[0_12px_32px_-20px_rgba(24,32,63,0.55)]"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition group-hover:border-slate-900 group-hover:text-slate-900">
                      LR
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">License reviewer</span>
                      <span className="block text-xs text-slate-500">Review and approve applications.</span>
                    </span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400 transition group-hover:text-slate-700">
                    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {loginStep === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15v5m0-11v1m0 10a10 10 0 1 0-10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  Continue as {selectedUserType === 'applicant' ? 'business applicant' : 'license reviewer'}
                </h3>
                <p className="text-sm text-slate-500">We'll redirect you to UAE PASS to finish signing in.</p>
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Continue with UAE PASS
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLoginStep('userType')}
                className="w-full rounded-full border border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Back to account options
              </button>
            </motion.div>
          )}

          {loginStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-4 py-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">You're signed in</h3>
              <p className="text-sm text-slate-500">We’re preparing your business license portal…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
