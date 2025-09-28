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
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-600 rounded"></div>
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold">UAE PASS</h2>
                  <p className="text-red-100 text-xs">Digital Identity</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-200 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {loginStep === 'userType' && (
                <motion.div
                  key="userType"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Business License Registration</h3>
                    <p className="text-gray-600 text-sm">Please select your account type to continue</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleUserTypeSelect('applicant')}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Business Applicant</h4>
                          <p className="text-sm text-gray-600">Apply for new business license or renew existing license</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('reviewer')}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">License Reviewer</h4>
                          <p className="text-sm text-gray-600">Review and process business license applications</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {loginStep === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedUserType === 'applicant' ? 'Business Applicant' : 'License Reviewer'} Login
                    </h3>
                    <p className="text-gray-600 text-sm">Secure authentication with UAE PASS</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 9v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">Secure Authentication</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Emirates ID verification</li>
                        <li>• Biometric authentication</li>
                        <li>• Government-grade security</li>
                      </ul>
                    </div>

                    <button
                      onClick={handleLogin}
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <polyline points="10,17 15,12 10,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Sign in with UAE PASS
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setLoginStep('userType')}
                      className="w-full text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                      ← Back to user type selection
                    </button>
                  </div>
                </motion.div>
              )}

              {loginStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Successful</h3>
                  <p className="text-gray-600 text-sm">Redirecting to business license portal...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
