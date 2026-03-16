"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { POSITIONS } from "@/lib/recruiting/types";
import { addRecruit } from "@/lib/recruiting/actions";

interface AddRecruitFormProps {
  dynastyId: string;
  seasonId: string;
  onAdded: () => void;
}

export function AddRecruitForm({
  dynastyId,
  seasonId,
  onAdded,
}: AddRecruitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState<string>("QB");
  const [stars, setStars] = useState(3);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setName("");
    setPosition("QB");
    setStars(3);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("position", position);
    formData.set("stars", String(stars));

    startTransition(async () => {
      const result = await addRecruit(dynastyId, seasonId, formData);
      if (result.success) {
        resetForm();
        setIsOpen(false);
        onAdded();
      } else {
        setError(result.error ?? "Failed to add recruit");
      }
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded border border-dashed border-dw-border bg-paper2 px-4 py-3 font-sans text-sm text-ink2 transition-colors hover:border-dw-accent hover:text-dw-accent"
      >
        + Add Recruit to Board
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded border border-dw-border bg-paper2 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <div>
          <label
            htmlFor="recruit-name"
            className="mb-1 block font-headline text-xs uppercase tracking-wider text-ink3"
          >
            Name
          </label>
          <input
            id="recruit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recruit name"
            required
            maxLength={60}
            disabled={isPending}
            className="w-full rounded border border-dw-border bg-paper px-3 py-2 font-sans text-sm text-ink placeholder:text-ink3 focus:border-dw-accent focus:outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="recruit-position"
            className="mb-1 block font-headline text-xs uppercase tracking-wider text-ink3"
          >
            Position
          </label>
          <select
            id="recruit-position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isPending}
            className="w-full rounded border border-dw-border bg-paper px-3 py-2 font-sans text-sm text-ink focus:border-dw-accent focus:outline-none disabled:opacity-50"
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1 block font-headline text-xs uppercase tracking-wider text-ink3">
            Stars
          </span>
          <div className="flex items-center gap-0.5 py-1.5">
            {Array.from({ length: 5 }, (_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={starValue}
                  type="button"
                  onClick={() => setStars(starValue)}
                  disabled={isPending}
                  className="group disabled:opacity-50"
                  aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                >
                  <svg
                    className={cn(
                      "h-6 w-6 transition-colors",
                      starValue <= stars
                        ? "fill-dw-yellow text-dw-yellow"
                        : "fill-none text-ink3 group-hover:text-dw-yellow"
                    )}
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isPending || !name.trim()}
            className="rounded bg-dw-accent px-4 py-2 font-sans text-sm font-medium text-paper transition-colors hover:bg-dw-accent2 disabled:opacity-50"
          >
            {isPending ? "Adding..." : "Add to Board"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsOpen(false);
            }}
            disabled={isPending}
            className="rounded px-3 py-2 font-sans text-sm text-ink3 transition-colors hover:text-ink disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {isPending && (
        <p className="mt-3 font-serif text-sm italic text-ink3">
          Generating backstory for this recruit...
        </p>
      )}

      {error && (
        <p className="mt-3 font-sans text-sm text-dw-red">{error}</p>
      )}
    </form>
  );
}
