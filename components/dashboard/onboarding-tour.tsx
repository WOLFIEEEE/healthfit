"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

type TourStep = {
  element: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
};

const TOUR_STEPS: TourStep[] = [
  {
    element: '[data-tour="overview"]',
    title: "Dashboard Overview",
    description:
      "Your home base. See your daily stats, streaks, and AI-powered insights at a glance.",
    position: "right",
  },
  {
    element: '[data-tour="workouts"]',
    title: "Workouts",
    description:
      "Log workouts, follow your weekly program, and track your progress over time.",
    position: "right",
  },
  {
    element: '[data-tour="nutrition"]',
    title: "Nutrition",
    description:
      "Track meals, monitor macros, and stay on top of your hydration goals.",
    position: "right",
  },
  {
    element: '[data-tour="coach"]',
    title: "AI Coach",
    description:
      "Chat with your personal AI coach for advice, motivation, and program adjustments.",
    position: "right",
  },
  {
    element: '[data-tour="achievements"]',
    title: "Achievements",
    description:
      "Earn badges and XP as you hit milestones. Collect them all!",
    position: "right",
  },
  {
    element: '[data-tour="community"]',
    title: "Community",
    description:
      "Join challenges, check leaderboards, and connect with other members.",
    position: "right",
  },
];

type OnboardingTourProps = {
  tourCompleted: boolean;
  completedSteps: string[];
};

export function OnboardingTour({
  tourCompleted,
  completedSteps,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [useDriverJs, setUseDriverJs] = useState(false);
  const driverRef = useRef<any>(null);
  const attemptedDriver = useRef(false);

  const startFallbackTour = useCallback(() => {
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (tourCompleted) return;
    if (attemptedDriver.current) return;
    attemptedDriver.current = true;

    // Try to load driver.js dynamically
    import("driver.js")
      .then((mod) => {
        // Also load the CSS
        // @ts-ignore -- CSS import handled by bundler
        import("driver.js/dist/driver.css").catch(() => {});

        const driver = mod.driver({
          showProgress: true,
          animate: true,
          allowClose: true,
          overlayColor: "rgba(0,0,0,0.5)",
          steps: TOUR_STEPS.map((step) => ({
            element: step.element,
            popover: {
              title: step.title,
              description: step.description,
              side: step.position as any,
            },
          })),
          onDestroyStarted: () => {
            markComplete();
            driver.destroy();
          },
          onNextClick: () => {
            const step = TOUR_STEPS[driver.getActiveIndex() ?? 0];
            if (step) {
              markStepDone(step.element);
            }
            driver.moveNext();
          },
        });

        driverRef.current = driver;
        setUseDriverJs(true);

        // Small delay to ensure DOM is ready
        setTimeout(() => driver.drive(), 500);
      })
      .catch(() => {
        // driver.js not installed, use fallback
        startFallbackTour();
      });

    return () => {
      if (driverRef.current) {
        try {
          driverRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [tourCompleted, startFallbackTour]);

  function markStepDone(element: string) {
    fetch("/api/onboarding-tour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "step", step: element }),
    }).catch(() => {});
  }

  function markComplete() {
    fetch("/api/onboarding-tour", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    }).catch(() => {});
  }

  // If driver.js is handling it, don't render fallback
  if (useDriverJs || tourCompleted) return null;

  // Fallback tooltip-based tour
  if (currentStep < 0 || currentStep >= TOUR_STEPS.length) return null;

  const step = TOUR_STEPS[currentStep];

  function handleNext() {
    markStepDone(step.element);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markComplete();
      setCurrentStep(-1);
    }
  }

  function handleSkip() {
    markComplete();
    setCurrentStep(-1);
  }

  return (
    <FallbackTooltip
      step={step}
      currentIndex={currentStep}
      totalSteps={TOUR_STEPS.length}
      onNext={handleNext}
      onSkip={handleSkip}
    />
  );
}

function FallbackTooltip({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onSkip,
}: {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const el = document.querySelector(step.element);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      });
    }
  }, [step.element]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-black/40" onClick={onSkip} />

      {/* Tooltip */}
      <div
        className="fixed z-[9999] w-72 rounded-[1.75rem] bg-white p-5 shadow-xl border border-border/50"
        style={{ top: position.top, left: position.left }}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold">{step.title}</h4>
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {currentIndex + 1} of {totalSteps}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              onClick={onNext}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {currentIndex === totalSteps - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
