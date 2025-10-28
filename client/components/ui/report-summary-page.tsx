import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InvestmentReportDocument } from "./investment-report-document";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";

interface ReportSummaryPageProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreAnother: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  emiratesId: string;
  userType: "applicant" | "reviewer";
  role: string;
  department?: string;
}

const SoundVisualization = () => {
  const bars = [
    { height: "6px" },
    { height: "12px" },
    { height: "20px" },
    { height: "13px" },
    { height: "9px" },
    { height: "23px" },
    { height: "30px" },
    { height: "17px" },
    { height: "5px" },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-0.5 bg-[#54FFD4] rounded-full transition-all duration-300"
          style={{ height: bar.height, transform: "rotate(-90deg)" }}
        />
      ))}
    </div>
  );
};

export const ReportSummaryPage: React.FC<ReportSummaryPageProps> = ({
  isOpen,
  onClose,
  onExploreAnother,
}) => {

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="report-summary-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[70] bg-[#EDEDED]"
      >
        {/* Background Images */}
        <div className="absolute inset-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/a7a8bffe25c500330be4ffc886ca265e3825ec4a?width=2388"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/9d3fabab5ee63869d79e16d1eb8c9ed3eeb269c9?width=2388"
            alt="Background overlay"
            className="absolute -top-48 left-0 w-full h-[calc(100%+12rem)] object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-40 h-[87px] border-b border-white/30 bg-white/10 backdrop-blur-[40px]">
          <div className="flex items-center justify-between px-10 py-5 h-full">
            <div className="flex items-center gap-4">
              <svg
                width="111"
                height="50"
                viewBox="0 0 111 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z"
                  fill="white"
                />
                <path
                  d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                  fill="white"
                />
                <path
                  d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z"
                  fill="white"
                />
                <path
                  d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z"
                  fill="white"
                />
                <path
                  d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z"
                  fill="white"
                />
                <path
                  d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                  fill="white"
                />
                <path
                  d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
                  fill="white"
                />
                <path
                  d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z"
                  fill="white"
                />
                <path
                  d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                  fill="white"
                />
                <path
                  d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 15.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                  fill="white"
                />
              </svg>
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full border border-white/18 bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12L5 12M5 12L11 18M5 12L11 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="text-white text-base font-medium text-center">
              Investor Journey for a Restaurant
            </div>
            <div className="w-[111px]"></div> {/* Spacer to center the title */}
          </div>
        </div>

        {/* Notification Banner */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-6 z-30">
          <div className="bg-gradient-to-b from-white to-[#F2F1EE] rounded-2xl p-5 shadow-lg max-w-2xl">
            <div className="flex items-center gap-5">
              <div className="flex-1">
                <h3 className="text-[#282B3E] text-sm font-semibold mb-1">
                  Airline
                </h3>
                <p className="text-[#282B3E] text-sm leading-[19px]">
                  Want a +1 to Paris? You can book a second ticket at a
                  discounted price.
                </p>
              </div>
              <button className="bg-gradient-to-b from-[#5B6DDE] to-[#273489] text-white px-8 py-3 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity">
                View details
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 pt-32 px-20 h-full">
          {/* Interactive Report Document */}
          <div className="absolute left-20 top-32 max-w-3xl">
            <InvestmentReportDocument className="w-[540px] max-h-[684px] overflow-y-auto" />
          </div>

          {/* Chat UI */}
          <div className="absolute right-20 top-44 w-[454px] h-[613px]">
            <div className="bg-white/14 backdrop-blur-sm rounded-3xl border border-white/20 h-full p-6">
              {/* Al Yah Header */}
              <div className="flex items-center gap-3 mb-6">
                <AIBusinessOrb className="h-16 w-16" />
                <div className="flex-1">
                  <h3 className="text-white text-lg font-bold">Al Yah</h3>
                  <SoundVisualization />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6">
                <div className="bg-white/20 rounded-2xl p-4">
                  <p className="text-white text-base font-medium leading-[136%]">
                    Here's your comprehensive investment report for Abu Dhabi
                    Corniche. The document contains detailed demographics,
                    consumer behavior analysis, and market insights.
                  </p>
                </div>

                <div className="flex justify-end">
                  <div className="bg-black/30 rounded-2xl px-4 py-3 max-w-[200px]">
                    <p className="text-white text-sm">This looks great!</p>
                  </div>
                </div>

                <div className="bg-white/20 rounded-2xl p-4">
                  <p className="text-white text-base font-medium leading-[136%]">
                    Would you like me to automate the application process and
                    pre-fill all your information based on this analysis?
                  </p>
                </div>

                <div className="flex justify-end">
                  <div className="bg-black/30 rounded-2xl px-4 py-3 max-w-[200px]">
                    <p className="text-white text-sm">Yes please go ahead</p>
                  </div>
                </div>

                <div className="bg-white/20 rounded-2xl p-4">
                  <p className="text-white text-base font-medium leading-[136%]">
                    Perfect! Click the UAE Pass button below to access the
                    business license registration portal
                  </p>
                </div>

                {/* Direct Portal Access */}
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => {
                      // Navigate to applicant portal
                      window.location.href = '/portal/applicant';
                    }}
                    className="inline-flex cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0f766e] transform transition-transform duration-200 hover:scale-105"
                  >
                    <img
                      src="https://api.builder.io/api/v1/image/assets/TEMP/6af0c42146feff37d8c56f7d5b67c0ce1e2c12e1?width=348"
                      alt="Access Business Portal"
                      className="h-21 rounded-full shadow-lg transition-shadow duration-200 hover:shadow-xl"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Explore Another Investment Button */}
          <div className="absolute bottom-20 right-20">
            <button
              onClick={onExploreAnother}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-white bg-transparent hover:bg-white/10 transition-colors"
            >
              <span className="text-white text-base font-semibold">
                + Explore Another investment
              </span>
            </button>
          </div>
        </div>
      </motion.div>

    </AnimatePresence>
  );
};
