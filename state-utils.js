(function attachJeopardyStateUtils(global) {
  const GAME_STATE_STORAGE_KEY = "wfsd-jeopardy-game-state-v1";
  const MIN_TEAM_COUNT = 2;
  const MAX_TEAM_COUNT = 5;
  const MAX_TEAM_NAME_LENGTH = 24;
  const SCORE_LIMIT = 999999;
  const SAFE_ASSET_PATTERN = /^assets\/generated\/[A-Za-z0-9._-]+\.(png|webp|svg)$/;
  const HISTORY_TYPES = new Set(["positive", "negative", "neutral", "partial"]);
  const UNDO_SCOPES = new Set(["board", "clue", "final"]);
  const DEFAULT_TEAMS = [
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
    { name: "Team 3", score: 0 }
  ];

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clampNumber(value, min, max, fallback = 0) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.trunc(number)));
  }

  function normalizeTeamName(name, index) {
    const value = typeof name === "string" ? name.trim() : "";
    return (value || `Team ${index + 1}`).slice(0, MAX_TEAM_NAME_LENGTH);
  }

  function normalizeText(value, fallback = "", maxLength = 140) {
    const text = typeof value === "string" ? value.trim().replace(/[<>]/g, "") : "";
    return (text || fallback).slice(0, maxLength);
  }

  function isPlainObject(value) {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }

  function clueId(categoryIndex, clueIndex) {
    return `${categoryIndex}-${clueIndex}`;
  }

  function getValidClueIds(gameData) {
    const ids = new Set();
    gameData?.categories?.forEach((category, categoryIndex) => {
      category?.clues?.forEach((clue, clueIndex) => {
        ids.add(clueId(categoryIndex, clueIndex));
      });
    });
    return ids;
  }

  function sanitizeUsedClues(gameData, usedClues) {
    if (!Array.isArray(usedClues)) return new Set();
    const validIds = getValidClueIds(gameData);
    return new Set(usedClues.filter((id) => validIds.has(id)));
  }

  function sanitizeTeams(teams, fallbackTeams = DEFAULT_TEAMS) {
    const sourceTeams = Array.isArray(teams) && teams.length ? teams : fallbackTeams;
    const boundedTeams = sourceTeams.slice(0, MAX_TEAM_COUNT).map((team, index) => ({
      name: normalizeTeamName(team?.name, index),
      score: clampNumber(team?.score, -SCORE_LIMIT, SCORE_LIMIT)
    }));
    while (boundedTeams.length < MIN_TEAM_COUNT) {
      boundedTeams.push({ name: `Team ${boundedTeams.length + 1}`, score: 0 });
    }
    return boundedTeams;
  }

  function finalDeltaForResult(result, wager) {
    const safeWager = clampNumber(wager, 0, SCORE_LIMIT);
    if (result === "correct") return safeWager;
    if (result === "partial") return Math.floor(safeWager / 2);
    if (result === "incorrect") return -safeWager;
    return 0;
  }

  function sanitizeFinalResult(result) {
    const validResults = new Set(["correct", "partial", "incorrect", "none"]);
    if (!result || !validResults.has(result.result)) {
      return { result: "none", label: "", delta: 0 };
    }
    const safeResult = result.result;
    const safeLabels = {
      correct: "Full",
      partial: "Half",
      incorrect: "Miss",
      none: "Auto-reviewed"
    };
    return {
      result: safeResult,
      label: safeResult === "none" && result.label !== "Auto-reviewed" ? "" : safeLabels[safeResult],
      delta: clampNumber(result?.delta, -SCORE_LIMIT, SCORE_LIMIT)
    };
  }

  function normalizeFinalResultForWager(result, wager) {
    const safeResult = sanitizeFinalResult(result);
    return {
      ...safeResult,
      delta: finalDeltaForResult(safeResult.result, wager)
    };
  }

  function getRawFinalWager(finalWagers, index) {
    return Array.isArray(finalWagers) ? clampNumber(finalWagers[index], 0, SCORE_LIMIT) : 0;
  }

  function deriveFinalStartingScores(savedState, teams, rawFinalWagers, rawFinalResults) {
    const finalLocked = Boolean(savedState?.finalWagersLocked || savedState?.finalResponseRevealed);
    if (!finalLocked) return [];
    if (Array.isArray(savedState?.finalStartingScores)) {
      return teams.map((team, index) => clampNumber(
        savedState.finalStartingScores[index],
        0,
        SCORE_LIMIT,
        Math.max(0, team.score)
      ));
    }
    return teams.map((team, index) => {
      const rawWager = getRawFinalWager(rawFinalWagers, index);
      const result = sanitizeFinalResult(rawFinalResults?.[index]);
      const startingScore = team.score - finalDeltaForResult(result.result, rawWager);
      if (!Number.isFinite(startingScore) || startingScore < 0 || startingScore > SCORE_LIMIT) {
        return Math.max(0, team.score);
      }
      return clampNumber(startingScore, 0, SCORE_LIMIT, Math.max(0, team.score));
    });
  }

  function sanitizeHistoryEntry(entry) {
    if (!isPlainObject(entry)) return null;
    return {
      title: normalizeText(entry.title, "Play", 80),
      detail: normalizeText(entry.detail, "", 140),
      delta: entry.delta === null || entry.delta === undefined ? null : clampNumber(entry.delta, -SCORE_LIMIT, SCORE_LIMIT),
      type: HISTORY_TYPES.has(entry.type) ? entry.type : "neutral"
    };
  }

  function sanitizeActionHistory(history) {
    if (!Array.isArray(history)) return [];
    return history.map(sanitizeHistoryEntry).filter(Boolean).slice(0, 5);
  }

  function sanitizeUndoSnapshot(undoSnapshot) {
    if (!isPlainObject(undoSnapshot) || !isPlainObject(undoSnapshot.snapshot)) return null;
    const snapshot = cloneData(undoSnapshot.snapshot);
    snapshot.undoSnapshot = null;
    return {
      label: normalizeText(undoSnapshot.label, "last action", 80),
      scope: UNDO_SCOPES.has(undoSnapshot.scope) ? undoSnapshot.scope : "board",
      clueId: normalizeText(undoSnapshot.clueId, "", 24),
      snapshot
    };
  }

  function readSavedState(storage) {
    try {
      const parsed = JSON.parse(storage.getItem(GAME_STATE_STORAGE_KEY) || "null");
      return parsed?.version === 1 ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  global.JeopardyStateUtils = {
    GAME_STATE_STORAGE_KEY,
    MIN_TEAM_COUNT,
    MAX_TEAM_COUNT,
    MAX_TEAM_NAME_LENGTH,
    SCORE_LIMIT,
    SAFE_ASSET_PATTERN,
    DEFAULT_TEAMS,
    clampNumber,
    cloneData,
    clueId,
    deriveFinalStartingScores,
    finalDeltaForResult,
    getRawFinalWager,
    getValidClueIds,
    isPlainObject,
    normalizeFinalResultForWager,
    normalizeTeamName,
    normalizeText,
    readSavedState,
    sanitizeActionHistory,
    sanitizeFinalResult,
    sanitizeHistoryEntry,
    sanitizeTeams,
    sanitizeUndoSnapshot,
    sanitizeUsedClues
  };
})(globalThis);
