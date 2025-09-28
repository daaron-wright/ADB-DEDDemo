import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface Application {
  id: string;
  applicantName: string;
  businessName: string;
  businessType: string;
  location: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
}

const mockApplications: Application[] = [
  {
    id: 'APP-2024-001',
    applicantName: 'Ahmed Al Mansoori',
    businessName: 'Corniche Fine Dining',
    businessType: 'Restaurant',
    location: 'Abu Dhabi Corniche',
    status: 'pending',
    submittedDate: '2024-01-15'
  },
  {
    id: 'APP-2024-002',
    applicantName: 'Fatima Al Zahra',
    businessName: 'Quick Bites Express',
    businessType: 'Fast Food',
    location: 'Al Khalidiya',
    status: 'under_review',
    submittedDate: '2024-01-12'
  },
  {
    id: 'APP-2024-003',
    applicantName: 'Omar Al Rashid',
    businessName: 'Tech Solutions Branch',
    businessType: 'Branch Office',
    location: 'ADGM',
    status: 'approved',
    submittedDate: '2024-01-10'
  }
];

const ApplicantView: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [selectedActivities, setSelectedActivities] = useState(['Full-service restaurant']);

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <div className="w-full h-screen bg-[#0B0C28] relative overflow-hidden">
      {/* Complex background with gradients and filters */}
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
              <path d="M77.7755 38.9245V31.2002H79.5277V32.1853C80.0126 31.4191 80.8574 30.9657 81.7648 30.9813C82.7347 30.9344 83.6421 31.466 84.0645 32.3416C84.5651 31.4504 85.535 30.9187 86.5519 30.9813C87.9442 30.9813 89.2583 31.8726 89.2583 33.9209V38.9245H87.4905V34.2336C87.4905 33.3267 87.0369 32.6544 86.02 32.6544C85.1439 32.6544 84.4243 33.3736 84.4243 34.2649C84.4243 34.2962 84.4243 34.3118 84.4243 34.3431V38.9245H82.6252V34.2493C82.6252 33.358 82.1872 32.67 81.1547 32.67C80.2942 32.6544 79.5746 33.358 79.5589 34.218C79.5589 34.2649 79.5589 34.3118 79.5589 34.3587V38.9401L77.7755 38.9245Z" fill="white"/>
              <path d="M91.511 38.9245V31.2002H93.2631V32.1853C93.7481 31.4191 94.5929 30.9657 95.5003 30.9813C96.4702 30.9344 97.3775 31.466 97.7999 32.3416C98.3006 31.4504 99.2549 30.9187 100.272 30.9813C101.664 30.9813 102.978 31.8726 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.053 32.6544C99.9588 32.6387 99.865 32.6387 99.7868 32.6387C98.9107 32.6387 98.191 33.358 98.191 34.2493C98.191 34.2805 98.191 34.2962 98.191 34.3274V38.9088H96.4076V34.2336C96.5015 33.4674 95.9696 32.7638 95.203 32.6544C95.1091 32.6387 95.0153 32.6387 94.9371 32.6387C94.0766 32.6231 93.357 33.3267 93.3414 34.1867C93.3414 34.2336 93.3414 34.2805 93.3414 34.3274V38.9088L91.511 38.9245Z" fill="white"/>
              <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
            </svg>
          </div>

          {/* Center Title */}
          <div className="text-white text-center font-['DM_Sans'] text-base font-medium leading-[130%]">
            Investor Journey for a Restaurant
          </div>

          {/* Right Title */}
          <div className="text-white text-right font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
            Business License Registration
          </div>
        </div>
      </div>

      {/* Progress Steps Bar */}
      <div className="absolute top-[87px] left-0 w-full h-20 bg-white/30 backdrop-blur-[40px] flex items-center justify-center z-10">
        <div className="flex w-full h-full">
          {/* Questionnaire - Active */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 bg-white/10">
            <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
              Questionnaire
            </div>
            <div className="w-6 h-6">
              <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.4001 1.50024C10.3234 1.50024 8.29333 2.11606 6.56661 3.26981C4.83989 4.42357 3.49408 6.06344 2.69936 7.98207C1.90464 9.90069 1.69671 12.0119 2.10185 14.0487C2.507 16.0855 3.50703 17.9564 4.97548 19.4249C6.44393 20.8933 8.31485 21.8933 10.3517 22.2985C12.3885 22.7036 14.4997 22.4957 16.4183 21.701C18.3369 20.9063 19.9768 19.5604 21.1305 17.8337C22.2843 16.107 22.9001 14.0769 22.9001 12.0002C22.9001 9.21547 21.7938 6.54475 19.8247 4.57562C17.8556 2.60649 15.1849 1.50024 12.4001 1.50024ZM12.4001 21.0002C10.6201 21.0002 8.88001 20.4724 7.39997 19.4835C5.91992 18.4945 4.76637 17.0889 4.08518 15.4444C3.40399 13.7999 3.22576 11.9903 3.57303 10.2444C3.9203 8.4986 4.77746 6.89496 6.03614 5.63628C7.29481 4.37761 8.89846 3.52044 10.6443 3.17318C12.3901 2.82591 14.1997 3.00414 15.8442 3.68533C17.4888 4.36652 18.8944 5.52007 19.8833 7.00011C20.8723 8.48015 21.4001 10.2202 21.4001 12.0002C21.4001 14.3872 20.4519 16.6764 18.7641 18.3642C17.0762 20.052 14.787 21.0002 12.4001 21.0002Z" fill="white"/>
              </svg>
            </div>
          </div>

          {/* Other steps - Inactive */}
          {[
            'Business Registration',
            'Submit Documents',
            'Business Licensing',
            'Pre-Operational Inspection'
          ].map((step, index) => (
            <div key={step} className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 opacity-50">
              <div className="text-white text-center font-['Manrope'] text-sm font-semibold leading-[133%]">
                {step}
              </div>
              <div className="w-6 h-6">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.2 1.50024C10.1233 1.50024 8.09328 2.11606 6.36656 3.26981C4.63984 4.42357 3.29403 6.06344 2.49931 7.98207C1.70459 9.90069 1.49666 12.0119 1.9018 14.0487C2.30695 16.0855 3.30697 17.9564 4.77543 19.4249C6.24388 20.8933 8.1148 21.8933 10.1516 22.2985C12.1884 22.7036 14.2996 22.4957 16.2182 21.701C18.1368 20.9063 19.7767 19.5604 20.9305 17.8337C22.0842 16.107 22.7 14.0769 22.7 12.0002C22.7 9.21547 21.5938 6.54475 19.6247 4.57562C17.6555 2.60649 14.9848 1.50024 12.2 1.50024ZM12.2 21.0002C10.42 21.0002 8.67996 20.4724 7.19992 19.4835C5.71987 18.4945 4.56632 17.0889 3.88513 15.4444C3.20394 13.7999 3.02571 11.9903 3.37298 10.2444C3.72025 8.4986 4.57741 6.89496 5.83609 5.63628C7.09476 4.37761 8.69841 3.52044 10.4442 3.17318C12.1901 2.82591 13.9997 3.00414 15.6442 3.68533C17.2887 4.36652 18.6943 5.52007 19.6833 7.00011C20.6722 8.48015 21.2 10.2202 21.2 12.0002C21.2 14.3872 20.2518 16.6764 18.564 18.3642C16.8762 20.052 14.587 21.0002 12.2 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute top-[167px] left-0 w-full h-[calc(100vh-167px)] flex gap-6 px-11 py-12">
        {/* Left Panel - Form */}
        <div className="w-[633px] h-[1030px] bg-white/14 rounded-3xl opacity-80 relative">
          <div className="absolute top-6 left-8 right-8">
            <div className="flex items-center justify-between mb-12">
              <div className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
                Journey Number: 0987654321
              </div>
              <div className="text-[#54FFD4] font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px]">
                2 of 8 complete
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0 bg-white/18 mb-8"></div>

            {/* Legal Structure Section */}
            <div className="mb-16">
              <h3 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px] mb-8">
                1. Legal Structure
              </h3>

              <div className="space-y-7">
                {/* New Business - Limited Liability Company */}
                <div className="flex items-center gap-10">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.4999 0.9375C18.0968 0.9375 21.5462 2.36675 24.0897 4.91016C26.6332 7.45361 28.0624 10.903 28.0624 14.5C28.0624 17.1824 27.2675 19.8048 25.7772 22.0352C24.2869 24.2655 22.1685 26.0038 19.6903 27.0303C17.2121 28.0568 14.4852 28.325 11.8543 27.8018C9.22348 27.2784 6.80676 25.9866 4.91001 24.0898C3.01331 22.1931 1.7214 19.7763 1.1981 17.1455C0.674894 14.5148 0.943121 11.7877 1.96958 9.30957C2.99603 6.83158 4.73463 4.71385 6.9647 3.22363C9.19499 1.7334 11.8175 0.937533 14.4999 0.9375ZM18.9491 3.75977C16.8249 2.87991 14.4873 2.65011 12.2323 3.09863C9.97725 3.54719 7.90591 4.65449 6.28013 6.28027C4.65438 7.90605 3.54703 9.97743 3.09849 12.2324C2.65005 14.4872 2.87996 16.8243 3.75962 18.9482C4.63949 21.0724 6.13013 22.8886 8.04185 24.166C9.95346 25.4432 12.2008 26.125 14.4999 26.125C17.583 26.125 20.5404 24.8998 22.7206 22.7197C24.9004 20.5397 26.1249 17.5829 26.1249 14.5C26.1249 12.2009 25.4431 9.95364 24.1659 8.04199C22.8885 6.13035 21.0732 4.63965 18.9491 3.75977ZM21.2811 11.0264L12.5624 19.7441L7.71861 14.8994L9.08775 13.5312L12.5624 17.0049L19.91 9.65625L21.2811 11.0264Z" fill="#54FFD4"/>
                    </svg>
                  </div>
                  <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
                    New Business - Limited Liability Company
                  </div>
                </div>

                {/* Ownership - Single Owner */}
                <div className="flex items-center gap-10">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.4999 0.9375C18.0968 0.9375 21.5462 2.36675 24.0897 4.91016C26.6332 7.45361 28.0624 10.903 28.0624 14.5C28.0624 17.1824 27.2675 19.8048 25.7772 22.0352C24.2869 24.2655 22.1685 26.0038 19.6903 27.0303C17.2121 28.0568 14.4852 28.325 11.8543 27.8018C9.22348 27.2784 6.80676 25.9866 4.91001 24.0898C3.01331 22.1931 1.7214 19.7763 1.1981 17.1455C0.674894 14.5148 0.943121 11.7877 1.96958 9.30957C2.99603 6.83158 4.73463 4.71385 6.9647 3.22363C9.19499 1.7334 11.8175 0.937533 14.4999 0.9375ZM18.9491 3.75977C16.8249 2.87991 14.4873 2.65011 12.2323 3.09863C9.97725 3.54719 7.90591 4.65449 6.28013 6.28027C4.65438 7.90605 3.54703 9.97743 3.09849 12.2324C2.65005 14.4872 2.87996 16.8243 3.75962 18.9482C4.63949 21.0724 6.13013 22.8886 8.04185 24.166C9.95346 25.4432 12.2008 26.125 14.4999 26.125C17.583 26.125 20.5404 24.8998 22.7206 22.7197C24.9004 20.5397 26.1249 17.5829 26.1249 14.5C26.1249 12.2009 25.4431 9.95364 24.1659 8.04199C22.8885 6.13035 21.0732 4.63965 18.9491 3.75977ZM21.2811 11.0264L12.5624 19.7441L7.71861 14.8994L9.08775 13.5312L12.5624 17.0049L19.91 9.65625L21.2811 11.0264Z" fill="#54FFD4"/>
                    </svg>
                  </div>
                  <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
                    Ownership - Single Owner
                  </div>
                </div>

                {/* Nationality - UAE National */}
                <div className="flex items-center gap-10">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.0003 0C17.7132 7.17267e-05 21.2742 1.47514 23.8997 4.10059C26.5251 6.72607 28.0003 10.287 28.0003 14C28.0003 17.7129 26.5251 21.2739 23.8997 23.8994C21.2742 26.5249 17.7132 27.9999 14.0003 28V26C17.1828 25.9999 20.2353 24.7357 22.4856 22.4854C24.736 20.2349 26.0003 17.1825 26.0003 14C26.0003 10.8175 24.736 7.76506 22.4856 5.51465C20.2353 3.26428 17.1828 2.00007 14.0003 2V0ZM6.23953 23.1406C7.31689 24.0483 8.54651 24.7587 9.87039 25.2402L9.17996 27.1104C7.6537 26.5498 6.23885 25.7233 5.00027 24.6699L6.23953 23.1406ZM2.18973 16C2.42418 17.4036 2.8981 18.7566 3.59012 20L1.85965 21C1.04008 19.579 0.474926 18.0256 0.189728 16.4102L2.18973 16ZM3.59012 8C2.90902 9.22052 2.44529 10.5503 2.22 11.9297L0.220001 11.5898C0.501306 9.97773 1.05567 8.42536 1.85965 7L3.59012 8ZM9.81961 2.76074C8.51354 3.24749 7.3017 3.95784 6.23953 4.86035L5.00027 3.33008C6.22375 2.28183 7.62163 1.45639 9.13016 0.890625L9.81961 2.76074Z" fill="#54FFD4"/>
                    </svg>
                  </div>
                  <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
                    Nationality - UAE National
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0 bg-white/18 mb-8"></div>

            {/* Business Activities Section */}
            <div className="mb-16">
              <h3 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px] mb-2">
                2. Business Activities
              </h3>
              <p className="text-white font-['DM_Sans'] text-sm font-normal leading-[160%] tracking-[0.045px] mb-8">
                Choose from the below AI recommended activities
              </p>

              <div className="space-y-7">
                {[
                  'Full-service restaurant',
                  'Charcoal/coal BBQ services',
                  'Hospitality and catering services'
                ].map((activity) => (
                  <div key={activity} className="flex items-center gap-10">
                    <div className="w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.0001 2C13.2312 2 10.5244 2.82109 8.22211 4.35943C5.91983 5.89776 4.12541 8.08427 3.06578 10.6424C2.00616 13.2006 1.72891 16.0155 2.2691 18.7313C2.8093 21.447 4.14267 23.9416 6.1006 25.8995C8.05854 27.8574 10.5531 29.1908 13.2688 29.731C15.9846 30.2712 18.7995 29.9939 21.3577 28.9343C23.9158 27.8747 26.1023 26.0803 27.6407 23.778C29.179 21.4757 30.0001 18.7689 30.0001 16C30.0001 12.287 28.5251 8.72601 25.8996 6.1005C23.2741 3.475 19.7131 2 16.0001 2ZM16.0001 28C13.6267 28 11.3066 27.2962 9.33325 25.9776C7.35986 24.6591 5.82179 22.7849 4.91354 20.5922C4.00529 18.3995 3.76765 15.9867 4.23067 13.6589C4.6937 11.3311 5.83659 9.19295 7.51482 7.51472C9.19305 5.83649 11.3312 4.6936 13.659 4.23058C15.9868 3.76755 18.3996 4.00519 20.5923 4.91345C22.785 5.8217 24.6592 7.35977 25.9777 9.33316C27.2963 11.3065 28.0001 13.6266 28.0001 16C28.0001 19.1826 26.7358 22.2348 24.4854 24.4853C22.2349 26.7357 19.1827 28 16.0001 28Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                      {activity}
                    </div>
                  </div>
                ))}

                {/* Add a new activity */}
                <div className="flex items-center gap-10">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-8 h-8 border border-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                    Add a new activity
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-0 bg-white/18 mb-8"></div>

            {/* Physical Space Requirements Section */}
            <div>
              <h3 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px] mb-8">
                3. Physical Space Requirements
              </h3>

              <div className="space-y-7">
                {[
                  'Step 1: Business Registration',
                  'Step 2: Submission of Documents',
                  'Step 3: Business Licensing',
                  'Step 4: Pre-Operational Inspection'
                ].map((step) => (
                  <div key={step} className="flex items-center gap-10">
                    <div className="w-8 h-8">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.0001 2C13.2312 2 10.5244 2.82109 8.22211 4.35943C5.91983 5.89776 4.12541 8.08427 3.06578 10.6424C2.00616 13.2006 1.72891 16.0155 2.2691 18.7313C2.8093 21.447 4.14267 23.9416 6.1006 25.8995C8.05854 27.8574 10.5531 29.1908 13.2688 29.731C15.9846 30.2712 18.7995 29.9939 21.3577 28.9343C23.9158 27.8747 26.1023 26.0803 27.6407 23.778C29.179 21.4757 30.0001 18.7689 30.0001 16C30.0001 12.287 28.5251 8.72601 25.8996 6.1005C23.2741 3.475 19.7131 2 16.0001 2ZM16.0001 28C13.6267 28 11.3066 27.2962 9.33325 25.9776C7.35986 24.6591 5.82179 22.7849 4.91354 20.5922C4.00529 18.3995 3.76765 15.9867 4.23067 13.6589C4.6937 11.3311 5.83659 9.19295 7.51482 7.51472C9.19305 5.83649 11.3312 4.6936 13.659 4.23058C15.9868 3.76755 18.3996 4.00519 20.5923 4.91345C22.785 5.8217 24.6592 7.35977 25.9777 9.33316C27.2963 11.3065 28.0001 13.6266 28.0001 16C28.0001 19.1826 26.7358 22.2348 24.4854 24.4853C22.2349 26.7357 19.1827 28 16.0001 28Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Assistant */}
        <div className="w-[446px] h-[426px] bg-white/20 rounded-3xl shadow-[0_4px_44px_0_#169F9F] relative">
          {/* Header */}
          <div className="absolute top-4 left-6 right-6 h-[77px]">
            <div className="flex items-center gap-2 p-3">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                alt="AI Assistant"
                className="w-16 h-16 rounded-full border border-[#54FFD4]"
              />
              <div className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
                AI Business
              </div>
              <div className="flex items-center gap-0.5 ml-auto">
                {[5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499, 16.898, 4.534].map((width, i) => (
                  <div
                    key={i}
                    className="bg-[#54FFD4] rounded-[15.737px] transform -rotate-90"
                    style={{ width: `${width}px`, height: '3.297px' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="absolute top-[119px] left-6 right-6">
            <div className="text-white font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px] mb-4">
              Generating application...
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-[275px] h-[19px] bg-gray-600 rounded overflow-hidden">
                <div className="h-full bg-[#54FFD4] w-[15%]"></div>
              </div>
            </div>

            <div className="text-white font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px] mb-8">
              15% complete
            </div>
          </div>

          {/* Divider */}
          <div className="absolute top-[242px] left-0 right-0 h-0 bg-white/18"></div>

          {/* Key Considerations */}
          <div className="absolute top-[266px] left-6 right-6 bottom-6">
            <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
              Key considerations:<br />
              1. Legal Structure.<br />
              2. Business Activities.<br />
              3. Physical Space.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewerView: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (appId: string, newStatus: Application['status']) => {
    setApplications(apps => 
      apps.map(app => 
        app.id === appId 
          ? { ...app, status: newStatus, reviewedBy: user.name }
          : app
      )
    );
    setSelectedApp(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">License Review Dashboard</h1>
            <p className="text-gray-600">Review and process business license applications</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Reviewer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{user.name}</h3>
              <p className="text-sm text-blue-700">{user.department} • {user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 text-sm font-medium">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-800">
            {applications.filter(app => app.status === 'pending').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Under Review</div>
          <div className="text-2xl font-bold text-blue-800">
            {applications.filter(app => app.status === 'under_review').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-800">
            {applications.filter(app => app.status === 'approved').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-800">
            {applications.filter(app => app.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.applicantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.businessName}</div>
                    <div className="text-sm text-gray-500">{app.businessType} • {app.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.submittedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Application: {selectedApp.id}</h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div><span className="font-medium">Applicant:</span> {selectedApp.applicantName}</div>
                  <div><span className="font-medium">Business Name:</span> {selectedApp.businessName}</div>
                  <div><span className="font-medium">Type:</span> {selectedApp.businessType}</div>
                  <div><span className="font-medium">Location:</span> {selectedApp.location}</div>
                  <div><span className="font-medium">Current Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApp.status)}`}>
                      {selectedApp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'under_review')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BusinessLicensePortal: React.FC<BusinessLicensePortalProps> = ({ isOpen, user, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-gray-100 overflow-y-auto"
    >
      {user.userType === 'applicant' ? (
        <ApplicantView user={user} onClose={onClose} />
      ) : (
        <ReviewerView user={user} onClose={onClose} />
      )}
    </motion.div>
  );
};
