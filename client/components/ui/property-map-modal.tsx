import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  rating: number;
  image: string;
  position: { top: string; left: string };
}

interface PropertyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const properties: Property[] = [
  {
    id: 'property-1',
    title: 'Retail Space | Corniche Beach, Abu Dhabi',
    location: 'Corniche Beach, Abu Dhabi',
    price: '495,000',
    rating: 4.3,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/a9f0bf6d758ce0797379785bd5ae18dfc4113f43?width=600',
    position: { top: '22%', left: '15%' }
  },
  {
    id: 'property-2', 
    title: 'Retail Opportunity | Abu Dhabi Corniche | Ready Nov 2025',
    location: 'Abu Dhabi Corniche',
    price: '640,000',
    rating: 4.9,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/321de87c306c0308a02c60a25803d7fd29f66f22?width=600',
    position: { top: '20%', left: '65%' }
  },
  {
    id: 'property-3',
    title: 'Retail Opportunity | Canal View | Ready to Move', 
    location: 'Canal View',
    price: '580,000',
    rating: 4.7,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/90b42e755964109a96d26e28153d3260c27dab3c?width=600',
    position: { top: '52%', left: '42%' }
  }
];

const DirhamIcon = () => (
  <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_0_215)">
      <path d="M19.8428 8.49013L19.9994 8.63411V8.19651C19.9994 7.23289 19.3081 6.44838 18.459 6.44838H17.1013C16.1513 2.58029 12.915 0.5 8.10057 0.5C5.0348 0.5 4.64099 0.5 1.73762 0.5C1.73762 0.5 2.60933 1.21591 2.60933 3.47022V6.45065H1.00394C0.691915 6.45065 0.399026 6.33275 0.156594 6.10998L0 5.96601V6.4036C0 7.36779 0.691335 8.15173 1.54042 8.15173H2.60991V9.85167H1.00452C0.692495 9.85167 0.399606 9.73434 0.157174 9.511L0.000579979 9.36703V9.80406C0.000579979 10.7677 0.691915 11.551 1.541 11.551H2.61049V14.6624C2.61049 16.8532 1.73878 17.5 1.73878 17.5H8.10173C13.0675 17.5 16.2006 15.405 17.1134 11.5493H18.9961C19.3081 11.5493 19.601 11.6667 19.8434 11.8894L20 12.0334V11.5964C20 10.6328 19.3087 9.84884 18.4596 9.84884H17.3634C17.382 9.57222 17.3918 9.28937 17.3918 8.99858C17.3918 8.7078 17.3814 8.42551 17.3623 8.14889H18.9961C19.3075 8.14889 19.601 8.26623 19.8434 8.48956L19.8428 8.49013ZM5.21691 1.35082H7.8767C11.4552 1.35082 13.528 2.89999 14.1463 6.44895L5.21691 6.45009V1.35082ZM7.89932 16.6509H5.21633V11.5505L14.1405 11.5493C13.5622 14.761 11.7005 16.559 7.89932 16.6509ZM14.3446 9.00028C14.3446 9.29107 14.3382 9.57449 14.3249 9.84997L5.21691 9.85111V8.15116L14.3255 8.15003C14.3382 8.42438 14.3446 8.70723 14.3446 9.00028Z" fill="white"/>
    </g>
    <defs>
      <clipPath id="clip0_0_215">
        <rect width="20" height="17" fill="white" transform="translate(0 0.5)"/>
      </clipPath>
    </defs>
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99965 1L5.72465 5.61L0.639648 6.345L4.31965 9.935L3.44965 15L7.99965 12.61L12.5496 15L11.6796 9.935L15.3596 6.35L10.2746 5.61L7.99965 1Z" fill="#FFE100"/>
  </svg>
);

const PropertyCard = ({ property, isVisible }: { property: Property; isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute z-20"
        style={{
          top: property.position.top,
          left: property.position.left,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-[280px] h-[310px] rounded-2xl bg-white/14 backdrop-blur-sm border border-white/20 overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-[160px] object-cover"
          />
          <div className="p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <StarIcon />
              <span className="text-lg font-normal opacity-70">{property.rating}</span>
            </div>
            <h3 className="text-sm font-normal leading-[120%] mb-3 tracking-[0.051px]">
              {property.title}
            </h3>
            <div className="flex items-center gap-2">
              <DirhamIcon />
              <span className="text-lg font-bold tracking-[0.064px]">
                {property.price} / year
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const PropertyMarker = ({ property, isHovered, onHover, onLeave }: {
  property: Property;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => (
  <div
    className="absolute z-10 cursor-pointer"
    style={{
      top: property.position.top,
      left: property.position.left,
      transform: 'translate(-50%, -50%)'
    }}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
  >
    <motion.div
      animate={{
        scale: isHovered ? 1.2 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
    />
  </div>
);

export const PropertyMapModal: React.FC<PropertyMapModalProps> = ({ isOpen, onClose }) => {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-5xl h-[80vh] bg-black rounded-3xl overflow-hidden border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="absolute top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/20">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-white text-lg font-semibold">Available Properties in Abu Dhabi Corniche</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Map Content */}
          <div className="relative w-full h-full mt-16">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30">
              <img 
                src="https://api.builder.io/api/v1/image/assets/TEMP/24d2c321c242bd9798f44e1501c06f777c444c46?width=2388"
                alt="Abu Dhabi Map"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Property Markers */}
            {properties.map(property => (
              <PropertyMarker
                key={property.id}
                property={property}
                isHovered={hoveredProperty === property.id}
                onHover={() => setHoveredProperty(property.id)}
                onLeave={() => setHoveredProperty(null)}
              />
            ))}

            {/* Property Cards */}
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                isVisible={hoveredProperty === property.id}
              />
            ))}

            {/* Instructions */}
            <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20">
              <p className="text-white text-sm font-medium">
                Hover over the red markers to view property details
              </p>
            </div>

            {/* AI Business Chat - smaller for modal */}
            <div className="absolute bottom-6 right-6 w-[280px] h-[160px]">
              <div className="bg-white/14 backdrop-blur-sm rounded-2xl p-3 h-full border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <img 
                    src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                    alt="AI Business"
                    className="w-12 h-12 rounded-full border border-[#54FFD4]"
                  />
                  <div>
                    <h3 className="text-white text-sm font-semibold">AI Business</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div 
                          key={i}
                          className="h-0.5 bg-[#54FFD4] rounded-full"
                          style={{ 
                            width: [4, 8, 12, 8, 6, 14][i] + 'px',
                            transform: 'rotate(-90deg)'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white/30 rounded-xl p-2">
                  <p className="text-white text-xs font-medium leading-[136%]">
                    Here are retail locations in the Corniche area perfect for restaurants.
                  </p>
                </div>
              </div>
            </div>

            {/* Collaboration Footer - smaller for modal */}
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-xs font-medium mb-2 opacity-80">In collaboration with</p>
              <div className="flex items-center gap-4">
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/9bfd38d325da645cc4c8e1a2aef3b5d4c8eae662?width=242"
                  alt="Property Finder"
                  className="h-8 w-auto opacity-80"
                />
                <div className="w-px h-8 bg-white/30"></div>
                <img 
                  src="https://api.builder.io/api/v1/image/assets/TEMP/09683a0d837e39637290f853f491ffdcb14d48c7?width=242"
                  alt="Bayut"
                  className="h-6 w-auto opacity-80"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
