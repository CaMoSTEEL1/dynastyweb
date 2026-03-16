import { Suspense } from "react";
import ConfirmEmailContent from "./confirm-email-content";

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper">
          <p className="font-serif text-sm italic text-ink3">Loading...</p>
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}
