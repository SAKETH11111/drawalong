"use client";

import { motion } from "framer-motion";

export default function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const steps = ["Watch", "Upload", "Email", "Finish"] as const;
  return (
    <div className="flex items-center gap-4" role="list" aria-label="Progress">
      {steps.map((label, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3 | 4;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center gap-2" role="listitem">
            <div className="relative h-3 w-3">
              <motion.span
                layout
                className={`absolute inset-0 rounded-full ${done ? "bg-secondary" : active ? "bg-primary" : "bg-muted"}`}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                aria-hidden
              />
            </div>
            <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`} aria-current={active ? "step" : undefined}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}


