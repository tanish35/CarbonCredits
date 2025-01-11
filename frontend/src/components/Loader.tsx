import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

interface LoaderProps {
  isLoading: boolean;
}

export const Loader = React.memo(function Loader({ isLoading }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isLoading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 99) {
            clearInterval(timer);
            return 99;
          }
          return prev + 4;
        });
      }, 20);
    } else {
      setTimeout(() => {
        setProgress(100);
      }, 500);
    }

    return () => {
      if (timer) clearInterval(timer);
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
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-primary/10" />
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <motion.circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={476.4}
                  strokeDashoffset={476.4 * (1 - progress / 100)}
                />
              </svg>
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
});
