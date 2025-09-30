import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AI_ASSISTANT_PROFILE } from "@/lib/profile";

// Animation variants for the AI chat interface
const barVariants = {
  animate: {
    height: ["3px", "30px", "15px", "25px", "8px", "35px", "20px", "12px", "5px"],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

const barItemVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export default function CompilationDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0C28] relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0">
        <div className="absolute -top-96 -left-96 w-[2310px] h-[1719px] rounded-full bg-gradient-to-br from-[#0E0A2B] via-[#0E0A2B] to-transparent opacity-40 blur-[400px]" />
        <div className="absolute top-8 left-60 w-[1227px] h-[934px] rounded-full bg-gradient-to-br from-[#0919B6] to-transparent opacity-30 blur-[400px] rotate-[30deg]" />
        <div className="absolute -top-[1319px] left-[169px] w-[1587px] h-[2140px] rounded-full bg-gradient-to-br from-[#07D2FB] to-transparent opacity-20 blur-[280px]" />
        <div className="absolute -top-[1173px] -left-[79px] w-[1720px] h-[2196px] rounded-full bg-gradient-to-br from-[#21FCC6] to-transparent opacity-25 blur-[400px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Tamm Logo */}
          <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z" fill="white"/>
            <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="white"/>
            <path d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z" fill="white"/>
            <path d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z" fill="white"/>
            <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill="white"/>
            <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="white"/>
            <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill="white"/>
            <path d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z" fill="white"/>
            <path d="M29.3916 31.1085C27.5925 32.4376 26.4036 33.1099 25.2616 33.1099C22.8211 33.1099 20.8968 31.0616 20.8968 31.0616L20.2085 33.7197C21.6634 34.8455 23.4155 35.4866 25.2616 35.5804C26.7478 35.5804 28.2027 34.9237 30.1582 33.5946L29.5011 30.999L29.3916 31.1085Z" fill="white"/>
            <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
          </svg>
        </div>
        
        <h1 className="text-white text-center text-base font-medium">
          Investor Journey for a Restaurant
        </h1>
        
        <div className="w-[111px]" /> {/* Spacer for center alignment */}
      </header>

      {/* Main Content */}
      <div className="relative z-10 p-4 lg:p-8">
        {/* Notification Banner */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-8 w-full max-w-[605px] h-[103px] rounded-[20px] bg-gradient-to-b from-white to-[#F2F1EE] shadow-[0_0_10px_10px_rgba(0,0,0,0.07)]"
        >
          <div className="flex items-center gap-5 h-full px-5">
            <div className="flex-1">
              <div className="text-[#282B3E] font-semibold text-sm mb-1">Airline</div>
              <div className="text-[#282B3E] text-sm leading-[19px]">
                Want a +1 to Paris? You can book a second ticket at a discounted price.
              </div>
            </div>
            <button className="w-[138px] h-10 rounded-full bg-gradient-to-b from-[#5B6DDE] to-[#273489] text-white text-xs font-semibold">
              View details
            </button>
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="space-y-6">
            {/* AI Business Chat Interface */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={AI_ASSISTANT_PROFILE.avatar}
                  alt={AI_ASSISTANT_PROFILE.name}
                  className="w-16 h-16 rounded-full border border-[#54FFD4]"
                />
                <div>
                  <h3 className="text-white text-lg font-semibold">AI Business</h3>
                  <motion.div 
                    variants={barVariants}
                    animate="animate"
                    className="flex items-center gap-1 mt-2"
                  >
                    {[5.77, 11.95, 19.78, 13.19, 8.66, 23.08, 30.5, 16.9, 4.53].map((height, index) => (
                      <motion.div
                        key={index}
                        variants={barItemVariants}
                        className="bg-[#54FFD4] rounded-full"
                        style={{ 
                          width: '3px',
                          height: `${height}px`,
                          transform: 'rotate(-90deg)'
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Visitor Taste Trends Chart */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-[33px] p-4 shadow-lg border border-[#EFEFEF]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-black text-[11px] font-semibold">Visitor Taste Trends</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6.24" cy="6.24" r="4.5" fill="#888888"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.97 4.69C7.04 4.57 7.08 4.42 7.08 4.27C7.08 3.81 6.71 3.43 6.24 3.43C5.78 3.43 5.4 3.81 5.4 4.27C5.4 4.74 5.78 5.12 6.24 5.12C6.55 5.12 6.83 4.94 6.97 4.69ZM5.68 5.68H5.96H6.52C6.83 5.68 7.08 5.93 7.08 6.24V6.8V9.05C7.08 9.36 6.83 9.61 6.52 9.61C6.21 9.61 5.96 9.36 5.96 9.05V7.22C5.96 6.99 5.77 6.8 5.54 6.8C5.31 6.8 5.12 6.61 5.12 6.38V6.24C5.12 6.04 5.22 5.87 5.37 5.77C5.46 5.71 5.57 5.68 5.68 5.68Z" fill="white"/>
                  </svg>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 border border-[#E0E0E0] rounded-full bg-white text-xs text-[#888]">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5.76 11.18H2.95V8.36M8.01 3.3H10.82V6.12" stroke="#888888" strokeWidth="0.84" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-[#878787] text-[10px] mb-1">Total survey this month</div>
                <div className="text-black text-2xl font-semibold">1230</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 px-2 py-1 border border-[#D9D9D9] rounded-full bg-[#EEE] text-xs">
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                      <path d="M4.87 3.02V7.58H4.12V3.02L2.11 5.03L1.58 4.5L4.49 1.59L7.41 4.5L6.88 5.03L4.87 3.02Z" fill="#434343"/>
                    </svg>
                    <span className="text-[#434343]">12%</span>
                  </div>
                  <span className="text-[#878787] text-xs">vs last month</span>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="relative h-32 mb-4">
                <div className="absolute inset-0 flex items-end gap-6 px-3">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex justify-between opacity-20">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="w-px h-full bg-[#E9E9E9]" />
                    ))}
                  </div>
                  
                  {/* Bars */}
                  <div className="flex items-end gap-8 w-full">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-16 bg-[#E29F37] rounded mb-2" />
                      <span className="text-[8px] text-[#878787]">Tourists lean toward Emirati + Asian</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-24 bg-[#429195] rounded mb-2" />
                      <span className="text-[8px] text-[#878787]">Locals prefer Emirati + Mediterranean</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-10 bg-[#A02E1F] rounded mb-2" />
                      <span className="text-[8px] text-[#878787]">Expats like Emirati + Indian</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-[9px] text-[#878787] px-3">
                <span>0</span>
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
                <span>40%</span>
                <span>50%</span>
              </div>
            </motion.div>
          </div>

          {/* Center Column - Main Data Visualization */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white/14 backdrop-blur-md rounded-3xl p-8 h-full"
            >
              <h2 className="text-white text-xl font-semibold mb-8">
                Popularity of cuisines in Abu Dhabi
              </h2>
              
              <div className="space-y-6">
                {/* Middle Eastern */}
                <div className="border-b border-white/18 pb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">Middle Eastern</h3>
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm">Popularity</span>
                      <div className="text-white text-sm">30-35%</div>
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm">Supporting Context</span>
                      <div className="text-white text-sm">Cultural resonance, traditional appeal</div>
                    </div>
                  </div>
                </div>

                {/* American */}
                <div className="border-b border-white/18 pb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">American</h3>
                    </div>
                    <div>
                      <div className="text-white text-sm">20-25%</div>
                    </div>
                    <div>
                      <div className="text-white text-sm">Fast-food dominance, familiarity, chain presence</div>
                    </div>
                  </div>
                </div>

                {/* Indian */}
                <div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-white font-bold text-sm">Indian</h3>
                    </div>
                    <div>
                      <div className="text-white text-sm">15-20%</div>
                    </div>
                    <div>
                      <div className="text-white text-sm">Large expat community, flavor alignment with local preferences</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Large Statistic */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <div className="text-white text-8xl lg:text-[100px] font-bold leading-none">78%</div>
              <div className="text-white text-sm mt-2">Residents eat out twice a week</div>
            </motion.div>

            {/* Map Visualization */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="rounded-3xl overflow-hidden"
            >
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/6217a05a0af8f9420e0485cc166613634d45f299?width=634"
                alt="Abu Dhabi Map with Demographics"
                className="w-full h-auto rounded-3xl"
              />
            </motion.div>

            {/* Additional Chart */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="rounded-3xl overflow-hidden"
            >
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/eade8edabdbb717ecdef1b65c3b40e5d1928605a?width=418"
                alt="Market Analysis Chart"
                className="w-full h-auto rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background Image Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      <img 
        src="https://api.builder.io/api/v1/image/assets/TEMP/7e2092faf64b59c4ede24041656b85968d42a542?width=2388"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />
    </div>
  );
}
