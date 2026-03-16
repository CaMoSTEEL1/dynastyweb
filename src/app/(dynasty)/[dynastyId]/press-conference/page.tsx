"use client";

import { useState, useCallback, useEffect, use } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import ConferenceSetup from "@/components/press-conference/conference-setup";
import QuestionDisplay from "@/components/press-conference/question-display";
import GradeDisplay from "@/components/press-conference/grade-display";
import { createClient } from "@/lib/supabase/client";
import type {
  PressConfQuestion,
  PressConfExchange,
  PressConfGrade,
  ResponseOption,
  PressConfSession,
} from "@/lib/ai/press-conference-types";
import { cn } from "@/lib/utils";

interface SessionContext {
  school: string;
  coachName: string;
  week: number;
  seasonId: string;
  dynastyId: string;
}

type PageStatus = PressConfSession["status"];

async function fetchInitialOptions(
  question: PressConfQuestion,
  sessionContext: { school: string; coachName: string; week: number }
): Promise<ResponseOption[]> {
  const res = await fetch("/api/press-conference/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: "Introduction: The press conference is about to begin.",
      userAnswer: "Alright, let's get started.",
      tone: "honest",
      sessionContext,
      nextQuestion: question.question,
    }),
  });

  if (!res.ok) {
    return [
      {
        id: "opt_1",
        label: "Straightforward",
        tone: "honest" as const,
        text: "I'll be honest with you all about how I see things right now.",
      },
      {
        id: "opt_2",
        label: "Redirect Focus",
        tone: "deflect" as const,
        text: "I think the important thing is we keep our focus on what's ahead.",
      },
      {
        id: "opt_3",
        label: "Team First",
        tone: "coachspeak" as const,
        text: "Credit goes to our players and staff. We just try to get better every day.",
      },
      {
        id: "opt_4",
        label: "Fire Back",
        tone: "fiery" as const,
        text: "Look, I'm not going to apologize for how we do things around here.",
      },
    ];
  }

  const data = (await res.json()) as { followUp: string | null; nextOptions: ResponseOption[] | null };
  return data.nextOptions ?? [];
}

async function savePressConference(
  seasonId: string,
  week: number,
  exchanges: PressConfExchange[],
  grade: PressConfGrade
): Promise<void> {
  const supabase = createClient();

  await supabase.from("press_conferences").insert({
    season_id: seasonId,
    week,
    questions_answers: exchanges,
    grade,
  });
}

