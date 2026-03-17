import { cn } from "@/lib/utils";
import {
  Newspaper,
  Mic,
  MessageCircle,
  Tv,
  Users,
  Award,
  Zap,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import PricingCard from "@/components/subscription/pricing-card";
import { createClient } from "@/lib/supabase/server";

const features = [
  {
    icon: Newspaper,
    title: "Full News Cycle",
    description:
      "AI-generated articles, columns, and hot takes that react to every game, every decision, every moment of your dynasty.",
  },
  {
    icon: Mic,
    title: "Press Conferences",
    description:
      "Step to the podium after every game. Answer tough questions, dodge controversies, or create headlines of your own.",
  },
  {
    icon: MessageCircle,
    title: "Social Reactions",
    description:
      "Fans, rivals, and analysts flood the feeds. See how the internet reacts to your wins, losses, and everything in between.",
  },
  {
    icon: Tv,
    title: "Broadcast Shows",
    description:
      "Watch studio analysts debate your ranking, question your play-calling, and predict your future on AI-generated broadcast segments.",
  },
  {
    icon: Users,
    title: "Recruit Storylines",
    description:
      "Every recruit has a story. Follow dynamic recruiting narratives with twists, visits, flips, and commitment drama.",
  },
  {
    icon: Award,
    title: "Trophy Room",
    description:
      "Track your legacy across seasons. Conference titles, Heisman winners, national championships, and coaching milestones.",
  },
] as const;

const steps = [
  {
    icon: Zap,
    step: "01",
    title: "Play Your Game",
    description:
      "Play your College Football 26 Dynasty Mode game as you normally would. No mods, no plugins required.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Report Results",
    description:
      "Submit your game results, stats, and rankings. It takes less than two minutes per week.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Watch It Come Alive",
    description:
      "The AI generates a full media cycle: articles, social reactions, press conferences, shows, and more.",
  },
] as const;

const testimonials = [
  {
    quote:
      "I lost to an unranked team in Week 8 and the AI wrote a column titled 'The Emperor Has No Cleats.' I've never felt more attacked by a video game.",
    author: "Coach Mike, Texas A&M Dynasty",
  },
  {
    quote:
      "The press conference after my rivalry game win was better than any post-game interview I've seen on real TV. I dodged a question about the transfer portal and it became a headline.",
    author: "Coach Davis, Oregon Dynasty",
  },
  {
    quote:
      "Watching the social media feed blow up after I upset the #1 team in the country was the most immersive gaming experience I've ever had.",
    author: "Coach Thompson, Vanderbilt Dynasty",
  },
] as const;

const faqs = [
  {
    question: "Do I need to mod my game?",
    answer:
      "No. DynastyWire works entirely outside the game. You play College Football 26 normally and submit your results to DynastyWire after each game.",
  },
  {
    question: "How long does content generation take?",
    answer:
      "Most weekly content generates in under 60 seconds. You'll have a full news cycle, social reactions, and more ready to read almost instantly.",
  },
  {
    question: "Is my first season really free?",
    answer:
      "Yes. Your first full season includes every feature with no credit card required. The core Media Engine remains free forever.",
  },
  {
    question: "What platforms are supported?",
    answer:
      "DynastyWire is a web app that works on any device with a browser. Play your dynasty on any platform and report results from your phone, tablet, or PC.",
  },
] as const;

export default async function LandingPage() {
  let user = null;
  let dynastyId: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (user) {
      const { data: dynasty } = await supabase
        .from("dynasties")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      dynastyId = dynasty?.id ?? null;
    }
  } catch {
    // Supabase not configured yet — continue as unauthenticated
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Top Nav */}
      <nav className="flex items-center justify-between border-b border-dw-border px-4 py-3 sm:px-8">
        <span className="font-headline text-sm uppercase tracking-[0.2em] text-ink">
          DynastyWire
        </span>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {dynastyId && (
                <Link
                  href={`/${dynastyId}`}
                  className={cn(
                    "rounded bg-dw-accent px-5 py-2",
                    "font-sans text-xs font-semibold uppercase tracking-wider text-white",
                    "transition-colors hover:bg-dw-accent2"
                  )}
                >
                  My Dynasty
                </Link>
              )}
              {!dynastyId && (
                <Link
                  href="/create-dynasty"
                  className={cn(
                    "rounded bg-dw-accent px-5 py-2",
                    "font-sans text-xs font-semibold uppercase tracking-wider text-white",
                    "transition-colors hover:bg-dw-accent2"
                  )}
                >
                  Create Dynasty
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-sans text-xs font-medium uppercase tracking-wider text-ink2 transition-colors hover:text-ink"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  "rounded bg-dw-accent px-5 py-2",
                  "font-sans text-xs font-semibold uppercase tracking-wider text-white",
                  "transition-colors hover:bg-dw-accent2"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1
          className={cn(
            "font-headline uppercase tracking-[0.3em] text-ink",
            "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
            "leading-tight"
          )}
        >
          DynastyWire
        </h1>

        <div className="rule-diamond my-6 w-full max-w-xs">
          <span className="diamond" />
        </div>

        <p className="font-serif text-xl italic text-ink2 sm:text-2xl">
          Your Dynasty. Your Story.
        </p>

        <p className="mt-4 max-w-xl font-serif text-sm text-ink3 sm:text-base">
          The AI-powered media universe for College Football 26 Dynasty Mode.
          Every game generates a full news cycle, social reactions, press
          conferences, and broadcast shows.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/signup"
            className={cn(
              "inline-block rounded bg-dw-accent px-8 py-3",
              "font-sans text-sm font-semibold uppercase tracking-wider text-white",
              "transition-colors hover:bg-dw-accent2"
            )}
          >
            Start Your Dynasty
          </Link>
          <Link
            href="#how-it-works"
            className={cn(
              "inline-block rounded border border-dw-border bg-paper2 px-8 py-3",
              "font-sans text-sm font-semibold uppercase tracking-wider text-ink",
              "transition-colors hover:bg-paper3"
            )}
          >
            See How It Works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-dw-border bg-paper2 px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
            The Full Media Experience
          </h2>
          <p className="mt-2 text-center font-serif text-sm italic text-ink2">
            Every feature of a real sports media ecosystem, powered by AI.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto mb-4 h-8 w-8 text-dw-accent" />
                <h3 className="font-headline text-lg uppercase tracking-wider text-ink">
                  {title}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-ink2">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-t border-dw-border bg-paper px-4 py-16"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
            How It Works
          </h2>

          <div className="rule-diamond mx-auto my-6 w-full max-w-xs">
            <span className="diamond" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, step, title, description }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-dw-border bg-paper2">
                  <Icon className="h-6 w-6 text-dw-accent" />
                </div>
                <p className="mt-4 font-sans text-xs font-bold uppercase tracking-widest text-dw-accent">
                  Step {step}
                </p>
                <h3 className="mt-1 font-headline text-lg uppercase tracking-wider text-ink">
                  {title}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-ink2">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-dw-border bg-paper2 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
            From the Wire
          </h2>
          <p className="mt-2 text-center font-serif text-sm italic text-ink2">
            What dynasty builders are saying.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="rounded border border-dw-border bg-paper p-6"
              >
                <p className="font-serif text-sm italic leading-relaxed text-ink2">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-4 border-t border-dw-border pt-3">
                  <p className="font-sans text-xs font-medium uppercase tracking-wider text-ink3">
                    {testimonial.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-dw-border bg-paper px-4 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
            Pricing
          </h2>
          <p className="mt-2 text-center font-serif text-sm italic text-ink2">
            Start free. Upgrade when you&apos;re ready.
          </p>

          <div className="mt-10">
            <PricingCard />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-dw-border bg-paper2 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
            Questions & Answers
          </h2>

          <div className="rule-diamond mx-auto my-6 w-full max-w-xs">
            <span className="diamond" />
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded border border-dw-border bg-paper p-6"
              >
                <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
                  {faq.question}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-ink2">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-dw-border bg-paper px-4 py-20 text-center">
        <h2 className="font-headline text-2xl uppercase tracking-wider text-ink sm:text-3xl">
          Ready to Build Your Legacy?
        </h2>
        <p className="mt-3 font-serif text-base italic text-ink2">
          Your first season is completely free. No credit card required.
        </p>
        <Link
          href="/signup"
          className={cn(
            "mt-8 inline-block rounded bg-dw-accent px-10 py-3",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-colors hover:bg-dw-accent2"
          )}
        >
          Start Your Dynasty
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-dw-border bg-paper3 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <p className="font-headline text-sm uppercase tracking-widest text-ink">
                DynastyWire
              </p>
              <p className="mt-2 font-serif text-xs leading-relaxed text-ink3">
                The AI-powered media universe for College Football 26 Dynasty
                Mode.
              </p>
            </div>

            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-ink3">
                Product
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                <Link
                  href="#how-it-works"
                  className="font-serif text-sm text-ink2 hover:text-ink"
                >
                  How It Works
                </Link>
                <Link
                  href="/pricing"
                  className="font-serif text-sm text-ink2 hover:text-ink"
                >
                  Pricing
                </Link>
                <Link
                  href="/signup"
                  className="font-serif text-sm text-ink2 hover:text-ink"
                >
                  Sign Up
                </Link>
              </nav>
            </div>

            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-ink3">
                Support
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="font-serif text-sm text-ink2 hover:text-ink"
                >
                  Log In
                </Link>
                <Link
                  href="#pricing"
                  className="font-serif text-sm text-ink2 hover:text-ink"
                >
                  FAQ
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-8 border-t border-dw-border pt-6 text-center">
            <p className="font-serif text-xs text-ink3">
              &copy; {new Date().getFullYear()} DynastyWire. All rights
              reserved. Not affiliated with EA Sports.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
