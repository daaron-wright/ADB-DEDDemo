import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UAEPassLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userType: 'applicant' | 'reviewer', userData: any) => void;
}

type UserType = 'applicant' | 'reviewer' | null;

export const UAEPassLogin: React.FC<UAEPassLoginProps> = ({ isOpen, onClose, onLogin }) => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStep, setLoginStep] = useState<'userType' | 'login' | 'success'>('userType');

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    setLoginStep('login');
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    
    // Simulate UAE PASS authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoginStep('success');
    
    // Complete login after a brief success display
    setTimeout(() => {
      const mockUserData = {
        id: `${selectedUserType}-${Date.now()}`,
        name: selectedUserType === 'applicant' ? 'Ahmed Al Mansoori' : 'Sarah Al Zaabi',
        email: selectedUserType === 'applicant' ? 'ahmed.almansoori@email.ae' : 'sarah.alzaabi@adm.ae',
        emiratesId: selectedUserType === 'applicant' ? '784-1985-1234567-8' : '784-1982-7654321-2',
        userType: selectedUserType,
        role: selectedUserType === 'applicant' ? 'Business Applicant' : 'License Reviewer',
        department: selectedUserType === 'reviewer' ? 'Abu Dhabi Municipality' : undefined
      };
      
      onLogin(selectedUserType!, mockUserData);
      setIsLoggingIn(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between px-5 pt-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
              <p className="text-sm text-slate-500">Continue with UAE PASS to access your workspace.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="px-5 pb-5 pt-4">
            <AnimatePresence mode="wait">
              {loginStep === 'userType' && (
                <motion.div
                  key="userType"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-500">Choose how you'd like to continue with UAE PASS.</p>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleUserTypeSelect('applicant')}
                      className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-900 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 group-hover:border-slate-900 group-hover:text-slate-900">BA</span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">Business applicant</span>
                          <span className="block text-xs text-slate-500">Start or renew a business license.</span>
                        </span>
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400 group-hover:text-slate-600">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUserTypeSelect('reviewer')}
                      className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-900 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 group-hover:border-slate-900 group-hover:text-slate-900">LR</span>
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">License reviewer</span>
                          <span className="block text-xs text-slate-500">Review and approve applications.</span>
                        </span>
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400 group-hover:text-slate-600">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {loginStep === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="space-y-2 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-600">
                        <path d="M12 15v5m0-11v1m0 10a10 10 0 1 0-10-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Continue as {selectedUserType === 'applicant' ? 'business applicant' : 'license reviewer'}
                    </h3>
                    <p className="text-sm text-slate-500">We'll redirect you to UAE PASS to finish signing in.</p>
                  </div>

                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
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
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                    className="w-full rounded-lg border border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Back to account options
                  </button>
                </motion.div>
              )}

              {loginStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 py-6 text-center"
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
