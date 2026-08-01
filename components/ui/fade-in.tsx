"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

// Standard Linear/Stripe-style cubic-bezier easing tuple
export const PREMIUM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * 1. Premium Page Transition Component
 * Wraps page content with a gentle fade-in and upward slide
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.45,
        ease: PREMIUM_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  fullWidth = false,
}: FadeInProps) {
  const directionOffset = {
    up: 15,
    down: -15,
    left: 15,
    right: -15,
    none: 0,
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: direction === "up" || direction === "down" ? directionOffset[direction] : 0,
        x: direction === "left" || direction === "right" ? directionOffset[direction] : 0,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.45,
        delay,
        ease: PREMIUM_EASE,
      }}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * 2. Staggered Container & Waterfall Item Reveal
 */
export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: PREMIUM_EASE,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Pseudo-3D Interactive Motion Card with ultra-smooth hover & tactile press states
 */
export function MotionCard({
  children,
  className = "",
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -3,
        transition: { duration: 0.25, ease: PREMIUM_EASE },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Ultra-smooth interactive Motion Button wrapper
 */
export function MotionButton({
  children,
  className = "",
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2, ease: PREMIUM_EASE },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
