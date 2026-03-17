"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ExtractionResult,
  ExtractedField,
  ConfidenceLevel,
} from "@/lib/extraction/types";
import { getExtractionQuality } from "@/lib/extraction/types";
import type { WeeklyInputForm } from "@/lib/weekly/validation";

interface ConfidenceReviewProps {
  result: ExtractionResult;
  week: number;
  onConfirm: (finalData: WeeklyInputForm) => void;
  onReExtract: () => void;
}

interface EditableState {
  opponent: string;
  opponentRanking: string;
  homeAway: "home" | "away";
  userScore: string;
  opponentScore: string;
  gameVibe: string;
  notableMoment: string;
  statLeaders: Array<{ name: string; position: string; stat: string }>;
  recruitUpdates: Array<{
    action: "offer" | "commit" | "decommit" | "portal_loss";
    name: string;
    position: string;
    stars: number;
  }>;
  newRanking: string;
}

interface FieldConfidences {
  opponent: ConfidenceLevel;
  opponentRanking: ConfidenceLevel;
  homeAway: ConfidenceLevel;
  userScore: ConfidenceLevel;
  opponentScore: ConfidenceLevel;
  gameVibe: ConfidenceLevel;
  notableMoment: ConfidenceLevel;
  statLeaders: ConfidenceLevel;
  recruitUpdates: ConfidenceLevel;
  newRanking: ConfidenceLevel;
}

const GAME_VIBE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "dominant_win", label: "Dominant Win" },
  { value: "close_win", label: "Close Win" },
  { value: "blowout_win", label: "Blowout Win" },
  { value: "close_loss", label: "Close Loss" },
  { value: "dominant_loss", label: "Dominant Loss" },
  { value: "blowout_loss", label: "Blowout Loss" },
];

const RECRUIT_ACTION_OPTIONS: Array<{
  value: "offer" | "commit" | "decommit" | "portal_loss";
  label: string;
}> = [
  { value: "offer", label: "Offer" },
  { value: "commit", label: "Commit" },
  { value: "decommit", label: "Decommit" },
  { value: "portal_loss", label: "Portal Loss" },
];

function getVibeLabel(vibe: string): string {
  return GAME_VIBE_OPTIONS.find((o) => o.value === vibe)?.label || vibe;
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  switch (level) {
    case "high":
      return (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-dw-green" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-dw-green">
            Confident
          </span>
        </span>
      );
    case "medium":
      return (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-dw-accent2" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-dw-accent2">
            Likely
          </span>
        </span>
      );
    case "low":
      return (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-dw-yellow" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-dw-yellow">
            Uncertain
          </span>
        </span>
      );
    case "missing":
      return (
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-dw-red" />
          <span className="font-sans text-[10px] uppercase tracking-wider text-dw-red">
            Not found
          </span>
        </span>
      );
  }
}

function ConfidenceIcon({ level }: { level: ConfidenceLevel }) {
  switch (level) {
    case "high":
      return <CheckCircle2 className="h-4 w-4 text-dw-green" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-dw-accent2" />;
    case "low":
      return <HelpCircle className="h-4 w-4 text-dw-yellow" />;
    case "missing":
      return <XCircle className="h-4 w-4 text-dw-red" />;
  }
}

function initEditableState(result: ExtractionResult): EditableState {
  return {
    opponent: result.opponent.value || "",
    opponentRanking:
      result.opponentRanking.value !== null
        ? String(result.opponentRanking.value)
        : "",
    homeAway: result.homeAway.value || "home",
    userScore: String(result.userScore.value || 0),
    opponentScore: String(result.opponentScore.value || 0),
    gameVibe: result.gameVibe.value || "dominant_win",
    notableMoment: result.notableMoment.value || "",
    statLeaders: result.statLeaders.value.length > 0
      ? result.statLeaders.value
      : [],
    recruitUpdates: result.recruitUpdates.value.length > 0
      ? result.recruitUpdates.value.map((r) => ({
          action: (["offer", "commit", "decommit", "portal_loss"].includes(r.action)
            ? r.action
            : "offer") as "offer" | "commit" | "decommit" | "portal_loss",
          name: r.name,
          position: r.position,
          stars: Math.max(1, Math.min(5, r.stars)),
        }))
      : [],
    newRanking:
      result.newRanking.value !== null ? String(result.newRanking.value) : "",
  };
}

