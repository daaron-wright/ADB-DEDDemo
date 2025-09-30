import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface RetailLocationsViewProps {
  onBack: () => void;
}

const RetailLocationsView: React.FC<RetailLocationsViewProps> = ({ onBack }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 250);
    return () => clearTimeout(timer);
  }, []);

  const retailLocations = [
    {
      id: 1,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/321de87c306c0308a02c60a25803d7fd29f66f22?width=600",
      rating: 4.9,
      title: "Retail Opportunity | Abu Dhabi Corniche | Ready Nov 2025",
      price: "640,000 / year",
      delay: 0.8,
    },
    {
      id: 2,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/90b42e755964109a96d26e28153d3260c27dab3c?width=600",
      rating: 4.7,
      title: "Retail Opportunity | Canal View | Ready to Move",
      price: "580,000 / year",
      delay: 1.0,
    },
    {
      id: 3,
      image: "https://api.builder.io/api/v1/image/assets/TEMP/a9f0bf6d758ce0797379785bd5ae18dfc4113f43?width=600",
      rating: 4.3,
      title: "Retail Space | Corniche Beach, Abu Dhabi",
      price: "495,000 / year",
      delay: 1.2,
    },
  ];

  return (
    <div className="relative flex h-full min-h-[640px] flex-col overflow-x-hidden overflow-y-auto bg-[#f5f8f6]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-160px] h-[360px] w-[360px] rounded-full bg-[#0E766E]/15 blur-3xl" />
        <div className="absolute right-[-180px] bottom-[-200px] h-[420px] w-[420px] rounded-full bg-[#0E766E]/12 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-[#0E766E]/8 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#d8e4df] bg-white px-4 py-2 text-sm font-semibold text-[#0F766E] shadow-sm transition hover:bg-[#eff6f3] hover:text-[#0a5a55]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to dialogue
          </button>
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F766E]">Available retail spaces</span>
            <span className="text-sm text-slate-500">Abu Dhabi premium locations</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-10 lg:px-12">
        {/* Main Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#d8e4df] bg-gradient-to-br from-[#616161] to-[#4a4a4a] shadow-[0_32px_70px_-42px_rgba(11,64,55,0.35)]"
          style={{ aspectRatio: "800/556" }}
        >
          {/* Map Background */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/24d2c321c242bd9798f44e1501c06f777c444c46?width=2388"
            alt="Abu Dhabi retail locations map"
            className="absolute inset-0 h-full w-full object-cover rounded-3xl"
          />

          {/* Retail Location Cards */}
          <div className="absolute inset-0">
            {retailLocations.map((location, index) => {
              const positions = [
                { top: "12%", right: "7%" }, // Top right
                { bottom: "30%", left: "37%" }, // Middle left
                { top: "13%", left: "10%" }, // Top left
              ];

              return (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={showContent ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: location.delay,
                    type: "spring",
                    stiffness: 100 
                  }}
                  className="absolute"
                  style={{
                    ...positions[index],
                    width: "clamp(280px, 25%, 300px)",
                  }}
                >
                  <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-[40px] shadow-[0_24px_60px_-38px_rgba(0,0,0,0.4)]">
                    <div className="aspect-[300/178] overflow-hidden">
                      <img
                        src={location.image}
                        alt={location.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <svg className="h-4 w-4 fill-[#FFE100]" viewBox="0 0 16 16">
                          <path d="M7.99965 1L5.72465 5.61L0.639648 6.345L4.31965 9.935L3.44965 15L7.99965 12.61L12.5496 15L11.6796 9.935L15.3596 6.35L10.2746 5.61L7.99965 1Z" />
                        </svg>
                        <span className="text-lg font-medium text-white/80">{location.rating}</span>
                      </div>
                      
                      <h3 className="mb-4 text-base font-normal leading-tight text-white">
                        {location.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 fill-white" viewBox="0 0 20 18">
                          <g clipPath="url(#clip0_1_314)">
                            <path d="M19.8428 8.49013L19.9994 8.63411V8.19651C19.9994 7.23289 19.3081 6.44838 18.459 6.44838H17.1013C16.1513 2.58029 12.915 0.5 8.10057 0.5C5.0348 0.5 4.64099 0.5 1.73762 0.5C1.73762 0.5 2.60933 1.21591 2.60933 3.47022V6.45065H1.00394C0.691915 6.45065 0.399026 6.33275 0.156594 6.10998L0 5.96601V6.4036C0 7.36779 0.691335 8.15173 1.54042 8.15173H2.60991V9.85167H1.00452C0.692495 9.85167 0.399606 9.73434 0.157174 9.511L0.000579979 9.36703V9.80406C0.000579979 10.7677 0.691915 11.551 1.541 11.551H2.61049V14.6624C2.61049 16.8532 1.73878 17.5 1.73878 17.5H8.10173C13.0675 17.5 16.2006 15.405 17.1134 11.5493H18.9961C19.3081 11.5493 19.601 11.6667 19.8434 11.8894L20 12.0334V11.5964C20 10.6328 19.3087 9.84884 18.4596 9.84884H17.3634C17.382 9.57222 17.3918 9.28937 17.3918 8.99858C17.3918 8.7078 17.3814 8.42551 17.3623 8.14889H18.9961C19.3075 8.14889 19.601 8.26623 19.8434 8.48956L19.8428 8.49013ZM5.21691 1.35082H7.8767C11.4552 1.35082 13.528 2.89999 14.1463 6.44895L5.21691 6.45009V1.35082ZM7.89932 16.6509H5.21633V11.5505L14.1405 11.5493C13.5622 14.761 11.7005 16.559 7.89932 16.6509ZM14.3446 9.00028C14.3446 9.29107 14.3382 9.57449 14.3249 9.84997L5.21691 9.85111V8.15116L14.3255 8.15003C14.3382 8.42438 14.3446 8.70723 14.3446 9.00028Z" fill="white"/>
                          </g>
                          <defs>
                            <clipPath id="clip0_1_314">
                              <rect width="20" height="17" fill="white" transform="translate(0 0.5)"/>
                            </clipPath>
                          </defs>
                        </svg>
                        <span className="text-lg font-bold text-white">{location.price}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom Collaboration Section */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="rounded-3xl border border-[#d8e4df] bg-white/95 p-8 shadow-[0_24px_60px_-38px_rgba(11,64,55,0.24)]"
        >
          <div className="flex flex-col items-center gap-6">
            <p className="text-base font-medium text-slate-600">In collaboration with</p>
            
            <div className="flex items-center gap-8">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/9bfd38d325da645cc4c8e1a2aef3b5d4c8eae662?width=242"
                alt="Property Finder"
                className="h-12 w-auto"
              />
              <div className="h-11 w-px bg-slate-300"></div>
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/09683a0d837e39637290f853f491ffdcb14d48c7?width=242"
                alt="Bayut"
                className="h-8 w-auto"
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Premium retail locations now available</h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Hand-selected properties in Abu Dhabi's most desirable commercial districts. 
                All locations verified for restaurant and retail licensing compatibility.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RetailLocationsView;
