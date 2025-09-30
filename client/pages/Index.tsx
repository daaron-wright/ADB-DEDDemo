import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Tooltip } from "@aegov/design-system-react";
import { BusinessChatUI } from "@/components/ui/business-chat-ui";
import { OpenChatUI } from "@/components/ui/open-chat-ui";
import { UAEPassLogin } from "@/components/ui/uae-pass-login";

export default function Index() {
  const [chatState, setChatState] = useState<{
    isOpen: boolean;
    category: string | null;
    initialMessage: string | null;
  }>({
    isOpen: false,
    category: null,
    initialMessage: null,
  });

  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openChatState, setOpenChatState] = useState<{
    isOpen: boolean;
    mode: "general" | "category";
    category: string | null;
    categoryTitle: string | null;
  }>({
    isOpen: false,
    mode: "general",
    category: null,
    categoryTitle: null,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const fallbackFocus = { x: 640, y: 360 };
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number }>(
    fallbackFocus,
  );
  const categoryPositions = useRef<Record<string, { x: number; y: number }>>(
    {},
  );
  const focusUpdateRaf = useRef<number | null>(null);
  const queuedFocusPoint = useRef<{ x: number; y: number } | null>(null);

  const ambientOrbs = useMemo(
    () => [
      {
        id: "northwest",
        size: 760,
        style: { top: "-20%", left: "-12%" } as React.CSSProperties,
        gradient:
          "radial-gradient(circle, rgba(226, 212, 255, 0.34) 0%, rgba(255, 255, 255, 0) 70%)",
        animate: {
          x: [0, 40, -30, 0],
          y: [0, 22, -18, 0],
          opacity: [0.38, 0.52, 0.46, 0.5],
        },
        duration: 26,
      },
      {
        id: "northeast",
        size: 620,
        style: { top: "-12%", right: "-18%" } as React.CSSProperties,
        gradient:
          "radial-gradient(circle, rgba(214, 187, 255, 0.3) 0%, rgba(255, 255, 255, 0) 68%)",
        animate: {
          x: [0, -35, 18, 0],
          y: [0, 18, -14, 0],
          opacity: [0.3, 0.44, 0.36, 0.42],
        },
        duration: 24,
      },
      {
        id: "southwest",
        size: 680,
        style: { bottom: "-18%", left: "-10%" } as React.CSSProperties,
        gradient:
          "radial-gradient(circle, rgba(236, 229, 255, 0.28) 0%, rgba(255, 255, 255, 0) 72%)",
        animate: {
          x: [0, 28, -18, 0],
          y: [0, -24, 16, 0],
          opacity: [0.32, 0.45, 0.4, 0.48],
        },
        duration: 30,
      },
      {
        id: "southeast",
        size: 540,
        style: { bottom: "-10%", right: "-12%" } as React.CSSProperties,
        gradient:
          "radial-gradient(circle, rgba(223, 219, 255, 0.26) 0%, rgba(255, 255, 255, 0) 70%)",
        animate: {
          x: [0, -22, 16, 0],
          y: [0, -18, 14, 0],
          opacity: [0.28, 0.4, 0.34, 0.38],
        },
        duration: 28,
      },
      {
        id: "center",
        size: 780,
        style: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -45%)",
        } as React.CSSProperties,
        gradient:
          "radial-gradient(circle, rgba(249, 247, 255, 0.35) 0%, rgba(255, 255, 255, 0) 75%)",
        animate: {
          x: [0, 18, -12, 0],
          y: [0, -16, 20, 0],
          opacity: [0.28, 0.36, 0.32, 0.4],
        },
        duration: 32,
      },
    ],
    [],
  );

  const queueFocusPoint = (point: { x: number; y: number }) => {
    if (typeof window === "undefined") {
      setFocusPoint(point);
      return;
    }

    queuedFocusPoint.current = point;

    if (focusUpdateRaf.current === null) {
      focusUpdateRaf.current = window.requestAnimationFrame(() => {
        if (queuedFocusPoint.current) {
          setFocusPoint(queuedFocusPoint.current);
          queuedFocusPoint.current = null;
        }
        focusUpdateRaf.current = null;
      });
    }
  };

  const applyFocusPoint = (point?: { x: number; y: number }) => {
    if (point) {
      queueFocusPoint({ x: point.x, y: point.y });
    } else if (typeof window !== "undefined") {
      queueFocusPoint({
        x: window.innerWidth / 2,
        y: window.innerHeight * 0.35,
      });
    } else {
      queueFocusPoint({ ...fallbackFocus });
    }
  };

  const getFocusFromElement = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  useEffect(() => {
    applyFocusPoint();
  }, []);

  useEffect(() => {
    return () => {
      if (focusUpdateRaf.current !== null && typeof window !== "undefined") {
        window.cancelAnimationFrame(focusUpdateRaf.current);
      }
    };
  }, []);

  // UAE PASS Login Handler
  const handleUAEPassLogin = (
    userType: "applicant" | "reviewer",
    userData: any,
  ) => {
    const destination =
      userType === "applicant" ? "/portal/applicant" : "/portal/reviewer";
    navigate(destination, { state: { user: userData } });
  };

  const businessCategories = useMemo(
    () => [
      {
        id: "restaurants",
        title: "Restaurants",
        subtitle: "Commercial License",
        image:
          "https://api.builder.io/api/v1/image/assets/TEMP/5ea3e6930d5e28ed683d222762dba4e684143d78?width=498",
        overlayImage:
          "https://api.builder.io/api/v1/image/assets/TEMP/6e95ba3f93ff8f50b6c5851b73729e1df3b00b90?width=800",
        tooltip:
          "Ideal for full-service dining concepts. AI prepares food safety approvals, staffing plans, and timeline estimates so you can open faster.",
        prompt:
          "I'm interested in opening a fine dining restaurant in Abu Dhabi. What are the specific requirements and what should I consider?",
      },
      {
        id: "fast-food",
        title: "Fast Food",
        subtitle: "Commercial License",
        image:
          "https://api.builder.io/api/v1/image/assets/TEMP/93a8ccdd2ba263b5df1fa8ac003cfbbe0f2a04bf?width=766",
        tooltip:
          "Best for quick-service launches with delivery or drive-thru. Get prebuilt SOPs, supplier rosters, and marketing permits in one flow.",
        prompt:
          "I want to start a fast-food chain. What are the key differences in licensing compared to a regular restaurant?",
      },
      {
        id: "branch",
        title: "Branch",
        subtitle: "Dual License",
        image:
          "https://api.builder.io/api/v1/image/assets/TEMP/474e9427353e36aa9e243c53c1ca9efe1f850f1a?width=788",
        tooltip:
          "Expanding an existing brand? Receive instant zoning checks, dual-license compliance, and performance benchmarks for new locations.",
        prompt:
          "My company wants to open a new branch office in Abu Dhabi. What are the requirements for a foreign company?",
      },
      {
        id: "retail-store",
        title: "Retail Store",
        subtitle: "Commercial License",
        image:
          "https://api.builder.io/api/v1/image/assets/TEMP/28a07c4a89a2e43c77d74ad46a6ad88ca8d969b3?width=616",
        tooltip:
          "Perfect for physical retail. AI recommends fit-out standards, merchandising approvals, and logistics partners tailored to your concept.",
        prompt:
          "I'm planning to open a luxury retail store. What are the prime locations and what licenses do I need?",
      },
    ],
    [],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("chat") !== "open") {
      return;
    }

    const categoryParam = params.get("category");
    const messageParam = params.get("message");
    const matchedCategory = categoryParam
      ? businessCategories.find((category) => category.id === categoryParam)
      : undefined;

    setChatState({
      isOpen: true,
      category: matchedCategory ? matchedCategory.id : "general",
      initialMessage: messageParam ?? null,
    });

    setActiveCategory(matchedCategory ? matchedCategory.id : null);
    setOpenChatState((prev) => ({
      ...prev,
      isOpen: false,
      mode: "general",
      category: matchedCategory ? matchedCategory.id : null,
      categoryTitle: matchedCategory ? matchedCategory.title : null,
    }));
  }, [location.search, businessCategories]);

  const handleTileClick = (
    categoryId: string,
    categoryTitle: string,
    event?: React.MouseEvent<HTMLDivElement>,
  ) => {
    setActiveCategory(categoryId);

    if (event) {
      const point = getFocusFromElement(event.currentTarget);
      categoryPositions.current[categoryId] = point;
      applyFocusPoint(point);
    } else if (categoryPositions.current[categoryId]) {
      applyFocusPoint(categoryPositions.current[categoryId]);
    } else {
      applyFocusPoint();
    }

    setOpenChatState({
      isOpen: true,
      mode: "category",
      category: categoryId,
      categoryTitle,
    });
  };

  const handleCloseChat = () => {
    setChatState({
      isOpen: false,
      category: null,
      initialMessage: null,
    });
  };

  const resetOpenChatState = () => {
    setOpenChatState({
      isOpen: false,
      mode: "general",
      category: null,
      categoryTitle: null,
    });
  };

  const handleOpenGeneralChat = () => {
    setOpenChatState({
      isOpen: true,
      mode: "general",
      category: null,
      categoryTitle: null,
    });
  };

  const getChatTitle = () => {
    const category = businessCategories.find(
      (cat) => cat.id === chatState.category,
    );
    return category
      ? `${category.subtitle} for ${category.title}`
      : "AI Business";
  };

  const pageRef = useRef<HTMLDivElement>(null);

  const handleCategoryHover = (
    categoryId: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    setHoveredCategory(categoryId);
    const point = getFocusFromElement(event.currentTarget);
    categoryPositions.current[categoryId] = point;
    applyFocusPoint(point);
  };

  const handleCategoryLeave = () => {
    setHoveredCategory(null);
    if (activeCategory && categoryPositions.current[activeCategory]) {
      applyFocusPoint(categoryPositions.current[activeCategory]);
    } else {
      applyFocusPoint();
    }
  };

  const startBusinessChat = (
    categoryId: string,
    initialMessage?: string | null,
  ) => {
    setChatState({
      isOpen: true,
      category: categoryId,
      initialMessage: initialMessage ?? null,
    });
  };

  const handleChatPromptSubmit = ({
    categoryId,
    message,
  }: {
    categoryId?: string | null;
    message?: string | null;
  }) => {
    const resolvedCategory = categoryId ?? openChatState.category ?? "general";

    if (categoryPositions.current[resolvedCategory]) {
      applyFocusPoint(categoryPositions.current[resolvedCategory]);
    } else {
      applyFocusPoint();
    }

    setActiveCategory(resolvedCategory);
    resetOpenChatState();
    startBusinessChat(resolvedCategory, message ?? null);
  };

  const handleOpenChatCategoryClick = (
    categoryId: string,
    _categoryTitle: string,
  ) => {
    setActiveCategory(categoryId);

    if (categoryPositions.current[categoryId]) {
      applyFocusPoint(categoryPositions.current[categoryId]);
    } else {
      applyFocusPoint();
    }

    resetOpenChatState();
    startBusinessChat(categoryId);
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    queueFocusPoint({ x: event.clientX, y: event.clientY });
  };

  const hasCategoryFocus = Boolean(hoveredCategory || activeCategory);
  const focusIntensity = hasCategoryFocus ? 0.36 : 0.22;
  const haloIntensity = hasCategoryFocus ? 0.24 : 0.14;

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden transition-colors duration-700 ease-out"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(222, 209, 255, 0.94) 50%, rgba(255, 255, 255, 0.98) 100%)",
      }}
      onMouseMove={handlePointerMove}
      onMouseLeave={() => applyFocusPoint()}
    >
      {ambientOrbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            ...orb.style,
            background: orb.gradient,
            filter: "blur(120px)",
            mixBlendMode: "screen",
          }}
          initial={false}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{
          background: [
            `radial-gradient(520px circle at ${focusPoint.x}px ${focusPoint.y}px, rgba(152, 103, 255, ${focusIntensity}) 0%, rgba(255, 255, 255, 0.38) 55%, transparent 82%)`,
            `radial-gradient(640px circle at ${focusPoint.x + 260}px ${focusPoint.y - 220}px, rgba(222, 206, 255, ${haloIntensity}) 0%, transparent 78%)`,
            `radial-gradient(700px circle at ${focusPoint.x - 280}px ${focusPoint.y + 240}px, rgba(237, 233, 255, ${haloIntensity * 0.9}) 0%, transparent 84%)`,
          ].join(","),
          opacity: hasCategoryFocus ? 0.92 : 0.7,
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(860px circle at 15% 12%, rgba(233, 225, 255, 0.28), transparent 68%), radial-gradient(720px circle at 80% 18%, rgba(220, 207, 255, 0.22), transparent 72%), radial-gradient(960px circle at 55% 95%, rgba(248, 245, 255, 0.4), transparent 80%)",
        }}
      />
      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="flex justify-between items-center px-8 py-6 border-b border-gray-100/50">
          {/* Tamm Logo */}
          <div className="flex items-center">
            <svg
              width="111"
              height="50"
              viewBox="0 0 111 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M65.7294 29.4798V38.9241H63.8521V29.4798H60.2383V27.6816H69.3588V29.4798H65.7294Z"
                fill="black"
              />
              <path
                d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                fill="black"
              />
              <path
                d="M77.7754 38.9247V31.2004H79.5275V32.1855C80.0125 31.4193 80.8573 30.9659 81.7647 30.9815C82.7346 30.9346 83.642 31.4663 84.0643 32.3419C84.565 31.4506 85.5349 30.919 86.5518 30.9815C87.9441 30.9815 89.2582 31.8728 89.2582 33.9211V38.9247H87.4904V34.2339C87.4904 33.327 87.0367 32.6546 86.0199 32.6546C85.1438 32.6546 84.4242 33.3739 84.4242 34.2651C84.4242 34.2964 84.4242 34.312 84.4242 34.3433V38.9247H82.6251V34.2495C82.6251 33.3582 82.187 32.6702 81.1545 32.6702C80.2941 32.6546 79.5745 33.3582 79.5588 34.2182C79.5588 34.2651 79.5588 34.312 79.5588 34.359V38.9404L77.7754 38.9247Z"
                fill="black"
              />
              <path
                d="M91.5107 38.9247V31.2004H93.2629V32.1855C93.7479 31.4193 94.5926 30.9659 95.5 30.9815C96.4699 30.9346 97.3773 31.4663 97.7997 32.3419C98.3003 31.4506 99.2546 30.919 100.271 30.9815C101.664 30.9815 102.978 31.8728 102.978 33.9211V38.9247H101.257V34.2339C101.351 33.4677 100.819 32.7641 100.052 32.6546C99.9586 32.639 99.8647 32.639 99.7865 32.639C98.9104 32.639 98.1908 33.3582 98.1908 34.2495C98.1908 34.2808 98.1908 34.2964 98.1908 34.3277V38.9091H96.4074V34.2339C96.5012 33.4677 95.9693 32.7641 95.2028 32.6546C95.1089 32.639 95.015 32.639 94.9368 32.639C94.0764 32.6233 93.3568 33.327 93.3411 34.187C93.3411 34.2339 93.3411 34.2808 93.3411 34.3277V38.9091L91.5107 38.9247Z"
                fill="black"
              />
              <path
                d="M101.07 12.5309C101.586 12.5778 102.04 12.2182 102.086 11.7022C102.086 11.6709 102.086 11.6396 102.086 11.6084C102.024 11.0455 101.523 10.6233 100.96 10.6858C100.475 10.7327 100.1 11.1236 100.037 11.6084C100.037 12.1244 100.444 12.5309 100.96 12.5465C100.991 12.5465 101.038 12.5465 101.07 12.5309Z"
                fill="black"
              />
              <path
                d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                fill="black"
              />
              <path
                d="M69.6406 18.3629C69.6406 18.2378 69.6406 18.1127 69.6406 17.972C69.6406 15.8142 68.3264 14.3756 66.3553 14.3756C64.7126 14.3131 63.289 15.5327 63.1013 17.1745C61.2866 17.2683 60.2384 18.4723 60.2384 20.505V22.741H62.0062V20.8021C62.0062 19.8014 62.3347 19.1134 63.1326 19.0039C63.4455 20.5207 64.8065 21.5839 66.3396 21.5057C67.3878 21.5526 68.3734 21.0679 68.9991 20.2236H102.963V13.5782H101.179V18.3629H69.6406ZM67.8571 17.9251C67.8571 18.957 67.2939 19.645 66.3553 19.645C65.5105 19.645 64.8065 18.9727 64.8065 18.1127C64.8065 18.0501 64.8065 17.9876 64.8221 17.9251C64.8221 16.8774 65.4323 16.1738 66.3553 16.1738C67.2626 16.1738 67.8571 16.8774 67.8571 17.9251Z"
                fill="black"
              />
              <path
                d="M27.4986 23.1025L26.8103 20.3818C26.3253 20.5069 25.8247 20.5851 25.3241 20.6007C24.8078 20.5538 24.2759 20.4913 23.7753 20.3818L23.0557 23.0713C23.8222 23.2902 24.6044 23.3996 25.4023 23.3996C26.1063 23.3996 26.8103 23.3058 27.4986 23.1025Z"
                fill="black"
              />
              <path
                d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                fill="black"
              />
              <path
                d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                fill="black"
              />
            </svg>
          </div>

          {/* Welcome text and buttons */}
          <div className="flex items-center gap-4">
            <span className="text-black text-base font-medium">Welcome</span>
            <button
              onClick={handleOpenGeneralChat}
              className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm transition-shadow hover:shadow-md"
            >
              Chat with AI
            </button>
            <UAEPassLogin
              mode="quick"
              defaultUserType="applicant"
              trigger={
                <span className="inline-flex items-center justify-center rounded-full bg-teal-gradient px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90">
                  Sign in
                </span>
              }
              onLogin={handleUAEPassLogin}
            />
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center px-8 py-16 max-w-6xl mx-auto">
          {/* Subtitle */}
          <p className="text-tamm-gray-light text-base font-medium mb-3">
            AI Native Business
          </p>

          {/* Main Headline */}
          <h1 className="text-black text-4xl md:text-5xl lg:text-6xl font-bold text-center leading-tight tracking-tight mb-3 max-w-4xl">
            Discover, Setup and Grow your business, powered by AI
          </h1>

          {/* Description */}
          <p className="text-tamm-gray-medium text-base font-medium text-center max-w-lg leading-relaxed mb-16">
            Welcome to the future of government services. Experience how Abu
            Dhabi is building an AI Native Government to empower entrepreneurs
            and simplify business setup.
          </p>

          {/* Business Categories Section */}
          <div className="w-full">
            <h2 className="text-black text-2xl font-bold text-center mb-12 tracking-tight">
              You may be interested in
            </h2>

            {/* Business Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto justify-items-center">
              {businessCategories.map((category) => {
                const isHovered = hoveredCategory === category.id;
                const isActive = activeCategory === category.id;
                const isElevated = isHovered || isActive;

                return (
                  <Tooltip
                    key={category.id}
                    side="bottom"
                    align="center"
                    sideOffset={16}
                    className="aegov-tooltip rounded-2xl border border-white/30 bg-white/95 px-4 py-3 text-slate-800 shadow-[0_24px_55px_-30px_rgba(24,32,63,0.35)] backdrop-blur-lg [&_svg]:fill-white"
                    content={
                      <div className="max-w-[240px] text-sm leading-relaxed text-slate-700">
                        {category.tooltip}
                      </div>
                    }
                  >
                    <div
                      className="group relative cursor-pointer w-[253px]"
                      onClick={(event) =>
                        handleTileClick(category.id, category.title, event)
                      }
                      onMouseEnter={(event) =>
                        handleCategoryHover(category.id, event)
                      }
                      onMouseLeave={handleCategoryLeave}
                    >
                      <motion.div
                        className="relative h-[271px] w-full overflow-hidden rounded-3xl border border-white/70 shadow-[0_18px_40px_-26px_rgba(15,15,45,0.18)]"
                        whileHover={{ y: -3 }}
                      >
                        <div className="absolute inset-0">
                          <motion.img
                            src={category.image}
                            alt={category.title}
                            className="h-full w-full object-cover"
                            animate={{
                              filter: isElevated ? "blur(7px)" : "blur(0px)",
                              scale: isElevated ? 1.04 : 1,
                            }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                          />
                          {category.overlayImage && (
                            <motion.img
                              src={category.overlayImage}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                              animate={{
                                filter: isElevated ? "blur(7px)" : "blur(0px)",
                                scale: isElevated ? 1.04 : 1,
                              }}
                              transition={{ duration: 0.45, ease: "easeOut" }}
                            />
                          )}
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-10">
                          <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-black/60 p-4 backdrop-blur-md">
                            <div className="flex-1">
                              <p className="text-white text-xs font-medium mb-1">
                                {category.subtitle}
                              </p>
                              <h3 className="text-white text-xl font-semibold leading-tight">
                                {category.title}
                              </h3>
                            </div>

                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/20">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5 12H19M19 12L13 6M19 12L13 18"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Business Chat UI */}
      <BusinessChatUI
        isOpen={chatState.isOpen}
        onClose={handleCloseChat}
        category={chatState.category || "general"}
        title={getChatTitle()}
        initialMessage={chatState.initialMessage || undefined}
      />

      {/* Open Chat UI */}
      <OpenChatUI
        isOpen={openChatState.isOpen}
        onClose={resetOpenChatState}
        title={
          openChatState.mode === "category" && openChatState.categoryTitle
            ? `AI Guidance for ${openChatState.categoryTitle}`
            : "AI Business"
        }
        businessCategories={businessCategories}
        onCategoryClick={handleOpenChatCategoryClick}
        mode={openChatState.mode}
        initialCategoryId={openChatState.category ?? undefined}
        initialCategoryTitle={openChatState.categoryTitle ?? undefined}
        onPromptSubmit={
          openChatState.mode === "category" ? handleChatPromptSubmit : undefined
        }
      />
    </div>
  );
}
