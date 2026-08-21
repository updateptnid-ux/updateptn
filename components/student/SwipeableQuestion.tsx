"use client";

import { useState, useRef, TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeableQuestionProps {
  currentQuestion: number;
  totalQuestions: number;
  onNext: () => void;
  onPrev: () => void;
  children: React.ReactNode;
}

export default function SwipeableQuestion({
  currentQuestion,
  totalQuestions,
  onNext,
  onPrev,
  children,
}: SwipeableQuestionProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Calculate swipe direction for visual feedback
    const distance = touchStart - e.targetTouches[0].clientX;
    if (Math.abs(distance) > 10) {
      setSwipeDirection(distance > 0 ? "left" : "right");
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentQuestion < totalQuestions) {
      onNext();
    } else if (isRightSwipe && currentQuestion > 1) {
      onPrev();
    }

    // Reset states
    setSwiping(false);
    setSwipeDirection(null);
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Calculate transform for visual feedback
  const getTransform = () => {
    if (!swiping || !touchStart || !touchEnd) return "translateX(0)";
    const diff = touchEnd - touchStart;
    // Limit transform to max 100px
    const limitedDiff = Math.max(-100, Math.min(100, diff));
    return `translateX(${limitedDiff * 0.3}px)`;
  };

  return (
    <div className="relative w-full">
      {/* Swipe Indicators */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {swiping && swipeDirection === "left" && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-3 shadow-lg animate-pulse">
            <ChevronRight className="h-6 w-6" />
          </div>
        )}
        {swiping && swipeDirection === "right" && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-3 shadow-lg animate-pulse">
            <ChevronLeft className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Swipeable Content */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative touch-pan-y select-none"
        style={{
          transform: getTransform(),
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>

      {/* Navigation Buttons (Desktop & Mobile Fallback) */}
      <div className="flex items-center justify-between mt-6 gap-4">
        <Button
          onClick={onPrev}
          disabled={currentQuestion === 1}
          variant="outline"
          size="lg"
          className="h-12 px-6 text-base font-semibold rounded-xl border-2 disabled:opacity-40 touch-manipulation"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Sebelumnya
        </Button>

        <div className="text-base font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">
          {currentQuestion} / {totalQuestions}
        </div>

        <Button
          onClick={onNext}
          disabled={currentQuestion === totalQuestions}
          size="lg"
          className="h-12 px-6 text-base font-semibold rounded-xl disabled:opacity-40 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
        >
          Selanjutnya
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Swipe Hint (Show once on first load) */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-sm text-slate-500">
          💡 Tip: Geser ke kiri/kanan untuk ganti soal
        </p>
      </div>
    </div>
  );
}
