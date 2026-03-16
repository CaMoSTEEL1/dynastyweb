"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Newspaper,
  MessageCircle,
  Mic,
  Users,
  Tv,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTutorial } from "./tutorial-context";

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: TutorialStep[] = [
  {
    icon: Sparkles,
    title: "Welcome to DynastyWire",
    description:
      "Your dynasty has its own living media universe. Every game you play generates headlines, hot takes, and storylines \u2014 all powered by AI. This quick tour will show you everything DynastyWire has to offer.",
  },
  {
    icon: FileText,
    title: "Submit Weekly Results",
    description:
      "After each game, submit your results by uploading a screenshot or entering them manually. This kicks off the AI content engine, generating a full week of media coverage based on what happened on the field.",
  },
  {
    icon: Newspaper,
    title: "Front Page",
    description:
      "Your personalized front page fills with AI-generated articles, recaps, and feature stories after every week. Headlines shift based on your wins, losses, upsets, and rivalries \u2014 just like a real sports news site.",
  },
  {
    icon: MessageCircle,
    title: "Social Feed",
    description:
      "Check the social feed for fan reactions, analyst hot takes, and recruit buzz. The tone shifts with your performance \u2014 win big and you\u2019re a genius, lose and the fanbase lets you hear about it.",
  },
  {
    icon: Mic,
    title: "Press Conference",
    description:
      "Step to the podium and answer questions from the media. Your responses shape headlines and influence how fans, analysts, and recruits perceive your program. Choose your words carefully.",
  },
  {
    icon: Users,
    title: "Recruiting",
    description:
      "Follow dynamic recruiting narratives throughout the season. Watch as prospects react to your wins and losses, and see how your program\u2019s trajectory influences their decisions.",
  },
  {
    icon: Tv,
    title: "Rankings & Shows",
    description:
      "Tune into studio analyst debates, ranking reveals, and weekly power rankings. AI-generated show segments break down your season with the drama and spectacle of real college football media.",
  },
  {
    icon: Award,
    title: "Trophy Room",
    description:
      "Track your legacy across seasons in the trophy room. Conference titles, bowl wins, All-Americans, and milestone victories are all preserved as your dynasty\u2019s permanent record.",
  },
  {
    icon: Settings,
    title: "Settings",
    description:
      "Customize your AI content generation preferences, start new seasons, and manage your dynasty. Fine-tune the experience to match exactly how you want your media universe to run.",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function TutorialWizard() {
  const { isTutorialOpen, hideTutorial } = useTutorial();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    hideTutorial();
    setCurrentStep(0);
    setDirection(0);
  }, [hideTutorial]);

  if (!isTutorialOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isTutorialOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Card */}
          <motion.div
            className={cn(
              "relative z-10 w-full max-w-lg",
              "bg-paper border border-dw-border rounded-sm shadow-2xl",
              "overflow-hidden"
            )}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top decorative rule */}
            <div className="h-1 bg-dw-accent" />

            {/* Step content */}
            <div className="px-8 pt-8 pb-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex flex-col items-center text-center"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-5",
                      "bg-paper3 border border-dw-border"
                    )}
                  >
                    <Icon className="w-8 h-8 text-dw-accent" />
                  </div>

                  {/* Title */}
                  <h2 className="font-headline text-2xl text-ink tracking-tight mb-3">
                    {step.title}
                  </h2>

                  {/* Description */}
                  <p className="font-serif text-ink2 text-sm leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="border-t border-dw-border mx-8" />

            {/* Footer */}
            <div className="px-8 py-5 flex items-center justify-between">
              {/* Step dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDirection(i > currentStep ? 1 : -1);
                      setCurrentStep(i);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      i === currentStep
                        ? "bg-dw-accent w-4"
                        : "bg-ink3 hover:bg-ink2"
                    )}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                {isFirst ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      "px-4 py-2 text-xs uppercase tracking-wider font-sans",
                      "text-ink2 hover:text-ink transition-colors duration-200"
                    )}
                  >
                    Skip
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goBack}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-wider font-sans",
                      "text-ink2 hover:text-ink transition-colors duration-200"
                    )}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}

                {isLast ? (
                  <button
                    type="button"
                    onClick={handleClose}
                    className={cn(
                      "flex items-center gap-1 px-5 py-2 text-xs uppercase tracking-wider font-sans",
                      "bg-dw-accent text-paper rounded-sm",
                      "hover:opacity-90 transition-opacity duration-200"
                    )}
                  >
                    Done
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    className={cn(
                      "flex items-center gap-1 px-5 py-2 text-xs uppercase tracking-wider font-sans",
                      "bg-dw-accent text-paper rounded-sm",
                      "hover:opacity-90 transition-opacity duration-200"
                    )}
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
