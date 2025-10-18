import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type StageSlide = {
  id: string;
  heading: string;
  eyebrow?: string;
  description?: string;
  content: React.ReactNode;
  footer?: React.ReactNode;
};

export interface StageSlideNavigatorProps {
  slides: StageSlide[];
  className?: string;
  initialSlideId?: string;
  activeSlideId?: string;
  onSlideChange?: (slideId: string) => void;
}

export function StageSlideNavigator({
  slides,
  className,
  initialSlideId,
  activeSlideId,
  onSlideChange,
}: StageSlideNavigatorProps) {
  const initialIndex = React.useMemo(() => {
    if (!initialSlideId) {
      return 0;
    }
    const index = slides.findIndex((slide) => slide.id === initialSlideId);
    return index === -1 ? 0 : index;
  }, [initialSlideId, slides]);

  const [internalIndex, setInternalIndex] = React.useState(initialIndex);
  const controlledIndex = React.useMemo(() => {
    if (!activeSlideId) {
      return null;
    }
    const index = slides.findIndex((slide) => slide.id === activeSlideId);
    return index === -1 ? 0 : index;
  }, [activeSlideId, slides]);

  const currentIndex = controlledIndex ?? internalIndex;
  const currentSlide = slides[currentIndex] ?? slides[0];

  React.useEffect(() => {
    if (controlledIndex === null) {
      return;
    }
    if (controlledIndex !== internalIndex) {
      setInternalIndex(controlledIndex);
    }
  }, [controlledIndex, internalIndex]);

  const handleSlideChange = React.useCallback(
    (nextIndex: number) => {
      if (!slides.length) {
        return;
      }
      const boundedIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);
      const nextSlide = slides[boundedIndex];
      if (!nextSlide) {
        return;
      }
      if (!activeSlideId) {
        setInternalIndex(boundedIndex);
      }
      onSlideChange?.(nextSlide.id);
    },
    [activeSlideId, onSlideChange, slides],
  );

  const handleNext = React.useCallback(() => {
    handleSlideChange(currentIndex + 1);
  }, [currentIndex, handleSlideChange]);

  const handlePrevious = React.useCallback(() => {
    handleSlideChange(currentIndex - 1);
  }, [currentIndex, handleSlideChange]);

  if (!currentSlide) {
    return null;
  }

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
            Step {currentIndex + 1} of {slides.length}
          </p>
          <h4 className="text-xl font-semibold text-slate-900">
            {currentSlide.heading}
          </h4>
          {currentSlide.description ? (
            <p className="max-w-[640px] text-sm text-slate-600">
              {currentSlide.description}
            </p>
          ) : null}
        </div>
        {slides.length > 1 ? (
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSlideChange(index)}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition",
                  index === currentIndex
                    ? "bg-[#0f766e]"
                    : "bg-[#dbe7e1] hover:bg-[#bcd6ca]",
                )}
                aria-label={`Go to ${slide.heading}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div>{currentSlide.content}</div>

      {currentSlide.footer ? <div>{currentSlide.footer}</div> : null}

      {slides.length > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirst}
            className="inline-flex items-center gap-2 rounded-full border-[#0f766e]/35 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e] transition hover:bg-[#ecf7f3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLast}
            className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_-30px_rgba(15,118,110,0.55)] transition hover:bg-[#0c6059] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
