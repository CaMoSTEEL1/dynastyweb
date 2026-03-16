import { cn } from "@/lib/utils";
import CreateDynastyForm from "@/components/dynasty/create-dynasty-form";

export default function CreateDynastyPage() {
  return (
    <div className={cn("min-h-screen bg-paper")}>
      <header className={cn("w-full py-10 text-center")}>
        <h1
          className={cn(
            "font-headline text-ink uppercase tracking-[0.3em]",
            "text-3xl sm:text-4xl md:text-5xl"
          )}
        >
          DynastyWire
        </h1>
        <div className="rule-diamond my-4 md:my-6">
          <span className="diamond" />
        </div>
        <p className={cn("font-serif italic text-ink2 text-base md:text-lg")}>
          Establish Your Program
        </p>
      </header>

      <section className={cn("max-w-2xl mx-auto px-4 pb-16")}>
        <div
          className={cn(
            "bg-paper2 border border-dw-border rounded-sm",
            "p-6 md:p-10"
          )}
        >
          <h2
            className={cn(
              "font-headline text-ink uppercase tracking-widest text-lg md:text-xl",
              "mb-1"
            )}
          >
            Create Dynasty
          </h2>
          <p className={cn("font-serif text-ink3 text-sm mb-8")}>
            Choose your school, name your coach, and set the stage for glory.
          </p>
          <CreateDynastyForm />
        </div>
      </section>
    </div>
  );
}
