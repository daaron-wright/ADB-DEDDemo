import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";

interface PropertiesViewProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const SoundVisualization = () => {
  const bars = [
    { height: "4px" },
    { height: "8px" },
    { height: "16px" },
    { height: "10px" },
    { height: "6px" },
    { height: "18px" },
    { height: "24px" },
    { height: "14px" },
    { height: "3px" },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-0.5 bg-[#54FFD4] rounded-full transition-all duration-300"
          style={{ height: bar.height }}
        />
      ))}
    </div>
  );
};

const PropertyCard = ({
  title,
  price,
  rating,
  image,
  delay = 0,
  position,
}: {
  title: string;
  price: string;
  rating: number;
  image: string;
  delay?: number;
  position: { top: string; left: string };
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="absolute w-[300px] h-[330px]"
      style={{ top: position.top, left: position.left }}
    >
      <div className="w-full h-full rounded-3xl bg-white/14 backdrop-blur-md border border-white/20 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-[178px] object-cover"
        />

        {/* Star Rating */}
        <div className="absolute top-[193px] left-6 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.99965 1L5.72465 5.61L0.639648 6.345L4.31965 9.935L3.44965 15L7.99965 12.61L12.5496 15L11.6796 9.935L15.3596 6.35L10.2746 5.61L7.99965 1Z"
              fill="#FFE100"
            />
          </svg>
          <span className="text-white text-xl opacity-70">{rating}</span>
        </div>

        {/* Property Details */}
        <div className="absolute top-[227px] left-6 right-6">
          <p className="text-white text-base leading-[19.2px] mb-4">{title}</p>
        </div>

        {/* Price */}
        <div className="absolute top-[286px] left-6 flex items-center gap-2">
          <svg
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_0_215)">
              <path
                d="M19.8428 8.49013L19.9994 8.63411V8.19651C19.9994 7.23289 19.3081 6.44838 18.459 6.44838H17.1013C16.1513 2.58029 12.915 0.5 8.10057 0.5C5.0348 0.5 4.64099 0.5 1.73762 0.5C1.73762 0.5 2.60933 1.21591 2.60933 3.47022V6.45065H1.00394C0.691915 6.45065 0.399026 6.33275 0.156594 6.10998L0 5.96601V6.4036C0 7.36779 0.691335 8.15173 1.54042 8.15173H2.60991V9.85167H1.00452C0.692495 9.85167 0.399606 9.73434 0.157174 9.511L0.000579979 9.36703V9.80406C0.000579979 10.7677 0.691915 11.551 1.541 11.551H2.61049V14.6624C2.61049 16.8532 1.73878 17.5 1.73878 17.5H8.10173C13.0675 17.5 16.2006 15.405 17.1134 11.5493H18.9961C19.3081 11.5493 19.601 11.6667 19.8434 11.8894L20 12.0334V11.5964C20 10.6328 19.3087 9.84884 18.4596 9.84884H17.3634C17.382 9.57222 17.3918 9.28937 17.3918 8.99858C17.3918 8.7078 17.3814 8.42551 17.3623 8.14889H18.9961C19.3075 8.14889 19.601 8.26623 19.8434 8.48956L19.8428 8.49013ZM5.21691 1.35082H7.8767C11.4552 1.35082 13.528 2.89999 14.1463 6.44895L5.21691 6.45009V1.35082ZM7.89932 16.6509H5.21633V11.5505L14.1405 11.5493C13.5622 14.761 11.7005 16.559 7.89932 16.6509ZM14.3446 9.00028C14.3446 9.29107 14.3382 9.57449 14.3249 9.84997L5.21691 9.85111V8.15116L14.3255 8.15003C14.3382 8.42438 14.3446 8.70723 14.3446 9.00028Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_0_215">
                <rect
                  width="20"
                  height="17"
                  fill="white"
                  transform="translate(0 0.5)"
                />
              </clipPath>
            </defs>
          </svg>
          <span className="text-white text-xl font-bold">{price}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterface = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
      className="absolute bottom-16 right-20 w-[351px] h-[206px]"
    >
      <div className="bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 p-4 h-full">
        {/* Omnis Header */}
        <div className="flex items-center gap-2 mb-4">
          <AIBusinessOrb className="h-16 w-16" />
          <div className="flex-1">
            <h3 className="text-white text-lg font-bold">Omnis</h3>
          </div>
          <SoundVisualization />
        </div>

        {/* Message */}
        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3 max-w-[240px]">
          <p className="text-white text-base font-medium leading-[21.76px]">
            Here are some retail locations available to rent.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const PartnerLogos = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="absolute bottom-8 left-10"
    >
      <div className="text-white text-base font-medium mb-4">
        In collaboration with
      </div>
      <div className="flex items-center gap-8">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/9bfd38d325da645cc4c8e1a2aef3b5d4c8eae662?width=242"
          alt="Property Finder"
          className="h-12"
        />
        <div className="w-px h-11 bg-white/50"></div>
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/09683a0d837e39637290f853f491ffdcb14d48c7?width=242"
          alt="Bayut"
          className="h-8"
        />
      </div>
    </motion.div>
  );
};

export function PropertiesView({
  isOpen,
  onClose,
  category,
}: PropertiesViewProps) {
  if (!isOpen) return null;

  const properties = [
    {
      title: "Retail Space | Corniche Beach, Abu Dhabi",
      price: "495,000 / year",
      rating: 4.3,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/a9f0bf6d758ce0797379785bd5ae18dfc4113f43?width=600",
      position: { top: "186px", left: "147px" },
    },
    {
      title: "Retail Opportunity | Canal View | Ready to Move",
      price: "580,000 / year",
      rating: 4.7,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/90b42e755964109a96d26e28153d3260c27dab3c?width=600",
      position: { top: "438px", left: "476px" },
    },
    {
      title: "Retail Opportunity | Abu Dhabi Corniche | Ready Nov 2025",
      price: "640,000 / year",
      rating: 4.9,
      image:
        "https://api.builder.io/api/v1/image/assets/TEMP/321de87c306c0308a02c60a25803d7fd29f66f22?width=600",
      position: { top: "174px", left: "759px" },
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        {/* Background Map */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(https://api.builder.io/api/v1/image/assets/TEMP/24d2c321c242bd9798f44e1501c06f777c444c46?width=2388)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 w-full h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]"
        >
          <div className="flex items-center justify-between px-10 py-5 h-full">
            <div className="flex items-center gap-4">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F397f9a8d2a3c4c8cb1d79ae828b476be"
                alt="Tamm Logo"
                className="h-12"
              />
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

            <div className="flex items-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/f35ba5a02338a961dd18f58928489d9e87ec7dc3?width=442"
                alt="Sign in with UAE PASS"
                className="h-8 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 h-[calc(100vh-87px)] overflow-hidden">
          {/* Property Cards */}
          {properties.map((property, index) => (
            <PropertyCard
              key={property.title}
              title={property.title}
              price={property.price}
              rating={property.rating}
              image={property.image}
              position={property.position}
              delay={0.4 + index * 0.2}
            />
          ))}

          {/* Chat Interface */}
          <ChatInterface />

          {/* Partner Logos */}
          <PartnerLogos />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