export default function PressConferencePage({
  params,
}: {
  params: Promise<{ dynastyId: string }>;
}) {
  const { dynastyId } = use(params);

  const [status, setStatus] = useState<PageStatus>("setup");
  const [questions, setQuestions] = useState<PressConfQuestion[]>([]);
  const [exchanges, setExchanges] = useState<PressConfExchange[]>([]);
  const [grade, setGrade] = useState<PressConfGrade | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<ResponseOption[] | null>(null);
  const [pendingNextOptions, setPendingNextOptions] = useState<ResponseOption[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [currentExchange, setCurrentExchange] = useState<Partial<PressConfExchange> | null>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const { data: dynasty } = await supabase
        .from("dynasties")
        .select("school, coach_name")
        .eq("id", dynastyId)
        .single();

      if (!dynasty) {
        setLoading(false);
        return;
      }

      const { data: season } = await supabase
        .from("seasons")
        .select("id, current_week, season_state")
        .eq("dynasty_id", dynastyId)
        .order("year", { ascending: false })
        .limit(1)
        .single();

      if (!season) {
        setLoading(false);
        return;
      }

      const week = (season.current_week as number) ?? 1;

      setContext({
        school: dynasty.school as string,
        coachName: dynasty.coach_name as string,
        week,
        seasonId: season.id as string,
        dynastyId,
      });

      const { data: submission } = await supabase
        .from("weekly_submissions")
        .select("id, raw_input")
        .eq("season_id", season.id as string)
        .eq("status", "complete")
        .order("week", { ascending: false })
        .limit(1)
        .single();

      if (!submission) {
        setLoading(false);
        return;
      }

      // Try to load AI-generated press conference questions from content_cache
      const { data: cached } = await supabase
        .from("content_cache")
        .select("content")
        .eq("weekly_submission_id", submission.id as string)
        .eq("content_type", "press_conf")
        .limit(1)
        .single();

      const pressConfContent = cached?.content as { questions?: PressConfQuestion[]; error?: boolean } | null;

      if (
        pressConfContent &&
        !pressConfContent.error &&
        Array.isArray(pressConfContent.questions) &&
        pressConfContent.questions.length > 0
      ) {
        setQuestions(pressConfContent.questions);
      } else {
        const submissionData = submission.raw_input as Record<string, unknown> | null;
        const defaultQuestions = generateDefaultQuestions(
          dynasty.school as string,
          dynasty.coach_name as string,
          week,
          submissionData
        );
        setQuestions(defaultQuestions);
      }

      setLoading(false);
    }

    loadData();
  }, [dynastyId]);

  const handleStart = useCallback(async () => {
    if (!context || questions.length === 0) return;

    setStatus("in_progress");
    setCurrentQuestionIndex(0);
    setIsFollowUp(false);
    setShowNextButton(false);

    const options = await fetchInitialOptions(questions[0], {
      school: context.school,
      coachName: context.coachName,
      week: context.week,
    });
    setCurrentOptions(options);
  }, [context, questions]);

  const handleAnswer = useCallback(
    async (answer: string, tone: string, mode: "choice" | "text" | "voice") => {
      if (!context) return;

      setIsSubmitting(true);

      if (isFollowUp && currentExchange) {
        const completedExchange: PressConfExchange = {
          question: currentExchange.question as PressConfQuestion,
          responseMode: currentExchange.responseMode as "choice" | "text" | "voice",
          userAnswer: currentExchange.userAnswer as string,
          selectedTone: currentExchange.selectedTone as string,
          followUp: currentFollowUp,
          followUpAnswer: answer,
        };

        setExchanges((prev) => [...prev, completedExchange]);
        setIsFollowUp(false);
        setCurrentFollowUp(null);
        setCurrentExchange(null);
        setIsSubmitting(false);
        setShowNextButton(true);
        return;
      }

      const currentQuestion = questions[currentQuestionIndex];
      const nextQuestionExists = currentQuestionIndex + 1 < questions.length;
      const nextQuestion = nextQuestionExists ? questions[currentQuestionIndex + 1] : null;

      try {
        const res = await fetch("/api/press-conference/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: currentQuestion.question,
            userAnswer: answer,
            tone,
            sessionContext: {
              school: context.school,
              coachName: context.coachName,
              week: context.week,
            },
            nextQuestion: nextQuestion?.question ?? null,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as {
            followUp: string | null;
            nextOptions: ResponseOption[] | null;
          };

          if (data.followUp) {
            setCurrentExchange({
              question: currentQuestion,
              responseMode: mode,
              userAnswer: answer,
              selectedTone: tone,
            });
            setCurrentFollowUp(data.followUp);
            setIsFollowUp(true);
            // Store next-question options for after the follow-up
            setPendingNextOptions(data.nextOptions);
            setIsSubmitting(false);
            return;
          }

          const exchange: PressConfExchange = {
            question: currentQuestion,
            responseMode: mode,
            userAnswer: answer,
            selectedTone: tone,
            followUp: null,
            followUpAnswer: null,
          };
          setExchanges((prev) => [...prev, exchange]);

          // Store options for the next question
          setPendingNextOptions(data.nextOptions);
        } else {
          const exchange: PressConfExchange = {
            question: currentQuestion,
            responseMode: mode,
            userAnswer: answer,
            selectedTone: tone,
            followUp: null,
            followUpAnswer: null,
          };
          setExchanges((prev) => [...prev, exchange]);
        }
      } catch {
        const exchange: PressConfExchange = {
          question: currentQuestion,
          responseMode: mode,
          userAnswer: answer,
          selectedTone: tone,
          followUp: null,
          followUpAnswer: null,
        };
        setExchanges((prev) => [...prev, exchange]);
      }

      setIsSubmitting(false);
      setShowNextButton(true);
    },
    [context, questions, currentQuestionIndex, isFollowUp, currentExchange, currentFollowUp]
  );

  const handleNextQuestion = useCallback(async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      setStatus("grading");

      const allExchanges = [...exchanges];
      if (!context) return;

      try {
        const res = await fetch("/api/press-conference/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exchanges: allExchanges,
            sessionContext: {
              school: context.school,
              coachName: context.coachName,
              week: context.week,
            },
          }),
        });

        if (res.ok) {
          const gradeResult = (await res.json()) as PressConfGrade;
          setGrade(gradeResult);

          await savePressConference(
            context.seasonId,
            context.week,
            allExchanges,
            gradeResult
          );

          setStatus("complete");
        } else {
          setStatus("in_progress");
        }
      } catch {
        setStatus("in_progress");
      }
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setShowNextButton(false);
    setIsFollowUp(false);
    setCurrentFollowUp(null);
    setCurrentExchange(null);

    // Use pending options from the previous question's API response
    if (pendingNextOptions && pendingNextOptions.length > 0) {
      setCurrentOptions(pendingNextOptions);
      setPendingNextOptions(null);
    } else if (context) {
      // Fetch fresh options if none were pre-generated
      fetchInitialOptions(questions[nextIndex], {
        school: context.school,
        coachName: context.coachName,
        week: context.week,
      }).then((opts) => setCurrentOptions(opts));
    }
  }, [currentQuestionIndex, questions, exchanges, context, pendingNextOptions]);

  if (loading) {
    return (
      <div>
        <SectionHeader title="PRESS CONFERENCE" subtitle="Step to the podium" />
        <div className="mt-8 flex items-center justify-center rounded border border-dw-border bg-paper2 px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
            <p className="font-sans text-xs uppercase tracking-wider text-ink3">
              Setting up the media room...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!context || questions.length === 0) {
    return (
      <div>
        <SectionHeader title="PRESS CONFERENCE" subtitle="Step to the podium" />
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-serif text-ink2">
            The media room is empty &mdash; for now. After your next game, reporters
            will have questions. Will you give them coach-speak, or say something
            that makes headlines?
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = isFollowUp && currentFollowUp
    ? {
        reporterName: exchanges.length > 0
          ? (currentExchange?.question?.reporterName ?? questions[currentQuestionIndex]?.reporterName ?? "Reporter")
          : (questions[currentQuestionIndex]?.reporterName ?? "Reporter"),
        outlet: exchanges.length > 0
          ? (currentExchange?.question?.outlet ?? questions[currentQuestionIndex]?.outlet ?? "")
          : (questions[currentQuestionIndex]?.outlet ?? ""),
        question: currentFollowUp,
        tone: "neutral" as const,
      }
    : questions[currentQuestionIndex];

  const followUpOptions: ResponseOption[] = [
    {
      id: "fu_1",
      label: "Clarify",
      tone: "honest",
      text: "Let me be clear about what I meant. I stand by my players and our approach.",
    },
    {
      id: "fu_2",
      label: "Move On",
      tone: "deflect",
      text: "I think I've addressed that. Let's move on to the next question.",
    },
    {
      id: "fu_3",
      label: "Stay the Course",
      tone: "coachspeak",
      text: "Like I said, we're focused on getting better every day. That's all I can tell you.",
    },
    {
      id: "fu_4",
      label: "Push Back",
      tone: "fiery",
      text: "I already answered that. If you don't like my answer, that's your problem, not mine.",
    },
  ];

  return (
    <div>
      <SectionHeader title="PRESS CONFERENCE" subtitle="Step to the podium" />

      <div className="mt-8">
        {status === "setup" && (
          <ConferenceSetup
            questions={questions}
            week={context.week}
            coachName={context.coachName}
            school={context.school}
            onStart={handleStart}
          />
        )}

        {status === "in_progress" && currentQuestion && (
          <QuestionDisplay
            question={currentQuestion}
            questionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            responseOptions={isFollowUp ? followUpOptions : currentOptions}
            isFollowUp={isFollowUp}
            onAnswer={handleAnswer}
            onNextQuestion={handleNextQuestion}
            showNextButton={showNextButton}
            isSubmitting={isSubmitting}
          />
        )}

        {status === "grading" && (
          <div className="mx-auto max-w-2xl">
            <div className="rounded border border-dw-border bg-paper2 p-12 text-center">
              <div className="mb-4 flex justify-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full bg-dw-accent",
                      "animate-pulse"
                    )}
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
              <p className="font-headline text-sm uppercase tracking-wider text-ink">
                Grading Your Performance
              </p>
              <p className="mt-2 font-serif text-sm italic text-ink3">
                The media is reviewing your responses...
              </p>
            </div>
          </div>
        )}

        {status === "complete" && grade && (
          <GradeDisplay grade={grade} coachName={context.coachName} />
        )}
      </div>
    </div>
  );
}

