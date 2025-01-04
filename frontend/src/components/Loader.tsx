"use client";

import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoaderProps {
  isLoading: boolean;
}

export function Loader({ isLoading }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      // Reset progress when loading starts
      setProgress(0);

      // Animate to 99% during loading with smaller, more frequent increments
      timer = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.max(0.5, (99 - prev) * 0.1); // Dynamic increment
          const nextProgress = prev + increment;
          
          if (nextProgress >= 99) {
            clearInterval(timer);
            return 99;
          }
          return nextProgress;
        });
      }, 50);
    } else if (progress >= 99) {
      // Quick completion when loading is done
      timer = setTimeout(() => {
        setProgress(100);
      }, 200);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 grid place-items-center bg-background/80 backdrop-blur-md z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex flex-col items-center gap-8"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Loader Ring */}
            <div className="relative w-40 h-40">
              {/* Background ring */}
              <div className="absolute inset-0 rounded-full bg-primary/10" />

              {/* Animated progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <motion.circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={476.4} // 2 * π * r
                  strokeDashoffset={476.4 * (1 - progress / 100)}
                />
              </svg>

              {/* Logo */}
              <motion.div
                className="absolute inset-0 grid place-items-center"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Logo />
              </motion.div>
            </div>

            {/* Progress Text */}
            <motion.div
              className="flex items-center gap-4 text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-lg font-medium tabular-nums">
                {Math.round(progress)}%
              </span>
              <span className="text-lg font-medium">
                {progress === 100 ? "Complete" : "Processing..."}
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