function initConfidences(result: ExtractionResult): FieldConfidences {
  return {
    opponent: result.opponent.confidence,
    opponentRanking: result.opponentRanking.confidence,
    homeAway: result.homeAway.confidence,
    userScore: result.userScore.confidence,
    opponentScore: result.opponentScore.confidence,
    gameVibe: result.gameVibe.confidence,
    notableMoment: result.notableMoment.confidence,
    statLeaders: result.statLeaders.confidence,
    recruitUpdates: result.recruitUpdates.confidence,
    newRanking: result.newRanking.confidence,
  };
}

export default function ConfidenceReview({
  result,
  week,
  onConfirm,
  onReExtract,
}: ConfidenceReviewProps) {
  const [editable, setEditable] = useState<EditableState>(() =>
    initEditableState(result)
  );
  const [confidences, setConfidences] = useState<FieldConfidences>(() =>
    initConfidences(result)
  );
  const [editingFields, setEditingFields] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const fields: Array<keyof FieldConfidences> = [
      "opponent",
      "opponentRanking",
      "homeAway",
      "userScore",
      "opponentScore",
      "gameVibe",
      "notableMoment",
      "statLeaders",
      "recruitUpdates",
      "newRanking",
    ];
    for (const f of fields) {
      if (
        confidences[f] === "low" ||
        confidences[f] === "missing"
      ) {
        initial.add(f);
      }
    }
    return initial;
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(["gameResult", "gameDetails", "playerStats", "rankings"])
  );

  const quality = useMemo(() => getExtractionQuality(result), [result]);

  const markEdited = useCallback(
    (field: keyof FieldConfidences) => {
      setConfidences((prev) => ({ ...prev, [field]: "high" }));
    },
    []
  );

  const toggleEditing = useCallback((field: string) => {
    setEditingFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];
    if (!editable.opponent.trim()) missing.push("Opponent");
    if (
      editable.userScore === "" ||
      isNaN(Number(editable.userScore))
    )
      missing.push("Your Score");
    if (
      editable.opponentScore === "" ||
      isNaN(Number(editable.opponentScore))
    )
      missing.push("Opponent Score");
    return missing;
  }, [editable]);

  const canConfirm = requiredMissing.length === 0;

  const handleConfirm = useCallback(() => {
    if (!canConfirm) return;

    const userScoreNum = Number(editable.userScore);
    const oppScoreNum = Number(editable.opponentScore);

    let resolvedVibe = editable.gameVibe;
    const validVibes = [
      "dominant_win",
      "close_win",
      "blowout_win",
      "close_loss",
      "dominant_loss",
      "blowout_loss",
    ];
    if (!validVibes.includes(resolvedVibe)) {
      const isWin = userScoreNum > oppScoreNum;
      const margin = Math.abs(userScoreNum - oppScoreNum);
      if (isWin) {
        resolvedVibe =
          margin >= 21 ? "blowout_win" : margin <= 7 ? "close_win" : "dominant_win";
      } else {
        resolvedVibe =
          margin >= 21
            ? "blowout_loss"
            : margin <= 7
              ? "close_loss"
              : "dominant_loss";
      }
    }

    const finalData: WeeklyInputForm = {
      week,
      opponent: editable.opponent.trim(),
      opponentRanking: editable.opponentRanking
        ? Number(editable.opponentRanking)
        : null,
      homeAway: editable.homeAway,
      userScore: userScoreNum,
      opponentScore: oppScoreNum,
      gameVibe: resolvedVibe as WeeklyInputForm["gameVibe"],
      notableMoment: editable.notableMoment.trim() || null,
      statLeaders: editable.statLeaders.filter(
        (sl) => sl.name.trim() && sl.position.trim() && sl.stat.trim()
      ),
      recruitUpdates: editable.recruitUpdates.filter(
        (ru) => ru.name.trim() && ru.position.trim()
      ),
      newRanking: editable.newRanking ? Number(editable.newRanking) : null,
    };

    onConfirm(finalData);
  }, [canConfirm, editable, week, onConfirm]);

  function renderFieldRow(
    label: string,
    fieldKey: keyof FieldConfidences,
    displayValue: string,
    editContent: React.ReactNode,
    required: boolean = false
  ) {
    const confidence = confidences[fieldKey];
    const isEditing = editingFields.has(fieldKey);
    const isEmpty =
      confidence === "missing" ||
      (required && !displayValue.trim());

    return (
      <div
        key={fieldKey}
        className={cn(
          "flex flex-col gap-2 rounded border px-4 py-3 transition-colors",
          isEmpty && required
            ? "border-dw-red/30 bg-dw-red/5"
            : confidence === "low"
              ? "border-dw-yellow/30 bg-dw-yellow/5"
              : "border-dw-border bg-paper2"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ConfidenceIcon level={confidence} />
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink2">
              {label}
            </span>
            {required && (
              <span className="font-sans text-[10px] text-dw-red">Required</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={confidence} />
            {!isEditing && confidence !== "missing" && (
              <button
                type="button"
                onClick={() => toggleEditing(fieldKey)}
                className="text-ink3 transition-colors hover:text-ink2"
                aria-label={`Edit ${label}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-1">{editContent}</div>
        ) : (
          <div className="font-serif text-sm text-ink">
            {displayValue || (
              <span className="italic text-ink3">No value</span>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderSectionHeader(
    title: string,
    sectionKey: string,
    icon: React.ReactNode
  ) {
    const isExpanded = expandedSections.has(sectionKey);
    return (
      <button
        type="button"
        onClick={() => toggleSection(sectionKey)}
        className="flex w-full items-center justify-between py-2"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
            {title}
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-ink3" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink3" />
        )}
      </button>
    );
  }

  function handleStatLeaderChange(
    index: number,
    field: "name" | "position" | "stat",
    value: string
  ) {
    setEditable((prev) => {
      const updated = [...prev.statLeaders];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, statLeaders: updated };
    });
    markEdited("statLeaders");
  }

  function addStatLeader() {
    setEditable((prev) => ({
      ...prev,
      statLeaders: [...prev.statLeaders, { name: "", position: "", stat: "" }],
    }));
    if (!editingFields.has("statLeaders")) {
      toggleEditing("statLeaders");
    }
    markEdited("statLeaders");
  }

  function removeStatLeader(index: number) {
    setEditable((prev) => ({
      ...prev,
      statLeaders: prev.statLeaders.filter((_, i) => i !== index),
    }));
    markEdited("statLeaders");
  }

  function handleRecruitChange(
    index: number,
    field: "action" | "name" | "position" | "stars",
    value: string | number
  ) {
    setEditable((prev) => {
      const updated = [...prev.recruitUpdates];
      if (field === "action") {
        updated[index] = {
          ...updated[index],
          action: value as "offer" | "commit" | "decommit" | "portal_loss",
        };
      } else if (field === "stars") {
        updated[index] = {
          ...updated[index],
          stars: Math.max(1, Math.min(5, Number(value))),
        };
      } else {
        updated[index] = { ...updated[index], [field]: value as string };
      }
      return { ...prev, recruitUpdates: updated };
    });
    markEdited("recruitUpdates");
  }

  function addRecruit() {
    setEditable((prev) => ({
      ...prev,
      recruitUpdates: [
        ...prev.recruitUpdates,
        { action: "offer" as const, name: "", position: "", stars: 3 },
      ],
    }));
    if (!editingFields.has("recruitUpdates")) {
      toggleEditing("recruitUpdates");
    }
    markEdited("recruitUpdates");
  }

  function removeRecruit(index: number) {
    setEditable((prev) => ({
      ...prev,
      recruitUpdates: prev.recruitUpdates.filter((_, i) => i !== index),
    }));
    markEdited("recruitUpdates");
  }

  const inputClass =
    "w-full rounded border border-dw-border bg-paper3 px-3 py-1.5 font-sans text-sm text-ink placeholder:text-ink3/60 focus:border-dw-accent focus:outline-none focus:ring-1 focus:ring-dw-accent/30";
  const selectClass =
    "rounded border border-dw-border bg-paper3 px-3 py-1.5 font-sans text-sm text-ink focus:border-dw-accent focus:outline-none focus:ring-1 focus:ring-dw-accent/30";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Quality Bar */}
      <div className="rounded border border-dw-border bg-paper2 p-4">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink2">
            Extraction Quality
          </span>
          <span className="font-sans text-sm font-bold text-ink">
            {quality.score}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper4">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              quality.score >= 80
                ? "bg-dw-green"
                : quality.score >= 50
                  ? "bg-dw-yellow"
                  : "bg-dw-red"
            )}
            style={{ width: `${quality.score}%` }}
          />
        </div>
        {quality.missingRequired.length > 0 && (
          <div className="mt-3 flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-dw-red" />
            <p className="font-sans text-xs text-dw-red">
              Missing required fields: {quality.missingRequired.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Game Result Section */}
      <div className="rounded border border-dw-border bg-paper2 overflow-hidden">
        <div className="px-4">
          {renderSectionHeader(
            "Game Result",
            "gameResult",
            <CheckCircle2 className="h-4 w-4 text-ink3" />
          )}
        </div>
        {expandedSections.has("gameResult") && (
          <div className="space-y-2 border-t border-dw-border px-4 py-4">
            {renderFieldRow(
              "Opponent",
              "opponent",
              editable.opponent,
              <input
                type="text"
                value={editable.opponent}
                onChange={(e) => {
                  setEditable((prev) => ({ ...prev, opponent: e.target.value }));
                  markEdited("opponent");
                }}
                placeholder="e.g. Alabama"
                className={inputClass}
              />,
              true
            )}
            {renderFieldRow(
              "Opponent Ranking",
              "opponentRanking",
              editable.opponentRanking ? `#${editable.opponentRanking}` : "Unranked",
              <input
                type="number"
                min={1}
                max={25}
                value={editable.opponentRanking}
                onChange={(e) => {
                  setEditable((prev) => ({
                    ...prev,
                    opponentRanking: e.target.value,
                  }));
                  markEdited("opponentRanking");
                }}
                placeholder="Leave blank if unranked"
                className={inputClass}
              />
            )}
            {renderFieldRow(
              "Home / Away",
              "homeAway",
              editable.homeAway === "home" ? "Home" : "Away",
              <select
                value={editable.homeAway}
                onChange={(e) => {
                  setEditable((prev) => ({
                    ...prev,
                    homeAway: e.target.value as "home" | "away",
                  }));
                  markEdited("homeAway");
                }}
                className={selectClass}
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            )}
            {renderFieldRow(
              "Your Score",
              "userScore",
              editable.userScore,
              <input
                type="number"
                min={0}
                value={editable.userScore}
                onChange={(e) => {
                  setEditable((prev) => ({ ...prev, userScore: e.target.value }));
                  markEdited("userScore");
                }}
                placeholder="0"
                className={inputClass}
              />,
              true
            )}
            {renderFieldRow(
              "Opponent Score",
              "opponentScore",
              editable.opponentScore,
              <input
                type="number"
                min={0}
                value={editable.opponentScore}
                onChange={(e) => {
                  setEditable((prev) => ({
                    ...prev,
                    opponentScore: e.target.value,
                  }));
                  markEdited("opponentScore");
                }}
                placeholder="0"
                className={inputClass}
              />,
              true
            )}
          </div>
        )}
      </div>

      {/* Game Details Section */}
      <div className="rounded border border-dw-border bg-paper2 overflow-hidden">
        <div className="px-4">
          {renderSectionHeader(
            "Game Details",
            "gameDetails",
            <AlertTriangle className="h-4 w-4 text-ink3" />
          )}
        </div>
        {expandedSections.has("gameDetails") && (
          <div className="space-y-2 border-t border-dw-border px-4 py-4">
            {renderFieldRow(
              "Game Vibe",
              "gameVibe",
              getVibeLabel(editable.gameVibe),
              <select
                value={editable.gameVibe}
                onChange={(e) => {
                  setEditable((prev) => ({ ...prev, gameVibe: e.target.value }));
                  markEdited("gameVibe");
                }}
                className={selectClass}
              >
                {GAME_VIBE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {renderFieldRow(
              "Notable Moment",
              "notableMoment",
              editable.notableMoment || "",
              <textarea
                value={editable.notableMoment}
                onChange={(e) => {
                  setEditable((prev) => ({
                    ...prev,
                    notableMoment: e.target.value,
                  }));
                  markEdited("notableMoment");
                }}
                placeholder="Any standout plays, comebacks, or big moments?"
                rows={2}
                className={cn(inputClass, "resize-none")}
              />
            )}
          </div>
        )}
      </div>

      {/* Player Stats Section */}
      <div className="rounded border border-dw-border bg-paper2 overflow-hidden">
        <div className="px-4">
          {renderSectionHeader(
            "Player Stats",
            "playerStats",
            <HelpCircle className="h-4 w-4 text-ink3" />
          )}
        </div>
        {expandedSections.has("playerStats") && (
          <div className="space-y-3 border-t border-dw-border px-4 py-4">
            <div className="flex items-center justify-between">
              <ConfidenceBadge level={confidences.statLeaders} />
              {!editingFields.has("statLeaders") &&
                editable.statLeaders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleEditing("statLeaders")}
                    className="text-ink3 transition-colors hover:text-ink2"
                    aria-label="Edit stat leaders"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
            </div>

            {editable.statLeaders.length === 0 && !editingFields.has("statLeaders") ? (
              <p className="font-serif text-sm italic text-ink3">
                No stat leaders extracted.
              </p>
            ) : editingFields.has("statLeaders") ? (
              <div className="space-y-2">
                {editable.statLeaders.map((sl, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded border border-dw-border bg-paper3 p-2"
                  >
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={sl.name}
                        onChange={(e) =>
                          handleStatLeaderChange(i, "name", e.target.value)
                        }
                        placeholder="Player name"
                        className={inputClass}
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sl.position}
                          onChange={(e) =>
                            handleStatLeaderChange(i, "position", e.target.value)
                          }
                          placeholder="Position"
                          className={cn(inputClass, "w-24")}
                        />
                        <input
                          type="text"
                          value={sl.stat}
                          onChange={(e) =>
                            handleStatLeaderChange(i, "stat", e.target.value)
                          }
                          placeholder="Stat line"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeStatLeader(i)}
                      className="mt-1 text-ink3 transition-colors hover:text-dw-red"
                      aria-label="Remove stat leader"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {editable.statLeaders.map((sl, i) => (
                  <div
                    key={i}
                    className="flex items-baseline gap-2 font-serif text-sm text-ink"
                  >
                    <span className="font-semibold">{sl.name}</span>
                    <span className="text-ink3">({sl.position})</span>
                    <span className="text-ink2">— {sl.stat}</span>
                  </div>
                ))}
              </div>
            )}

            {editable.statLeaders.length < 3 && (
              <button
                type="button"
                onClick={addStatLeader}
                className="flex items-center gap-1 font-sans text-xs text-dw-accent transition-colors hover:text-dw-accent/80"
              >
                <Plus className="h-3 w-3" />
                Add stat leader
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rankings & Recruiting Section */}
      <div className="rounded border border-dw-border bg-paper2 overflow-hidden">
        <div className="px-4">
          {renderSectionHeader(
            "Rankings & Recruiting",
            "rankings",
            <XCircle className="h-4 w-4 text-ink3" />
          )}
        </div>
        {expandedSections.has("rankings") && (
          <div className="space-y-3 border-t border-dw-border px-4 py-4">
            {renderFieldRow(
              "New Ranking",
              "newRanking",
              editable.newRanking ? `#${editable.newRanking}` : "Unranked",
              <input
                type="number"
                min={1}
                max={25}
                value={editable.newRanking}
                onChange={(e) => {
                  setEditable((prev) => ({
                    ...prev,
                    newRanking: e.target.value,
                  }));
                  markEdited("newRanking");
                }}
                placeholder="Leave blank if unranked"
                className={inputClass}
              />
            )}

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-ink2">
                  Recruit Updates
                </span>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge level={confidences.recruitUpdates} />
                  {!editingFields.has("recruitUpdates") &&
                    editable.recruitUpdates.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleEditing("recruitUpdates")}
                        className="text-ink3 transition-colors hover:text-ink2"
                        aria-label="Edit recruit updates"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                </div>
              </div>

              {editable.recruitUpdates.length === 0 &&
              !editingFields.has("recruitUpdates") ? (
                <p className="font-serif text-sm italic text-ink3">
                  No recruiting updates extracted.
                </p>
              ) : editingFields.has("recruitUpdates") ? (
                <div className="space-y-2">
                  {editable.recruitUpdates.map((ru, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded border border-dw-border bg-paper3 p-2"
                    >
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-2">
                          <select
                            value={ru.action}
                            onChange={(e) =>
                              handleRecruitChange(i, "action", e.target.value)
                            }
                            className={cn(selectClass, "w-28")}
                          >
                            {RECRUIT_ACTION_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={ru.stars}
                            onChange={(e) =>
                              handleRecruitChange(
                                i,
                                "stars",
                                Number(e.target.value)
                              )
                            }
                            className={cn(inputClass, "w-16")}
                            aria-label="Stars"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ru.name}
                            onChange={(e) =>
                              handleRecruitChange(i, "name", e.target.value)
                            }
                            placeholder="Player name"
                            className={inputClass}
                          />
                          <input
                            type="text"
                            value={ru.position}
                            onChange={(e) =>
                              handleRecruitChange(i, "position", e.target.value)
                            }
                            placeholder="Position"
                            className={cn(inputClass, "w-24")}
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRecruit(i)}
                        className="mt-1 text-ink3 transition-colors hover:text-dw-red"
                        aria-label="Remove recruit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {editable.recruitUpdates.map((ru, i) => (
                    <div
                      key={i}
                      className="flex items-baseline gap-2 font-serif text-sm text-ink"
                    >
                      <span className="rounded bg-paper3 px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider text-ink3">
                        {ru.action.replace("_", " ")}
                      </span>
                      <span className="font-semibold">{ru.name}</span>
                      <span className="text-ink3">({ru.position})</span>
                      <span className="text-dw-accent">
                        {"★".repeat(ru.stars)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {editable.recruitUpdates.length < 5 && (
                <button
                  type="button"
                  onClick={addRecruit}
                  className="flex items-center gap-1 font-sans text-xs text-dw-accent transition-colors hover:text-dw-accent/80"
                >
                  <Plus className="h-3 w-3" />
                  Add recruit update
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Required fields warning */}
      {requiredMissing.length > 0 && (
        <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-dw-red" />
            <p className="font-sans text-sm text-dw-red">
              Please fill in the following required fields before submitting:{" "}
              {requiredMissing.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onReExtract}
          className={cn(
            "rounded border border-dw-border bg-paper2 px-6 py-2.5",
            "font-sans text-sm text-ink2 transition-colors hover:bg-paper3"
          )}
        >
          Something&apos;s wrong — let me re-enter
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={cn(
            "rounded bg-dw-accent px-6 py-2.5",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-colors hover:bg-dw-accent2",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          Looks good — generate my news cycle
        </button>
      </div>
    </div>
  );
}