function generateDefaultQuestions(
  school: string,
  coachName: string,
  week: number,
  submissionData: Record<string, unknown> | null
): PressConfQuestion[] {
  const result = submissionData?.result as string | undefined;
  const opponent = submissionData?.opponent as string | undefined;
  const userScore = submissionData?.userScore as number | undefined;
  const opponentScore = submissionData?.opponentScore as number | undefined;

  const isWin = result === "W" || (userScore !== undefined && opponentScore !== undefined && userScore > opponentScore);
  const oppName = opponent ?? "your opponent";
  const scoreLine =
    userScore !== undefined && opponentScore !== undefined
      ? `${userScore}-${opponentScore}`
      : "";

  const questions: PressConfQuestion[] = [];

  if (isWin) {
    questions.push({
      reporterName: "Marcus Webb",
      outlet: "The Athletic",
      question: `Coach ${coachName}, ${scoreLine ? `a ${scoreLine} win over ${oppName}` : `the win over ${oppName}`} — what was the key to your team's success tonight?`,
      tone: "friendly",
    });
    questions.push({
      reporterName: "Sarah Chen",
      outlet: "ESPN",
      question: `There were some stretches where your offense went cold. How concerned are you about consistency heading into Week ${week + 1}?`,
      tone: "neutral",
    });
    questions.push({
      reporterName: "Derek Hollis",
      outlet: "247Sports",
      question: `Your defense gave up some big plays in the second half. Is that a scheme issue or an execution issue?`,
      tone: "hostile",
    });
    questions.push({
      reporterName: "Tanya Brooks",
      outlet: "CBS Sports",
      question: `Coach, some fans on social media are saying ${school} still hasn't beaten anyone good this year. What's your response to the critics?`,
      tone: "gotcha",
    });
    questions.push({
      reporterName: "James Moreau",
      outlet: `${school} Insider`,
      question: `Can you talk about your quarterback's development? We saw some real growth tonight.`,
      tone: "friendly",
    });
  } else {
    questions.push({
      reporterName: "Marcus Webb",
      outlet: "The Athletic",
      question: `Coach ${coachName}, ${scoreLine ? `a tough ${scoreLine} loss to ${oppName}` : `the loss to ${oppName}`} — where did things go wrong tonight?`,
      tone: "neutral",
    });
    questions.push({
      reporterName: "Sarah Chen",
      outlet: "ESPN",
      question: `Your team has now dropped ${week > 3 ? "multiple games" : "a game"} this season. Are you worried about the trajectory of this program?`,
      tone: "hostile",
    });
    questions.push({
      reporterName: "Derek Hollis",
      outlet: "247Sports",
      question: `There's been talk about whether you might make changes to the starting lineup. Can you address that?`,
      tone: "gotcha",
    });
    questions.push({
      reporterName: "Tanya Brooks",
      outlet: "CBS Sports",
      question: `Coach, the fans are frustrated. What do you say to the ${school} faithful who expected more this season?`,
      tone: "hostile",
    });
    questions.push({
      reporterName: "James Moreau",
      outlet: `${school} Insider`,
      question: `Despite the result, were there any positives you can take away from tonight's performance?`,
      tone: "friendly",
    });
  }

  return questions;
}
