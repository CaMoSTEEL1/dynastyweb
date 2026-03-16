import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded border border-dw-border bg-paper2 p-8">
        <h1 className="text-center font-headline text-2xl uppercase tracking-[0.2em] text-ink">
          DynastyWire
        </h1>

        <p className="mt-2 text-center font-serif text-sm italic text-ink2">
          Join the Wire
        </p>

        <SignupForm />
      </div>
    </div>
  );
}
