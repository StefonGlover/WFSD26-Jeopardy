const builtInGameData = window.JeopardyData;
const stateUtils = window.JeopardyStateUtils;
let gameData = cloneData(builtInGameData);
const SOUND_STORAGE_KEY = "jeopardy-sound-muted";
const GAME_STATE_STORAGE_KEY = stateUtils.GAME_STATE_STORAGE_KEY;
const MIN_TEAM_COUNT = stateUtils.MIN_TEAM_COUNT;
const MAX_TEAM_COUNT = stateUtils.MAX_TEAM_COUNT;
const SCORE_LIMIT = stateUtils.SCORE_LIMIT;
const DEFAULT_CATEGORY_IMAGE = "assets/generated/station-myth-fact.png";
const DEFAULT_FINAL_IMAGE = "assets/generated/digital-screen.png";
const SAFE_ASSET_PATTERN = stateUtils.SAFE_ASSET_PATTERN;
const dialogReturnFocus = new WeakMap();
let toastTimer = null;
let setupDraftTeams = null;
let pendingSavedState = null;
let confirmResolver = null;
const mobileBoardQuery = window.matchMedia?.("(max-width: 980px)");
let clueHostDetailsOpen = getDefaultHostDetailsOpen();
let finalHostDetailsOpen = getDefaultFinalHostDetailsOpen();

const state = {
  teams: [
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
    { name: "Team 3", score: 0 }
  ],
  activeTeam: 0,
  usedClues: new Set(),
  currentClue: null,
  soundMuted: true,
  audioContext: null,
  seenCategoryPrompts: new Set(),
  actionHistory: [],
  undoSnapshot: null,
  finalWagers: [],
  finalStartingScores: [],
  finalWagersLocked: false,
  finalResponseRevealed: false,
  finalScoredTeams: new Set(),
  finalResults: [],
  finalComplete: false,
  mobileCategoryIndex: 0
};

const gameTitle = document.getElementById("gameTitle");
const gameSubtitle = document.getElementById("gameSubtitle");
const gameTheme = document.getElementById("gameTheme");
const soundButton = document.getElementById("soundButton");
const scoreboard = document.getElementById("scoreboard");
const gameBoard = document.getElementById("gameBoard");
const mobileCategoryNav = document.getElementById("mobileCategoryNav");
const mobileBoard = document.getElementById("mobileBoard");
const progressStatus = document.getElementById("progressStatus");
const undoButton = document.getElementById("undoButton");
const setupDialog = document.getElementById("setupDialog");
const setupForm = document.getElementById("setupForm");
const teamFields = document.getElementById("teamFields");
const addTeamButton = document.getElementById("addTeamButton");
const removeTeamButton = document.getElementById("removeTeamButton");
const clueDialog = document.getElementById("clueDialog");
const cluePanel = clueDialog.querySelector(".clue-panel");
const clueMeta = document.getElementById("clueMeta");
const clueStage = document.getElementById("clueStage");
const clueStinger = document.getElementById("clueStinger");
const stingerEyebrow = document.getElementById("stingerEyebrow");
const stingerTitle = document.getElementById("stingerTitle");
const stingerText = document.getElementById("stingerText");
const categoryPrompt = document.getElementById("categoryPrompt");
const clueText = document.getElementById("clueText");
const responseBlock = document.getElementById("responseBlock");
const responseText = document.getElementById("responseText");
const hostDetailsToggle = document.getElementById("hostDetailsToggle");
const clueHostDetails = document.getElementById("clueHostDetails");
const acceptanceStrip = document.getElementById("acceptanceStrip");
const whyText = document.getElementById("whyText");
const teachingTag = document.getElementById("teachingTag");
const glossaryStrip = document.getElementById("glossaryStrip");
const bridgeText = document.getElementById("bridgeText");
const riskSignal = document.getElementById("riskSignal");
const riskConcern = document.getElementById("riskConcern");
const riskAction = document.getElementById("riskAction");
const modalTeamSelect = document.getElementById("modalTeamSelect");
const revealButton = document.getElementById("revealButton");
const correctButton = document.getElementById("correctButton");
const incorrectButton = document.getElementById("incorrectButton");
const noScoreButton = document.getElementById("noScoreButton");
const closeClueButton = document.getElementById("closeClueButton");
const hostNote = document.getElementById("hostNote");
const finalDialog = document.getElementById("finalDialog");
const finalCategory = document.getElementById("finalCategory");
const finalClue = document.getElementById("finalClue");
const finalResponseBlock = document.getElementById("finalResponseBlock");
const finalResponse = document.getElementById("finalResponse");
const finalHostDetailsToggle = document.getElementById("finalHostDetailsToggle");
const finalHostDetails = document.getElementById("finalHostDetails");
const finalAcceptanceStrip = document.getElementById("finalAcceptanceStrip");
const finalRubric = document.getElementById("finalRubric");
const finalRubricList = document.getElementById("finalRubricList");
const finalWhy = document.getElementById("finalWhy");
const finalGlossaryStrip = document.getElementById("finalGlossaryStrip");
const finalBridge = document.getElementById("finalBridge");
const finalRiskSignal = document.getElementById("finalRiskSignal");
const finalRiskConcern = document.getElementById("finalRiskConcern");
const finalRiskAction = document.getElementById("finalRiskAction");
const finalWagerHelper = document.getElementById("finalWagerHelper");
const wagerGrid = document.getElementById("wagerGrid");
const finalButton = document.getElementById("finalButton");
const finalPrimaryButton = document.getElementById("finalPrimaryButton");
const finalUndoButton = document.getElementById("finalUndoButton");
const finalPanel = finalDialog.querySelector(".final-panel");
const rulesDialog = document.getElementById("rulesDialog");
const rulesList = document.getElementById("rulesList");
const rulesThemeLens = document.getElementById("rulesThemeLens");
const endDialog = document.getElementById("endDialog");
const winnerCelebration = document.getElementById("winnerCelebration");
const winnerTitle = document.getElementById("winnerTitle");
const closeoutText = document.getElementById("closeoutText");
const finalScoreList = document.getElementById("finalScoreList");
const pledgeCard = document.getElementById("pledgeCard");
const debriefTakeaways = document.getElementById("debriefTakeaways");
const scoreToast = document.getElementById("scoreToast");
const resumeDialog = document.getElementById("resumeDialog");
const resumeSummary = document.getElementById("resumeSummary");
const confirmDialog = document.getElementById("confirmDialog");
const confirmKicker = document.getElementById("confirmKicker");
const confirmTitle = document.getElementById("confirmTitle");
const confirmMessage = document.getElementById("confirmMessage");
const confirmAcceptButton = document.getElementById("confirmAcceptButton");
const confirmCancelButton = document.getElementById("confirmCancelButton");

function cloneData(value) {
  return stateUtils.cloneData(value);
}

function clampNumber(value, min, max, fallback = 0) {
  return stateUtils.clampNumber(value, min, max, fallback);
}

function normalizeTeamName(name, index) {
  return stateUtils.normalizeTeamName(name, index);
}

function normalizeText(value, fallback = "", maxLength = 140) {
  return stateUtils.normalizeText(value, fallback, maxLength);
}

function isPlainObject(value) {
  return stateUtils.isPlainObject(value);
}

function clearElement(element) {
  if (element) {
    element.replaceChildren();
  }
}

function getDefaultHostDetailsOpen() {
  return !mobileBoardQuery?.matches;
}

function getDefaultFinalHostDetailsOpen() {
  return false;
}

function textElement(tagName, text, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text ?? "";
  return element;
}

function finalDeltaForResult(result, wager) {
  return stateUtils.finalDeltaForResult(result, wager);
}

function sanitizeFinalResult(result) {
  return stateUtils.sanitizeFinalResult(result);
}

function normalizeFinalResultForWager(result, wager) {
  return stateUtils.normalizeFinalResultForWager(result, wager);
}

function sanitizeHistoryEntry(entry) {
  return stateUtils.sanitizeHistoryEntry(entry);
}

function sanitizeActionHistory(history) {
  return stateUtils.sanitizeActionHistory(history);
}

function sanitizeUndoSnapshot(undoSnapshot) {
  return stateUtils.sanitizeUndoSnapshot(undoSnapshot);
}

function clueId(categoryIndex, clueIndex) {
  return stateUtils.clueId(categoryIndex, clueIndex);
}

function getTotalClues() {
  return gameData.categories.reduce((sum, category) => sum + category.clues.length, 0);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getClueById(id) {
  const [categoryIndex, clueIndex] = String(id).split("-").map(Number);
  const category = gameData.categories[categoryIndex];
  const clue = category?.clues?.[clueIndex];
  if (!category || !clue) return null;
  return { categoryIndex, clueIndex, category, clue };
}

function getFinalWagerCap(index) {
  if (state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete) {
    return clampNumber(state.finalStartingScores[index], 0, SCORE_LIMIT, Math.max(0, state.teams[index]?.score || 0));
  }
  return Math.max(0, state.teams[index]?.score || 0);
}

function serializeCurrentClue() {
  if (!state.currentClue) return null;
  return {
    id: state.currentClue.id,
    scoredTeams: [...state.currentClue.scoredTeams],
    selectedTeam: sanitizeTeamIndex(state.currentClue.selectedTeam, state.activeTeam),
    noScore: Boolean(state.currentClue.noScore),
    stealOpen: Boolean(state.currentClue.stealOpen),
    resolved: Boolean(state.currentClue.resolved),
    revealed: Boolean(state.currentClue.revealed),
    categoryPromptWasNew: Boolean(state.currentClue.categoryPromptWasNew)
  };
}

function serializeState({ includeTransient = false, includeUndo = true } = {}) {
  const totalTeams = state.teams.length;
  return {
    version: 1,
    teams: state.teams.map((team) => ({ name: team.name, score: team.score })),
    activeTeam: state.activeTeam,
    usedClues: [...state.usedClues],
    seenCategoryPrompts: [...state.seenCategoryPrompts],
    actionHistory: state.actionHistory.slice(0, 5),
    finalWagers: Array.from({ length: totalTeams }, (_, index) => Number(state.finalWagers[index]) || 0),
    finalStartingScores: state.finalWagersLocked
      ? Array.from({ length: totalTeams }, (_, index) => clampNumber(state.finalStartingScores[index], 0, SCORE_LIMIT))
      : [],
    finalWagersLocked: state.finalWagersLocked,
    finalResponseRevealed: state.finalResponseRevealed,
    finalScoredTeams: [...state.finalScoredTeams],
    finalResults: Array.from({ length: totalTeams }, (_, index) => sanitizeFinalResult(state.finalResults[index])),
    finalComplete: state.finalComplete,
    mobileCategoryIndex: state.mobileCategoryIndex,
    currentClue: includeTransient ? serializeCurrentClue() : null,
    openDialog: includeTransient ? getOpenDialogName() : null,
    undoSnapshot: includeUndo && state.undoSnapshot
      ? {
        label: state.undoSnapshot.label,
        snapshot: state.undoSnapshot.snapshot
      }
      : null
  };
}

function restoreCurrentClue(savedClue) {
  if (!savedClue?.id) {
    state.currentClue = null;
    return;
  }
  const clueInfo = getClueById(savedClue.id);
  if (!clueInfo) {
    state.currentClue = null;
    return;
  }
  const scoredTeams = new Set((Array.isArray(savedClue.scoredTeams) ? savedClue.scoredTeams : [])
    .map((index) => Number(index))
    .filter((index) => Number.isInteger(index) && index >= 0 && index < state.teams.length));
  state.currentClue = {
    id: savedClue.id,
    category: clueInfo.category,
    clue: clueInfo.clue,
    scoredTeams,
    noScore: Boolean(savedClue.noScore),
    stealOpen: Boolean(savedClue.stealOpen),
    resolved: Boolean(savedClue.resolved || savedClue.noScore),
    revealed: Boolean(savedClue.revealed),
    categoryPromptWasNew: Boolean(savedClue.categoryPromptWasNew),
    selectedTeam: sanitizeTeamIndex(savedClue.selectedTeam, state.activeTeam)
  };
  if (state.currentClue.stealOpen && !state.currentClue.resolved && state.currentClue.scoredTeams.has(state.currentClue.selectedTeam)) {
    state.currentClue.selectedTeam = getNextUnscoredTeamIndex(state.currentClue.selectedTeam);
  }
  if (state.currentClue.resolved || state.currentClue.noScore || state.currentClue.scoredTeams.size) {
    state.usedClues.add(state.currentClue.id);
  }
}

function sanitizeUsedClues(usedClues) {
  return stateUtils.sanitizeUsedClues(gameData, usedClues);
}

function sanitizeTeams(teams) {
  return stateUtils.sanitizeTeams(teams, state.teams);
}

function sanitizeTeamIndex(value, fallback = 0) {
  const safeFallback = Math.min(Math.max(0, Number(fallback) || 0), state.teams.length - 1);
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 && index < state.teams.length ? index : safeFallback;
}

function normalizeFinalState() {
  if (state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete) {
    state.finalStartingScores = Array.from({ length: state.teams.length }, (_, index) => (
      clampNumber(state.finalStartingScores[index], 0, SCORE_LIMIT, Math.max(0, state.teams[index]?.score || 0))
    ));
  } else {
    state.finalStartingScores = [];
  }
  state.finalWagers = Array.from({ length: state.teams.length }, (_, index) => {
    const maxWager = getFinalWagerCap(index);
    return clampNumber(state.finalWagers[index], 0, maxWager);
  });
  state.finalScoredTeams = state.finalResponseRevealed
    ? new Set([...state.finalScoredTeams]
      .filter((index) => Number.isInteger(index) && index >= 0 && index < state.teams.length))
    : new Set();
  state.finalResults = Array.from({ length: state.teams.length }, (_, index) => (
    state.finalResponseRevealed
      ? normalizeFinalResultForWager(state.finalResults[index], state.finalWagers[index])
      : sanitizeFinalResult(null)
  ));
}

function getRawFinalWager(finalWagers, index) {
  return stateUtils.getRawFinalWager(finalWagers, index);
}

function deriveFinalStartingScores(snapshot, teams, rawFinalWagers, rawFinalResults) {
  return stateUtils.deriveFinalStartingScores(snapshot, teams, rawFinalWagers, rawFinalResults);
}

function restoreState(snapshot, { reopenDialogs = false } = {}) {
  if (!snapshot) return false;
  state.teams = sanitizeTeams(snapshot.teams);
  state.activeTeam = Math.min(Math.max(0, Number(snapshot.activeTeam) || 0), state.teams.length - 1);
  state.usedClues = sanitizeUsedClues(snapshot.usedClues);
  state.seenCategoryPrompts = new Set((Array.isArray(snapshot.seenCategoryPrompts) ? snapshot.seenCategoryPrompts : [])
    .filter((id) => gameData.categories.some((category) => category.id === id)));
  state.actionHistory = sanitizeActionHistory(snapshot.actionHistory);
  const rawFinalWagers = Array.isArray(snapshot.finalWagers) ? snapshot.finalWagers.slice(0, state.teams.length) : [];
  const rawFinalResults = Array.isArray(snapshot.finalResults) ? snapshot.finalResults.slice(0, state.teams.length) : [];
  state.finalWagers = rawFinalWagers;
  state.finalResponseRevealed = Boolean(snapshot.finalResponseRevealed);
  state.finalWagersLocked = Boolean(snapshot.finalWagersLocked || state.finalResponseRevealed);
  state.finalStartingScores = deriveFinalStartingScores(snapshot, state.teams, rawFinalWagers, rawFinalResults);
  state.finalScoredTeams = new Set((Array.isArray(snapshot.finalScoredTeams) ? snapshot.finalScoredTeams : [])
    .map((index) => Number(index))
      .filter((index) => Number.isInteger(index) && index >= 0 && index < state.teams.length));
  state.finalResults = Array.from({ length: state.teams.length }, (_, index) => sanitizeFinalResult(rawFinalResults[index]));
  normalizeFinalState();
  state.finalComplete = false;
  syncFinalZeroWagers();
  state.finalComplete = finalReadyForResults();
  state.mobileCategoryIndex = Math.min(
    Math.max(0, Number(snapshot.mobileCategoryIndex) || 0),
    gameData.categories.length - 1
  );
  state.undoSnapshot = sanitizeUndoSnapshot(snapshot.undoSnapshot);
  restoreCurrentClue(snapshot.currentClue);
  renderState();
  if (reopenDialogs) {
    restoreOpenDialog(snapshot.openDialog);
  }
  return true;
}

function saveState() {
  try {
    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(serializeState({ includeTransient: true })));
  } catch (error) {
    // Local persistence is helpful but not required for the live game to run.
  }
}

function readSavedState() {
  try {
    const rawState = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!rawState) return null;
    const savedState = JSON.parse(rawState);
    if (savedState?.version !== 1) {
      clearSavedState();
      return null;
    }
    return savedState;
  } catch (error) {
    clearSavedState();
    return null;
  }
}

function loadState(snapshot = readSavedState()) {
  const restored = restoreState(snapshot, { reopenDialogs: true });
  if (restored) saveState();
  return restored;
}

function hasMeaningfulSavedState(snapshot) {
  if (!snapshot) return false;
  const hasScore = Array.isArray(snapshot.teams) && snapshot.teams.some((team) => Number(team?.score) !== 0);
  const hasTeamEdits = Array.isArray(snapshot.teams) && snapshot.teams.some((team, index) => team?.name && team.name !== `Team ${index + 1}`);
  return Boolean(
    hasScore ||
    hasTeamEdits ||
    snapshot.usedClues?.length ||
    snapshot.actionHistory?.length ||
    snapshot.currentClue ||
    snapshot.finalWagersLocked ||
    snapshot.finalResponseRevealed ||
    snapshot.finalComplete
  );
}

function clearSavedState() {
  try {
    window.localStorage.removeItem(GAME_STATE_STORAGE_KEY);
  } catch (error) {
    // Nothing to clear if storage is unavailable.
  }
}

function rememberDialogFocus(dialog, returnFocusElement = document.activeElement) {
  if (returnFocusElement instanceof HTMLElement) {
    dialogReturnFocus.set(dialog, returnFocusElement);
  }
}

function restoreDialogFocus(dialog) {
  const returnFocusElement = dialogReturnFocus.get(dialog);
  const focusIfReady = (element) => {
    if (document.contains(element) && !element.disabled) {
      element.focus();
    }
  };
  if (
    returnFocusElement instanceof HTMLElement &&
    document.contains(returnFocusElement) &&
    !returnFocusElement.disabled
  ) {
    returnFocusElement.focus();
  } else {
    const fallbackElement = getDialogFallbackFocus(dialog, returnFocusElement);
    if (fallbackElement) {
      focusIfReady(fallbackElement);
      window.setTimeout(() => focusIfReady(fallbackElement), 0);
      window.setTimeout(() => focusIfReady(fallbackElement), 50);
    }
  }
  dialogReturnFocus.delete(dialog);
}

function getDialogFallbackFocus(dialog, returnFocusElement) {
  if (dialog === clueDialog) {
    const activeBoard = mobileBoardQuery?.matches ? mobileBoard : gameBoard;
    const categoryIndex = Number(returnFocusElement?.dataset?.categoryIndex);
    const clueIndex = Number(returnFocusElement?.dataset?.clueIndex);
    if (Number.isInteger(categoryIndex) && Number.isInteger(clueIndex)) {
      for (let nextClueIndex = clueIndex + 1; nextClueIndex < 5; nextClueIndex += 1) {
        const nextCategoryClue = activeBoard?.querySelector(
          `button[data-category-index="${categoryIndex}"][data-clue-index="${nextClueIndex}"]:not(:disabled)`
        );
        if (nextCategoryClue instanceof HTMLElement) return nextCategoryClue;
      }
    }
    const nextClue = activeBoard?.querySelector("button:not(:disabled)");
    if (nextClue instanceof HTMLElement) return nextClue;
    if (undoButton && !undoButton.disabled) return undoButton;
    return finalButton;
  }
  if (dialog === finalDialog || dialog === endDialog) return finalButton;
  if (dialog === setupDialog) return setupButton;
  if (dialog === rulesDialog) return rulesButton;
  return null;
}

function showDialog(dialog, returnFocusElement = document.activeElement, { persist = true } = {}) {
  rememberDialogFocus(dialog, returnFocusElement);
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    if (persist) saveState();
    return;
  }
  dialog.setAttribute("open", "");
  if (persist) saveState();
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
  restoreDialogFocus(dialog);
}

function currentClueIsUnplayedPreview() {
  return Boolean(
    state.currentClue &&
    !state.currentClue.revealed &&
    !state.currentClue.resolved &&
    !state.currentClue.noScore &&
    state.currentClue.scoredTeams.size === 0
  );
}

function clearUnplayedCurrentClue() {
  if (!currentClueIsUnplayedPreview()) return false;
  state.currentClue = null;
  return true;
}

function markCurrentCategoryPromptSeen() {
  if (state.currentClue?.category?.id) {
    state.seenCategoryPrompts.add(state.currentClue.category.id);
  }
}

function getOpenDialogName() {
  if (isDialogOpen(clueDialog)) return "clue";
  if (isDialogOpen(finalDialog)) return "final";
  if (isDialogOpen(endDialog)) return "end";
  return null;
}

function closeGameDialogs() {
  [clueDialog, finalDialog, endDialog].forEach((dialog) => {
    if (isDialogOpen(dialog)) {
      closeDialog(dialog);
    }
  });
}

function confirmAction({
  kicker = "Host Check",
  title = "Confirm Action",
  message = "Continue?",
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  variant = "primary"
} = {}) {
  if (!confirmDialog) return Promise.resolve(false);
  confirmKicker.textContent = kicker;
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  confirmAcceptButton.textContent = confirmLabel;
  confirmCancelButton.textContent = cancelLabel;
  confirmAcceptButton.classList.toggle("danger", variant === "danger");
  showDialog(confirmDialog, document.activeElement, { persist: false });
  confirmAcceptButton.focus();
  return new Promise((resolve) => {
    confirmResolver = resolve;
  });
}

function resolveConfirm(confirmed) {
  if (confirmResolver) {
    confirmResolver(confirmed);
    confirmResolver = null;
  }
  closeDialog(confirmDialog);
}

async function closeClueFromHost() {
  if (state.currentClue?.stealOpen && !state.currentClue.resolved) return;
  const revealedNeedsResolution = state.currentClue?.revealed && !state.currentClue.resolved && !state.currentClue.noScore;
  if (revealedNeedsResolution) {
    const confirmed = await confirmAction({
      title: "Close This Clue?",
      message: "The response has been revealed. Closing now will mark this clue as No Score.",
      confirmLabel: "Close As No Score",
      variant: "danger"
    });
    if (!confirmed) return;
    noScore();
    return;
  }
  clearUnplayedCurrentClue();
  closeDialog(clueDialog);
  saveState();
}

function restoreOpenDialog(dialogName) {
  closeGameDialogs();
  if (dialogName === "clue" && state.currentClue) {
    renderCurrentClueView();
    showDialog(clueDialog);
    return;
  }
  if (dialogName === "final") {
    openFinal();
    return;
  }
  if (dialogName === "end" && state.finalComplete) {
    renderEndScreen();
    showDialog(endDialog);
  }
}

function renderState() {
  updateFinalButton();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  updateUndoButton();
  updateBoardStatus();
  if (isDialogOpen(finalDialog)) {
    renderFinalPrompt();
    renderWagers();
    renderFinalStage();
    updateFinalControls();
    updateFinalHostDetailsDisclosure();
  }
  if (isDialogOpen(clueDialog) && state.currentClue) {
    renderCurrentClueView();
  }
}

function formatScore(score) {
  return score < 0 ? `-$${Math.abs(score)}` : `$${score}`;
}

function formatDelta(delta) {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

function renderGlossary(strip, item) {
  const glossary = gameData.themeGlossary;
  const chips = [
    { label: "Burden", text: item.riskCard.risk, title: glossary.burden },
    { label: "Signal", text: item.riskCard.signal, title: glossary.signal },
    { label: "Solution", text: item.riskCard.action, title: glossary.solution }
  ];
  clearElement(strip);
  chips.forEach((chip) => {
    const article = document.createElement("article");
    article.className = "glossary-chip";
    article.title = chip.title;
    article.append(textElement("span", chip.label), textElement("p", chip.text));
    strip.appendChild(article);
  });
}

function updateHostDetailsDisclosure({ button, panel, open, revealed }) {
  if (!button || !panel) return;
  button.hidden = !revealed;
  panel.hidden = !revealed || !open;
  button.setAttribute("aria-expanded", revealed && open ? "true" : "false");
  button.textContent = open ? "Hide Host Details" : "Host Details";
}

function updateClueHostDetailsDisclosure() {
  updateHostDetailsDisclosure({
    button: hostDetailsToggle,
    panel: clueHostDetails,
    open: clueHostDetailsOpen,
    revealed: Boolean(state.currentClue?.revealed)
  });
}

function updateFinalHostDetailsDisclosure() {
  updateHostDetailsDisclosure({
    button: finalHostDetailsToggle,
    panel: finalHostDetails,
    open: finalHostDetailsOpen,
    revealed: Boolean(state.finalResponseRevealed)
  });
}

function updateBoardStatus() {
  updateFinalButton();
}

function updateProgress() {
  const totalClues = getTotalClues();
  const progressRatio = totalClues ? state.usedClues.size / totalClues : 0;
  const stage = getCurrentJourneyStage(progressRatio);
  progressStatus.textContent = `${state.usedClues.size}/${totalClues} clues`;
  progressStatus.style.setProperty("--progress-percent", `${Math.round(progressRatio * 100)}%`);
  progressStatus.title = `${state.usedClues.size} of ${totalClues} clues played`;
  progressStatus.setAttribute(
    "aria-label",
    `${state.usedClues.size} of ${totalClues} clues played. Current journey stage: ${stage}.`
  );
}

function updateFinalButton() {
  finalButton.textContent = state.finalComplete ? "Show Results" : "Final Jeopardy";
}

function updateUndoButton() {
  const disabled = !state.undoSnapshot;
  const title = state.undoSnapshot ? `Undo ${state.undoSnapshot.label}` : "Nothing to undo";
  undoButton.disabled = disabled;
  undoButton.title = title;
  if (finalUndoButton) {
    finalUndoButton.disabled = disabled;
    finalUndoButton.title = title;
  }
}

function captureUndo(label, { includeTransient = true } = {}) {
  state.undoSnapshot = {
    label,
    snapshot: serializeState({ includeTransient, includeUndo: false })
  };
  updateUndoButton();
}

function captureClueResolutionUndo(label) {
  captureUndo(label, { includeTransient: false });
  const categoryId = state.currentClue?.category?.id;
  if (categoryId && state.currentClue.categoryPromptWasNew && state.undoSnapshot?.snapshot) {
    state.undoSnapshot.snapshot.seenCategoryPrompts = state.undoSnapshot.snapshot.seenCategoryPrompts
      .filter((id) => id !== categoryId);
  }
}

function relabelUndo(label) {
  if (!state.undoSnapshot) return;
  state.undoSnapshot.label = label;
  updateUndoButton();
}

function undoLastAction() {
  if (!state.undoSnapshot) return;
  const { label, snapshot } = state.undoSnapshot;
  restoreState(snapshot, { reopenDialogs: true });
  state.undoSnapshot = null;
  updateUndoButton();
  saveState();
  showToast(`Undid ${label}`, "neutral");
}

function recordHistory(entry) {
  state.actionHistory.unshift({
    title: entry.title,
    detail: entry.detail,
    delta: entry.delta ?? null,
    type: entry.type || "neutral"
  });
  state.actionHistory = state.actionHistory.slice(0, 5);
}

function showToast(message, type = "neutral") {
  if (!scoreToast) return;
  window.clearTimeout(toastTimer);
  scoreToast.textContent = message;
  scoreToast.className = `score-toast show ${type}`;
  toastTimer = window.setTimeout(() => {
    scoreToast.classList.remove("show");
  }, 1800);
}

function getCurrentJourneyStage(progressRatio) {
  const stages = gameData.progressStages;
  const activeStage = Math.min(stages.length - 1, Math.floor(progressRatio * stages.length));
  return stages[activeStage];
}

function currentClueScoreValue() {
  if (!state.currentClue) return 0;
  return state.currentClue.clue.value;
}

function getVisual(category, clue) {
  const clueVisual = clue?.visual || {};
  return {
    color: clueVisual.color || category?.visual?.color || "var(--coke-red)",
    image: clueVisual.image || clue?.image || category?.visual?.image || DEFAULT_CATEGORY_IMAGE
  };
}

function safeAssetPath(path, fallback = DEFAULT_CATEGORY_IMAGE) {
  const source = typeof path === "string" ? path.trim() : "";
  return SAFE_ASSET_PATTERN.test(source) ? source : fallback;
}

function cssImageValue(path, fallback = DEFAULT_CATEGORY_IMAGE) {
  const source = safeAssetPath(path, fallback);
  return `url("${source}")`;
}

function getClueHostStage() {
  if (!state.currentClue) return "clue";
  if (state.currentClue.resolved || state.currentClue.noScore) return "closed";
  if (state.currentClue.stealOpen) return "steal";
  if (state.currentClue.revealed) return "response";
  return "clue";
}

function updateClueStageUI() {
  const stage = getClueHostStage();
  const stageLabels = {
    clue: "Clue",
    response: "Response Revealed",
    steal: "Steal Open",
    closed: "Clue Closed"
  };
  if (cluePanel) {
    cluePanel.dataset.clueStage = stage;
  }
  clueStage.textContent = stageLabels[stage] || "Clue";
  return stage;
}

function readSoundPreference() {
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) !== "false";
  } catch (error) {
    return true;
  }
}

function saveSoundPreference() {
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, state.soundMuted ? "true" : "false");
  } catch (error) {
    // Sounds still work for the current session if storage is unavailable.
  }
}

function updateSoundButton() {
  soundButton.classList.toggle("muted", state.soundMuted);
  soundButton.setAttribute("aria-pressed", state.soundMuted ? "false" : "true");
  soundButton.textContent = state.soundMuted ? "Sound Off" : "Sound On";
  soundButton.setAttribute(
    "aria-label",
    state.soundMuted ? "Sound is off. Turn sound on." : "Sound is on. Turn sound off."
  );
  soundButton.setAttribute("title", state.soundMuted ? "Turn sound on" : "Turn sound off");
}

function getAudioContext({ force = false } = {}) {
  if (state.soundMuted) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!state.audioContext) {
    try {
      state.audioContext = new AudioContextClass();
    } catch (error) {
      return null;
    }
  }
  if (force && state.audioContext.state === "suspended") {
    state.audioContext.resume().catch(() => {});
  }
  return state.audioContext;
}

function primeAudioContext(audio) {
  if (!audio || audio.__jeopardyPrimed) return;
  try {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + 0.02);
    audio.__jeopardyPrimed = true;
  } catch (error) {
    // Some browser policies only allow resume without a primer; playback still falls back below.
  }
}

async function unlockAudio() {
  const audio = getAudioContext({ force: true });
  if (!audio) return null;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch (error) {
      return null;
    }
  }
  if (audio.state !== "running") return null;
  primeAudioContext(audio);
  return audio;
}

function tone(audio, frequency, start, duration, volume, type = "sine") {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function getSoundPattern(kind) {
  return window.JeopardySound?.getPattern(kind) || [];
}

function makeWavUrl(pattern) {
  return window.JeopardySound?.makeWavUrl(pattern) || "";
}

async function playFallbackSound(kind) {
  if (state.soundMuted || typeof Audio === "undefined") return;
  const pattern = getSoundPattern(kind);
  if (!pattern.length) return;
  const url = makeWavUrl(pattern);
  if (!url) return;
  const audio = new Audio(url);
  audio.volume = 0.9;
  audio.addEventListener("ended", () => URL.revokeObjectURL(url), { once: true });
  try {
    await audio.play();
  } catch (error) {
    URL.revokeObjectURL(url);
  }
}

async function playSound(kind) {
  const audio = await unlockAudio();
  if (!audio) {
    await playFallbackSound(kind);
    return;
  }
  const now = audio.currentTime + 0.01;
  getSoundPattern(kind).forEach((item) => {
    tone(audio, item.frequency, now + item.start, item.duration, item.volume * 0.48, item.type);
  });
}

async function toggleSound() {
  state.soundMuted = !state.soundMuted;
  saveSoundPreference();
  updateSoundButton();
  if (!state.soundMuted) {
    await playSound("reveal");
    showToast("Sound on", "positive");
  } else {
    showToast("Sound off", "neutral");
  }
}

function renderScoreboard() {
  clearElement(scoreboard);
  state.teams.forEach((team, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `team-card${index === state.activeTeam ? " active" : ""}`;
    card.setAttribute("aria-pressed", index === state.activeTeam ? "true" : "false");
    const name = document.createElement("span");
    name.textContent = team.name;
    const score = document.createElement("strong");
    score.textContent = formatScore(team.score);
    card.append(name);
    if (index === state.activeTeam) {
      const badge = textElement("small", "Active", "active-team-badge");
      badge.setAttribute("aria-hidden", "true");
      card.appendChild(badge);
    }
    card.append(score);
    card.addEventListener("click", () => {
      state.activeTeam = index;
      renderScoreboard();
      renderTeamSelect();
      updateBoardStatus();
      saveState();
    });
    scoreboard.appendChild(card);
  });
}

function renderTeamSelect() {
  clearElement(modalTeamSelect);
  state.teams.forEach((team, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = team.name;
    modalTeamSelect.appendChild(option);
  });
  const selectedTeam = state.currentClue
    ? sanitizeTeamIndex(state.currentClue.selectedTeam, state.activeTeam)
    : sanitizeTeamIndex(state.activeTeam);
  if (state.currentClue) {
    state.currentClue.selectedTeam = selectedTeam;
  }
  modalTeamSelect.value = String(selectedTeam);
}

function renderBoard() {
  clearElement(gameBoard);
  gameBoard.style.setProperty("--category-count", gameData.categories.length);
  state.mobileCategoryIndex = Math.min(state.mobileCategoryIndex, gameData.categories.length - 1);

  gameData.categories.forEach((category, categoryIndex) => {
    const heading = document.createElement("div");
    heading.className = "category-heading";
    heading.textContent = category.shortName;
    heading.style.setProperty("--category-accent", category.visual?.color || "var(--coke-red)");
    heading.style.setProperty("--category-bg", cssImageValue(category.visual?.image, DEFAULT_CATEGORY_IMAGE));
    heading.dataset.categoryId = category.id;
    gameBoard.appendChild(heading);
  });

  for (let clueIndex = 0; clueIndex < 5; clueIndex += 1) {
    gameData.categories.forEach((category, categoryIndex) => {
      const clue = category.clues[clueIndex];
      const id = clueId(categoryIndex, clueIndex);
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = `clue-tile${state.usedClues.has(id) ? " used" : ""}`;
      tile.textContent = clue.value;
      tile.disabled = state.usedClues.has(id) || state.finalComplete;
      tile.dataset.categoryIndex = String(categoryIndex);
      tile.dataset.clueIndex = String(clueIndex);
      tile.style.setProperty("--category-accent", category.visual?.color || "var(--coke-red)");
      tile.setAttribute("aria-label", `${category.name} for ${clue.value} points`);
      tile.addEventListener("click", () => openClue(categoryIndex, clueIndex));
      gameBoard.appendChild(tile);
    });
  }
  renderMobileBoard();
  updateProgress();
}

function renderMobileBoard() {
  if (!mobileCategoryNav || !mobileBoard) return;
  clearElement(mobileCategoryNav);
  gameData.categories.forEach((category, categoryIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mobile-category-button${categoryIndex === state.mobileCategoryIndex ? " active" : ""}`;
    button.textContent = category.shortName;
    button.style.setProperty("--category-accent", category.visual?.color || "var(--coke-red)");
    button.setAttribute("aria-pressed", categoryIndex === state.mobileCategoryIndex ? "true" : "false");
    button.addEventListener("click", () => {
      state.mobileCategoryIndex = categoryIndex;
      renderMobileBoard();
      saveState();
    });
    mobileCategoryNav.appendChild(button);
  });

  const category = gameData.categories[state.mobileCategoryIndex];
  if (!category) {
    clearElement(mobileBoard);
    return;
  }
  mobileBoard.style.setProperty("--category-accent", category.visual?.color || "var(--coke-red)");
  clearElement(mobileBoard);
  const heading = document.createElement("div");
  heading.className = "mobile-board-heading";
  heading.append(textElement("span", category.name), textElement("p", category.accent));
  mobileBoard.appendChild(heading);
  category.clues.forEach((clue, clueIndex) => {
    const id = clueId(state.mobileCategoryIndex, clueIndex);
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = `mobile-clue-tile${state.usedClues.has(id) ? " used" : ""}`;
    tile.disabled = state.usedClues.has(id) || state.finalComplete;
    tile.dataset.categoryIndex = String(state.mobileCategoryIndex);
    tile.dataset.clueIndex = String(clueIndex);
    tile.append(
      textElement("strong", clue.value),
      textElement("span", state.usedClues.has(id) ? "Used" : "Available")
    );
    tile.setAttribute("aria-label", `${category.name} for ${clue.value} points`);
    tile.addEventListener("click", () => openClue(state.mobileCategoryIndex, clueIndex));
    mobileBoard.appendChild(tile);
  });
  updateBoardModeAccessibility();
}

function setRegionInactive(region, inactive) {
  if (!region) return;
  region.toggleAttribute("inert", inactive);
  region.setAttribute("aria-hidden", inactive ? "true" : "false");
}

function updateBoardModeAccessibility() {
  const mobileMode = Boolean(mobileBoardQuery?.matches);
  setRegionInactive(gameBoard, mobileMode);
  setRegionInactive(mobileCategoryNav, !mobileMode);
  setRegionInactive(mobileBoard, !mobileMode);
  if (isDialogOpen(clueDialog) && state.currentClue?.revealed) {
    clueHostDetailsOpen = getDefaultHostDetailsOpen();
    updateClueHostDetailsDisclosure();
  }
  if (isDialogOpen(finalDialog) && state.finalResponseRevealed) {
    finalHostDetailsOpen = getDefaultFinalHostDetailsOpen();
    updateFinalHostDetailsDisclosure();
  }
}

function renderSetupFields(teams = state.teams) {
  clearElement(teamFields);
  teams.forEach((team, index) => {
    const label = document.createElement("label");
    label.textContent = `Team ${index + 1}`;
    const input = document.createElement("input");
    input.type = "text";
    input.value = team.name;
    input.maxLength = 24;
    input.dataset.teamIndex = String(index);
    label.appendChild(input);
    teamFields.appendChild(label);
  });
  updateTeamSetupControls(teams);
}

function readSetupDraftTeams() {
  const inputs = Array.from(teamFields.querySelectorAll("input"));
  if (!inputs.length) return state.teams.map((team) => ({ ...team }));
  return inputs.map((input, index) => ({
    name: input.value.trim() || `Team ${index + 1}`,
    score: setupDraftTeams?.[index]?.score ?? state.teams[index]?.score ?? 0
  }));
}

function finalTeamStructureLocked() {
  return Boolean(state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete);
}

function updateTeamSetupControls(teams = setupDraftTeams || state.teams) {
  const teamCount = teams.length;
  const finalLocked = finalTeamStructureLocked();
  addTeamButton.disabled = finalLocked || teamCount >= MAX_TEAM_COUNT;
  removeTeamButton.disabled = finalLocked || teamCount <= MIN_TEAM_COUNT;
  addTeamButton.title = finalLocked
    ? "Team count is locked during Final Jeopardy"
    : addTeamButton.disabled ? `Maximum ${MAX_TEAM_COUNT} teams` : "";
  removeTeamButton.title = finalLocked
    ? "Team count is locked during Final Jeopardy"
    : removeTeamButton.disabled ? `Minimum ${MIN_TEAM_COUNT} teams` : "";
}

function openSetup() {
  setupDraftTeams = state.teams.map((team) => ({ ...team }));
  renderSetupFields(setupDraftTeams);
  showDialog(setupDialog);
  teamFields.querySelector("input")?.focus();
}

function saveTeams() {
  const inputs = Array.from(teamFields.querySelectorAll("input"));
  if (finalTeamStructureLocked()) {
    state.teams = state.teams.map((team, index) => ({
      ...team,
      name: normalizeTeamName(inputs[index]?.value, index)
    }));
  } else {
    state.teams = inputs.map((input, index) => ({
      name: normalizeTeamName(input.value, index),
      score: clampNumber(state.teams[index]?.score, -SCORE_LIMIT, SCORE_LIMIT)
    }));
  }
  setupDraftTeams = null;
  state.activeTeam = Math.min(state.activeTeam, state.teams.length - 1);
  state.finalWagers = state.finalWagers.slice(0, state.teams.length);
  state.finalStartingScores = state.finalStartingScores.slice(0, state.teams.length);
  state.finalScoredTeams = new Set([...state.finalScoredTeams].filter((index) => index < state.teams.length));
  state.finalResults = state.finalResults.slice(0, state.teams.length);
  if (state.finalComplete && !finalReadyForResults()) {
    state.finalComplete = false;
  }
  normalizeFinalState();
  renderScoreboard();
  renderTeamSelect();
  updateBoardStatus();
  saveState();
  closeDialog(setupDialog);
}

function renderCurrentClueView() {
  if (!state.currentClue) return;
  const { category, clue } = state.currentClue;
  const visual = getVisual(category, clue);
  clueMeta.textContent = `${category.name} - ${clue.value} Points`;
  cluePanel.style.setProperty("--category-accent", visual.color);
  cluePanel.style.setProperty("--category-image", cssImageValue(visual.image));
  cluePanel.dataset.categoryId = category.id;
  categoryPrompt.hidden = true;
  renderClueStinger(category, false);
  clueText.textContent = clue.clue;
  responseText.textContent = clue.response;
  if (acceptanceStrip) {
    acceptanceStrip.hidden = !clue.hostAccepts;
    acceptanceStrip.textContent = clue.hostAccepts || "";
  }
  whyText.textContent = clue.why;
  teachingTag.textContent = clue.tag;
  renderGlossary(glossaryStrip, clue);
  bridgeText.textContent = clue.bridge;
  riskSignal.textContent = clue.riskCard.signal;
  riskConcern.textContent = clue.riskCard.risk;
  riskAction.textContent = clue.riskCard.action;
  responseBlock.hidden = !state.currentClue.revealed;
  updateClueHostDetailsDisclosure();
  revealButton.disabled = state.currentClue.revealed;
  updateClueStageUI();
  renderTeamSelect();
  updateScoreButtons();
  updateHostNoteForCurrentClue();
}

function openClue(categoryIndex, itemIndex) {
  if (state.finalComplete) return;
  playSound("tile");
  const category = gameData.categories[categoryIndex];
  const clue = category.clues[itemIndex];
  const id = clueId(categoryIndex, itemIndex);
  const showCategoryPrompt = !state.seenCategoryPrompts.has(category.id);
  state.currentClue = {
    id,
    category,
    clue,
    scoredTeams: new Set(),
    noScore: false,
    stealOpen: false,
    resolved: false,
    revealed: false,
    categoryPromptWasNew: showCategoryPrompt,
    selectedTeam: state.activeTeam
  };
  clueHostDetailsOpen = getDefaultHostDetailsOpen();

  renderCurrentClueView();
  renderClueStinger(category, showCategoryPrompt);
  correctButton.disabled = true;
  incorrectButton.disabled = true;
  noScoreButton.disabled = true;
  hostNote.textContent = `${state.teams[state.activeTeam].name} is up. Reveal when ready, then score or close.`;
  saveState();
  showDialog(clueDialog);
  revealButton.focus();
}

function revealClue() {
  playSound("reveal");
  responseBlock.hidden = false;
  state.currentClue.revealed = true;
  markCurrentCategoryPromptSeen();
  clueHostDetailsOpen = getDefaultHostDetailsOpen();
  revealButton.disabled = true;
  updateClueHostDetailsDisclosure();
  updateScoreButtons();
  updateHostNoteForCurrentClue();
  saveState();
  correctButton.focus();
}

function markCurrentUsed() {
  if (!state.currentClue) return;
  state.usedClues.add(state.currentClue.id);
  renderBoard();
}

function animateScore(teamIndex, multiplier) {
  const cards = scoreboard.querySelectorAll(".team-card");
  const card = cards[teamIndex];
  if (!card) return;
  card.classList.remove("score-up", "score-down", "score-celebrate");
  void card.offsetWidth;
  card.classList.add(multiplier > 0 ? "score-up" : "score-down");
  if (multiplier > 0) {
    card.classList.add("score-celebrate");
  }
}

function getNextUnscoredTeamIndex(startIndex) {
  if (!state.currentClue) return startIndex;
  for (let offset = 1; offset <= state.teams.length; offset += 1) {
    const teamIndex = (startIndex + offset) % state.teams.length;
    if (!state.currentClue.scoredTeams.has(teamIndex)) {
      return teamIndex;
    }
  }
  return startIndex;
}

function applyScore(multiplier) {
  if (!state.currentClue) return;
  const teamIndex = sanitizeTeamIndex(modalTeamSelect.value, state.currentClue.selectedTeam);
  state.currentClue.selectedTeam = teamIndex;
  const wasStealAttempt = Boolean(state.currentClue.stealOpen);
  let nextStealTeamIndex = null;
  if (
    state.currentClue.noScore ||
    state.currentClue.resolved ||
    state.currentClue.scoredTeams.has(teamIndex)
  ) return;
  playSound(multiplier > 0 ? "correct" : "incorrect");
  const team = state.teams[teamIndex];
  const value = currentClueScoreValue();
  const delta = value * multiplier;
  if (!state.currentClue.scoredTeams.size || !state.undoSnapshot) {
    captureClueResolutionUndo(`${team.name} ${formatDelta(delta)}`);
  } else if (wasStealAttempt) {
    relabelUndo(`${state.currentClue.category.name} ${state.currentClue.clue.value} scoring`);
  }
  team.score += value * multiplier;
  state.currentClue.scoredTeams.add(teamIndex);
  markCurrentUsed();
  if (multiplier > 0) {
    state.activeTeam = teamIndex;
    state.currentClue.resolved = true;
  } else if (state.currentClue.stealOpen || state.currentClue.scoredTeams.size >= state.teams.length) {
    state.currentClue.resolved = true;
    if (wasStealAttempt) {
      modalTeamSelect.value = String(state.activeTeam);
      state.currentClue.selectedTeam = state.activeTeam;
    }
  } else {
    state.currentClue.stealOpen = true;
    nextStealTeamIndex = getNextUnscoredTeamIndex(teamIndex);
    state.currentClue.selectedTeam = nextStealTeamIndex;
  }
  renderScoreboard();
  animateScore(teamIndex, multiplier);
  renderTeamSelect();
  if (nextStealTeamIndex !== null) {
    modalTeamSelect.value = String(nextStealTeamIndex);
  }
  updateScoreButtons();
  if (multiplier > 0) {
    hostNote.textContent = `${team.name} earned ${value} points. This clue is closed.`;
  } else if (state.currentClue.resolved) {
    hostNote.textContent = `${team.name} lost ${value} points. The steal attempt is complete and this clue is closed.`;
  } else {
    hostNote.textContent = `${team.name} lost ${value} points. Steal available: score the selected team, choose another team, or use Close Clue.`;
  }
  recordHistory({
    title: `${state.currentClue.category.name} ${state.currentClue.clue.value}`,
    detail: `${team.name} ${formatDelta(delta)}`,
    delta,
    type: multiplier > 0 ? "positive" : "negative"
  });
  updateBoardStatus();
  showToast(`${team.name} ${formatDelta(delta)}`, multiplier > 0 ? "positive" : "negative");
  if (state.currentClue.resolved) {
    closeDialog(clueDialog);
    saveState();
  } else if (nextStealTeamIndex !== null) {
    saveState();
    modalTeamSelect.focus();
  } else {
    saveState();
  }
}

function noScore() {
  if (!state.currentClue) return;
  const label = `${state.currentClue.category.name} ${state.currentClue.clue.value} closed`;
  const closingSteal = state.currentClue.stealOpen && !state.currentClue.resolved && state.currentClue.scoredTeams.size > 0;
  if (closingSteal) {
    state.currentClue.stealOpen = false;
    state.currentClue.resolved = true;
    updateScoreButtons();
    hostNote.textContent = "Clue closed with no steal score.";
    updateBoardStatus();
    showToast(label, "neutral");
    closeDialog(clueDialog);
    saveState();
    return;
  }
  captureClueResolutionUndo(label);
  state.currentClue.noScore = true;
  state.currentClue.resolved = true;
  markCurrentUsed();
  updateScoreButtons();
  hostNote.textContent = state.currentClue.scoredTeams.size
    ? "Clue closed with no steal score."
    : "Clue marked used with no score change.";
  recordHistory({
    title: `${state.currentClue.category.name} ${state.currentClue.clue.value}`,
    detail: "Closed with no score",
    type: "neutral"
  });
  updateBoardStatus();
  showToast(label, "neutral");
  closeDialog(clueDialog);
  saveState();
}

function updateScoreButtons() {
  const stage = updateClueStageUI();
  const revealed = Boolean(state.currentClue?.revealed);
  const selectedTeam = Number(modalTeamSelect.value);
  const alreadyScored = state.currentClue?.scoredTeams.has(selectedTeam);
  const noScoreApplied = Boolean(state.currentClue?.noScore);
  const resolved = Boolean(state.currentClue?.resolved);
  const stealPending = Boolean(state.currentClue?.stealOpen && !resolved);
  const scoreValue = currentClueScoreValue();
  correctButton.textContent = scoreValue ? `Correct +${scoreValue}` : "Correct +";
  incorrectButton.textContent = scoreValue ? `Incorrect -${scoreValue}` : "Incorrect -";
  revealButton.disabled = stage !== "clue";
  correctButton.disabled = !revealed || alreadyScored || noScoreApplied || resolved;
  incorrectButton.disabled = !revealed || alreadyScored || noScoreApplied || resolved;
  noScoreButton.disabled = !revealed || noScoreApplied || resolved;
  noScoreButton.textContent = stealPending ? "Close Clue" : "No Score / Close";
  closeClueButton.disabled = stealPending;
  closeClueButton.classList.toggle("primary-next", resolved && !stealPending);
}

function updateHostNoteForCurrentClue() {
  if (!state.currentClue) return;
  const stage = getClueHostStage();
  if (stage === "closed") {
    hostNote.textContent = state.currentClue.noScore
      ? "Clue closed with no score change."
      : "Clue closed. Return to the board when ready.";
    return;
  }
  if (stage === "steal") {
    hostNote.textContent = "Steal available: score the selected team, choose another team, or use Close Clue to return to the board.";
    return;
  }
  if (stage === "response") {
    hostNote.textContent = "Response revealed. Score the selected team or mark No Score to return to the board.";
    return;
  }
  hostNote.textContent = `${state.teams[state.activeTeam].name} is up. Reveal when ready, then score or close.`;
}

function resetGameState({ keepTeamNames = true } = {}) {
  state.teams = keepTeamNames
    ? state.teams.map((team) => ({ ...team, score: 0 }))
    : [
      { name: "Team 1", score: 0 },
      { name: "Team 2", score: 0 },
      { name: "Team 3", score: 0 }
    ];
  state.activeTeam = 0;
  state.usedClues.clear();
  state.currentClue = null;
  state.seenCategoryPrompts.clear();
  state.actionHistory = [];
  state.undoSnapshot = null;
  state.finalWagers = [];
  state.finalStartingScores = [];
  state.finalWagersLocked = false;
  state.finalResponseRevealed = false;
  state.finalScoredTeams.clear();
  state.finalResults = [];
  state.finalComplete = false;
  state.mobileCategoryIndex = 0;
  updateFinalButton();
}

function renderFreshGame({ persist = true } = {}) {
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  updateUndoButton();
  updateBoardStatus("Game reset. Choose a team, then choose a clue.");
  closeGameDialogs();
  if (persist) saveState();
}

async function resetGame() {
  const confirmed = await confirmAction({
    title: "Reset Game?",
    message: "This clears scores, used tiles, recent plays, and Final Jeopardy progress on this device.",
    confirmLabel: "Reset Game",
    variant: "danger"
  });
  if (!confirmed) return;
  resetGameState();
  clearSavedState();
  renderFreshGame({ persist: true });
  showToast("Game reset", "neutral");
}

function showResultsDialog(returnFocus) {
  renderEndScreen();
  showDialog(endDialog, returnFocus);
  playSound("winner");
}

function openFinal() {
  if (state.finalComplete) {
    showResultsDialog(finalButton);
    return;
  }
  finalCategory.textContent = gameData.finalJeopardy.category;
  const finalVisual = gameData.finalJeopardy.visual || {};
  finalPanel.style.setProperty("--category-accent", finalVisual.color || "var(--coke-red)");
  finalPanel.style.setProperty("--category-image", cssImageValue(finalVisual.image, DEFAULT_FINAL_IMAGE));
  finalResponse.textContent = gameData.finalJeopardy.response;
  if (finalAcceptanceStrip) {
    finalAcceptanceStrip.hidden = !gameData.finalJeopardy.hostAccepts;
    finalAcceptanceStrip.textContent = gameData.finalJeopardy.hostAccepts || "";
  }
  renderFinalRubric();
  finalWhy.textContent = gameData.finalJeopardy.why;
  renderGlossary(finalGlossaryStrip, gameData.finalJeopardy);
  finalBridge.textContent = gameData.finalJeopardy.bridge;
  finalRiskSignal.textContent = gameData.finalJeopardy.riskCard.signal;
  finalRiskConcern.textContent = gameData.finalJeopardy.riskCard.risk;
  finalRiskAction.textContent = gameData.finalJeopardy.riskCard.action;
  finalResponseBlock.hidden = !state.finalResponseRevealed;
  if (!state.finalResponseRevealed) {
    finalHostDetailsOpen = getDefaultFinalHostDetailsOpen();
  }
  if (finalWagerHelper) {
    finalWagerHelper.hidden = state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete;
  }
  updateFinalHostDetailsDisclosure();
  renderFinalPrompt();
  renderWagers();
  renderFinalStage();
  updateFinalControls();
  if (showFinalResultsWhenReady()) return;
  showDialog(finalDialog);
  const firstWagerInput = wagerGrid.querySelector("input:not(:disabled)");
  (firstWagerInput || finalPrimaryButton || finalUndoButton).focus();
}

function renderFinalPrompt() {
  const promptIsOpen = state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete;
  finalClue.textContent = promptIsOpen
    ? gameData.finalJeopardy.clue
    : "Enter wagers, then reveal the final clue.";
  finalClue.classList.toggle("pending-final-prompt", !promptIsOpen);
}

function renderWagers() {
  syncFinalZeroWagers();
  clearElement(wagerGrid);
  state.teams.forEach((team, index) => {
    const card = document.createElement("article");
    const isScored = state.finalScoredTeams.has(index);
    const maxWager = getFinalWagerCap(index);
    const inputLocked = state.finalWagersLocked || state.finalResponseRevealed || isScored || state.finalComplete;
    const storedWager = Math.max(0, Number(state.finalWagers[index]) || 0);
    const wager = state.finalWagersLocked ? storedWager : Math.min(maxWager, storedWager);
    state.finalWagers[index] = wager;
    const showScoreActions = state.finalResponseRevealed || isScored || state.finalComplete;
    card.className = `wager-card${isScored ? " scored" : ""}`;
    const label = document.createElement("label");
    label.appendChild(textElement("span", team.name));
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = String(maxWager);
    input.step = "100";
    input.value = String(wager);
    input.dataset.wagerIndex = String(index);
    input.setAttribute("aria-label", `${team.name} wager`);
    input.disabled = inputLocked;
    label.appendChild(input);

    const limit = textElement("p", `${state.finalWagersLocked ? "Locked wager" : "Max wager"}: ${formatScore(maxWager)}`, "wager-limit");
    const actions = document.createElement("div");
    actions.className = "wager-actions final-score-actions";
    actions.hidden = !showScoreActions;
    const canScore = state.finalResponseRevealed && !isScored && !state.finalComplete && wager > 0;
    if (wager === 0) {
      actions.appendChild(textElement("p", state.finalResponseRevealed ? "Auto-reviewed" : "No wager", "final-reviewed-note"));
    } else {
      [
        { result: "correct", className: "positive", label: `Full +${wager}` },
        { result: "partial", className: "partial", label: `Half +${Math.floor(wager / 2)}` },
        { result: "incorrect", className: "negative", label: `Miss -${wager}` }
      ].forEach((action) => {
        const button = document.createElement("button");
        button.className = `score-button ${action.className}`;
        button.type = "button";
        button.dataset.finalResult = action.result;
        button.dataset.teamIndex = String(index);
        button.disabled = !canScore;
        button.textContent = action.label;
        actions.appendChild(button);
      });
    }
    card.append(label, limit, actions);
    wagerGrid.appendChild(card);
  });
}

function renderFinalRubric() {
  if (!finalRubric || !finalRubricList) return;
  const rubricItems = gameData.finalJeopardy.rubric || [];
  finalRubric.hidden = !state.finalResponseRevealed || !rubricItems.length;
  clearElement(finalRubricList);
  rubricItems.forEach((item) => {
    const article = document.createElement("article");
    article.append(textElement("span", item.label), textElement("p", item.text));
    finalRubricList.appendChild(article);
  });
}

function renderFinalStage() {
  let activeStep = "wagers";
  if (state.finalComplete) {
    activeStep = "results";
  } else if (finalReadyForResults()) {
    activeStep = "results";
  } else if (state.finalResponseRevealed) {
    activeStep = "score";
  } else if (state.finalWagersLocked) {
    activeStep = "prompt";
  }
  if (finalPanel) {
    finalPanel.dataset.finalStage = activeStep;
  }
}

function updateFinalControls() {
  if (finalWagerHelper) {
    finalWagerHelper.hidden = state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete;
  }
  if (state.finalComplete) {
    finalPrimaryButton.hidden = true;
    finalPrimaryButton.disabled = true;
    finalPrimaryButton.textContent = "Results Ready";
    return;
  }
  if (finalReadyForResults()) {
    finalPrimaryButton.hidden = false;
    finalPrimaryButton.disabled = false;
    finalPrimaryButton.textContent = "Show Results";
    return;
  }
  if (state.finalResponseRevealed) {
    finalPrimaryButton.hidden = true;
    finalPrimaryButton.disabled = true;
    finalPrimaryButton.textContent = "Score Remaining Teams";
    return;
  }
  finalPrimaryButton.hidden = false;
  finalPrimaryButton.disabled = false;
  finalPrimaryButton.textContent = state.finalWagersLocked ? "Reveal Final Response" : "Reveal Final Clue";
}

function normalizeFinalWagers() {
  state.teams.forEach((team, index) => {
    const maxWager = getFinalWagerCap(index);
    state.finalWagers[index] = Math.min(maxWager, Math.max(0, Number(state.finalWagers[index]) || 0));
  });
}

function lockFinalWagers() {
  if (state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete) return;
  captureUndo("lock Final wagers");
  state.finalStartingScores = state.teams.map((team) => Math.max(0, team.score));
  normalizeFinalWagers();
  state.finalWagersLocked = true;
  renderFinalPrompt();
  renderWagers();
  renderFinalStage();
  updateFinalControls();
  saveState();
  showToast("Final clue revealed", "neutral");
  finalPrimaryButton.focus();
}

function revealFinal() {
  if (!state.finalWagersLocked || state.finalResponseRevealed || state.finalComplete) return;
  captureUndo("reveal Final Jeopardy");
  playSound("reveal");
  finalResponseBlock.hidden = false;
  state.finalResponseRevealed = true;
  finalHostDetailsOpen = getDefaultFinalHostDetailsOpen();
  syncFinalZeroWagers();
  renderFinalPrompt();
  renderFinalRubric();
  renderWagers();
  updateFinalHostDetailsDisclosure();
  updateFinalControls();
  renderFinalStage();
  saveState();
  if (showFinalResultsWhenReady()) return;
  (wagerGrid.querySelector("button:not(:disabled)") || finalPrimaryButton)?.focus();
}

function advanceFinalStage() {
  if (state.finalComplete) return;
  if (!state.finalWagersLocked) {
    lockFinalWagers();
    return;
  }
  if (!state.finalResponseRevealed) {
    revealFinal();
    return;
  }
  if (finalReadyForResults()) {
    completeFinalJeopardy();
  }
}

function finalReadyForResults() {
  return state.finalResponseRevealed && state.finalScoredTeams.size === state.teams.length;
}

function syncFinalZeroWagers() {
  if (!state.finalResponseRevealed || state.finalComplete) return;
  state.teams.forEach((team, index) => {
    const wager = Math.max(0, Number(state.finalWagers[index]) || 0);
    if (wager === 0) {
      state.finalScoredTeams.add(index);
      state.finalResults[index] = sanitizeFinalResult({
        result: "none",
        label: "Auto-reviewed",
        delta: 0
      });
    }
  });
}

function showFinalResultsWhenReady() {
  if (!finalReadyForResults() || state.finalComplete) return false;
  completeFinalJeopardy();
  return true;
}

function completeFinalJeopardy() {
  if (state.finalComplete) return;
  state.finalComplete = true;
  updateFinalButton();
  updateBoardStatus();
  renderBoard();
  renderFinalStage();
  updateFinalControls();
  saveState();
  if (isDialogOpen(finalDialog)) {
    closeDialog(finalDialog);
  }
  window.setTimeout(() => showResultsDialog(finalButton), 0);
}

function applyFinalScore(button) {
  const teamIndex = Number(button.dataset.teamIndex);
  if (!state.finalWagersLocked || !state.finalResponseRevealed || state.finalScoredTeams.has(teamIndex) || state.finalComplete) return;
  const result = button.dataset.finalResult;
  const input = wagerGrid.querySelector(`[data-wager-index="${teamIndex}"]`);
  const wager = Math.max(0, Number(state.finalWagers[teamIndex]) || 0);
  input.value = String(wager);
  state.finalWagers[teamIndex] = wager;
  const scoring = {
    correct: { delta: wager, type: "positive", sound: "correct", label: "Full" },
    partial: { delta: Math.floor(wager / 2), type: wager ? "positive" : "neutral", sound: "correct", label: "Half" },
    incorrect: { delta: -wager, type: wager ? "negative" : "neutral", sound: "incorrect", label: "Miss" },
  }[result] || { delta: 0, type: "neutral", sound: "reveal", label: "Score" };
  const delta = scoring.delta;
  const resultType = scoring.type;
  captureUndo(`${state.teams[teamIndex].name} Final ${formatDelta(delta)}`);
  playSound(scoring.sound);
  state.teams[teamIndex].score += delta;
  state.finalScoredTeams.add(teamIndex);
  state.finalResults[teamIndex] = sanitizeFinalResult({
    result,
    label: scoring.label,
    delta
  });
  const card = button.closest(".wager-card");
  card.classList.add("scored");
  card.querySelector("input").disabled = true;
  button.closest(".wager-actions").querySelectorAll("button").forEach((item) => {
    item.disabled = true;
  });
  renderScoreboard();
  if (delta !== 0) {
    animateScore(teamIndex, delta > 0 ? 1 : -1);
  }
  recordHistory({
    title: "Final Jeopardy",
    detail: `${state.teams[teamIndex].name} ${scoring.label} ${formatDelta(delta)}`,
    delta,
    type: resultType
  });
  syncFinalZeroWagers();
  renderWagers();
  renderFinalStage();
  updateFinalControls();
  updateBoardStatus();
  showToast(`${state.teams[teamIndex].name} ${scoring.label} ${formatDelta(delta)}`, resultType);
  saveState();
  showFinalResultsWhenReady();
}

function hydrateGameText() {
  gameTitle.textContent = gameData.title;
  gameSubtitle.textContent = gameData.subtitle;
  gameTheme.textContent = gameData.theme;
  document.title = gameData.title;
}

function showSavedGamePrompt(snapshot) {
  pendingSavedState = snapshot;
  const usedCount = snapshot.usedClues?.length || 0;
  const teamCount = snapshot.teams?.length || state.teams.length;
  resumeSummary.textContent = `${usedCount}/${getTotalClues()} clues played with ${teamCount} teams. Resume it or start a clean board.`;
  showDialog(resumeDialog, document.activeElement, { persist: false });
  document.getElementById("resumeSavedButton")?.focus();
}

function resumeSavedGame() {
  const snapshot = pendingSavedState;
  pendingSavedState = null;
  closeDialog(resumeDialog);
  if (snapshot) {
    if (restoreState(snapshot, { reopenDialogs: true })) {
      saveState();
    }
  }
}

function startFreshFromPrompt() {
  pendingSavedState = null;
  clearSavedState();
  closeDialog(resumeDialog);
  resetGameState({ keepTeamNames: false });
  renderFreshGame({ persist: true });
  showToast("Fresh game ready", "neutral");
}

function renderRules() {
  rulesThemeLens.textContent = gameData.themeLens;
  clearElement(rulesList);
  gameData.rules.forEach((rule) => {
    rulesList.appendChild(textElement("li", rule));
  });
}

function renderClueStinger(category, showCategoryPrompt) {
  clueStinger.hidden = !showCategoryPrompt;
  if (clueStinger.hidden) return;

  stingerEyebrow.textContent = "Category Lens";
  stingerTitle.textContent = category.name;
  stingerText.textContent = category.accent;
}

function renderWinnerCelebration() {
  clearElement(winnerCelebration);
  winnerTitle.classList.remove("winner-title-celebrate");
  void winnerTitle.offsetWidth;
  winnerTitle.classList.add("winner-title-celebrate");

  const colors = ["#f40000", "#ffffff", "#ffd15c", "#b00000"];
  const shapes = ["ribbon", "square", "dash"];
  const particles = Array.from({ length: 46 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1;
    return {
      color: colors[index % colors.length],
      shape: shapes[index % shapes.length],
      x: 12 + ((index * 17) % 76),
      dx: side * (26 + ((index * 11) % 42)),
      delay: ((index * 37) % 900) / 1000,
      duration: 2.1 + ((index * 13) % 90) / 100,
      rotate: side * (90 + ((index * 29) % 230))
    };
  });

  particles.forEach((particle) => {
    const confetti = document.createElement("span");
    confetti.className = `winner-confetti ${particle.shape}`;
    confetti.style.setProperty("--x", particle.x);
    confetti.style.setProperty("--dx", `${particle.dx}px`);
    confetti.style.setProperty("--delay", `${particle.delay}s`);
    confetti.style.setProperty("--duration", `${particle.duration}s`);
    confetti.style.setProperty("--rotate", `${particle.rotate}deg`);
    confetti.style.setProperty("--confetti-color", particle.color);
    winnerCelebration.appendChild(confetti);
  });
}

function renderEndScreen() {
  const ranked = [...state.teams].sort((a, b) => b.score - a.score);
  const highScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter((team) => team.score === highScore).map((team) => team.name);
  renderWinnerCelebration();
  winnerTitle.textContent = winners.length > 1 ? `Winners: ${winners.join(" + ")}` : `Winner: ${winners[0]}`;
  closeoutText.textContent = gameData.closeout;
  clearElement(finalScoreList);
  ranked.forEach((team, index) => {
    const row = document.createElement("div");
    row.style.setProperty("--score-index", index);
    row.append(textElement("span", team.name), textElement("strong", formatScore(team.score)));
    finalScoreList.appendChild(row);
  });
  pledgeCard.replaceChildren(textElement("span", gameData.pledge.title), textElement("p", gameData.pledge.text));
  clearElement(debriefTakeaways);
  gameData.debriefTakeaways.forEach((takeaway) => {
    const article = document.createElement("article");
    article.append(textElement("span", takeaway.title), textElement("p", takeaway.text));
    debriefTakeaways.appendChild(article);
  });
}

function isTypingTarget(target) {
  const tagName = target?.tagName;
  return (
    target?.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT"
  );
}

function isDialogOpen(dialog) {
  return Boolean(dialog?.open);
}

function getActiveDialog() {
  return [
    confirmDialog,
    resumeDialog,
    endDialog,
    finalDialog,
    clueDialog,
    rulesDialog,
    setupDialog
  ].find(isDialogOpen) || null;
}

function getFocusableElements(container) {
  return window.JeopardyDialogs?.getFocusableElements(container) || [];
}

function trapDialogTab(event) {
  const dialog = getActiveDialog();
  return window.JeopardyDialogs?.trapTab(event, dialog) || false;
}

function clickIfAvailable(button) {
  if (!button || button.disabled) return false;
  button.click();
  return true;
}

function handleKeyboardShortcuts(event) {
  if (trapDialogTab(event)) return;

  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingTarget(event.target)
  ) return;

  const nonGameDialogOpen = isDialogOpen(setupDialog) ||
    isDialogOpen(rulesDialog) ||
    isDialogOpen(resumeDialog) ||
    isDialogOpen(confirmDialog) ||
    isDialogOpen(endDialog);
  if (nonGameDialogOpen) return;

  const key = event.key.toLowerCase();
  if (key === "u") {
    event.preventDefault();
    undoLastAction();
    return;
  }

  if (key === "r") {
    if (isDialogOpen(clueDialog)) {
      event.preventDefault();
      clickIfAvailable(revealButton);
    } else if (isDialogOpen(finalDialog)) {
      event.preventDefault();
      clickIfAvailable(finalPrimaryButton);
    }
    return;
  }

  if (key === "c" && isDialogOpen(clueDialog)) {
    event.preventDefault();
    clickIfAvailable(correctButton);
    return;
  }

  if (key === "i" && isDialogOpen(clueDialog)) {
    event.preventDefault();
    clickIfAvailable(incorrectButton);
    return;
  }

}

function bindEvents() {
  soundButton.addEventListener("click", toggleSound);
  document.getElementById("setupButton").addEventListener("click", openSetup);
  document.getElementById("closeSetupButton").addEventListener("click", () => closeDialog(setupDialog));
  document.getElementById("rulesButton").addEventListener("click", (event) => showDialog(rulesDialog, event.currentTarget));
  document.getElementById("closeRulesButton").addEventListener("click", () => closeDialog(rulesDialog));
  undoButton.addEventListener("click", undoLastAction);
  document.getElementById("resetButton").addEventListener("click", resetGame);
  finalButton.addEventListener("click", () => openFinal());
  closeClueButton.addEventListener("click", closeClueFromHost);
  clueDialog.addEventListener("cancel", (event) => {
    const stealPending = state.currentClue?.stealOpen && !state.currentClue.resolved;
    const revealedNeedsResolution = state.currentClue?.revealed && !state.currentClue.resolved && !state.currentClue.noScore;
    if (stealPending || revealedNeedsResolution) {
      event.preventDefault();
      if (revealedNeedsResolution) {
        closeClueFromHost();
      }
    }
  });
  document.getElementById("closeFinalButton").addEventListener("click", () => closeDialog(finalDialog));
  finalUndoButton.addEventListener("click", undoLastAction);
  document.getElementById("closeEndButton").addEventListener("click", () => closeDialog(endDialog));
  document.getElementById("resumeSavedButton").addEventListener("click", resumeSavedGame);
  document.getElementById("startFreshButton").addEventListener("click", startFreshFromPrompt);
  confirmAcceptButton.addEventListener("click", () => resolveConfirm(true));
  confirmCancelButton.addEventListener("click", () => resolveConfirm(false));
  confirmDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    resolveConfirm(false);
  });
  [setupDialog, clueDialog, finalDialog, rulesDialog, endDialog, resumeDialog, confirmDialog].forEach((dialog) => {
    dialog.addEventListener("close", () => {
      if (dialog === setupDialog) {
        setupDraftTeams = null;
      }
      if (dialog === clueDialog) {
        clearUnplayedCurrentClue();
      }
      restoreDialogFocus(dialog);
      if (dialog !== resumeDialog && dialog !== confirmDialog) {
        saveState();
      }
    });
  });
  addTeamButton.addEventListener("click", () => {
    if (finalTeamStructureLocked()) return;
    setupDraftTeams = readSetupDraftTeams();
    if (setupDraftTeams.length >= MAX_TEAM_COUNT) return;
    setupDraftTeams.push({ name: `Team ${setupDraftTeams.length + 1}`, score: 0 });
    renderSetupFields(setupDraftTeams);
  });
  removeTeamButton.addEventListener("click", () => {
    if (finalTeamStructureLocked()) return;
    setupDraftTeams = readSetupDraftTeams();
    if (setupDraftTeams.length <= MIN_TEAM_COUNT) return;
    setupDraftTeams.pop();
    renderSetupFields(setupDraftTeams);
  });
  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveTeams();
  });
  modalTeamSelect.addEventListener("change", () => {
    if (isDialogOpen(clueDialog)) {
      if (state.currentClue) {
        state.currentClue.selectedTeam = sanitizeTeamIndex(modalTeamSelect.value, state.currentClue.selectedTeam);
      }
      updateScoreButtons();
      saveState();
      return;
    }
    state.activeTeam = Number(modalTeamSelect.value);
    renderScoreboard();
    updateBoardStatus();
    updateScoreButtons();
    saveState();
  });
  revealButton.addEventListener("click", revealClue);
  hostDetailsToggle.addEventListener("click", () => {
    clueHostDetailsOpen = !clueHostDetailsOpen;
    updateClueHostDetailsDisclosure();
  });
  correctButton.addEventListener("click", () => applyScore(1));
  incorrectButton.addEventListener("click", () => applyScore(-1));
  noScoreButton.addEventListener("click", noScore);
  finalPrimaryButton.addEventListener("click", advanceFinalStage);
  finalHostDetailsToggle.addEventListener("click", () => {
    finalHostDetailsOpen = !finalHostDetailsOpen;
    updateFinalHostDetailsDisclosure();
  });
  wagerGrid.addEventListener("input", (event) => {
    if (state.finalWagersLocked) return;
    const input = event.target.closest("input[data-wager-index]");
    if (!input) return;
    const teamIndex = Number(input.dataset.wagerIndex);
    const maxWager = Math.max(0, state.teams[teamIndex].score);
    const wager = Math.min(maxWager, Math.max(0, Number(input.value) || 0));
    state.finalWagers[teamIndex] = wager;
    if (input.value !== String(wager)) {
      input.value = String(wager);
    }
    saveState();
  });
  wagerGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-final-result]");
    if (button) applyFinalScore(button);
  });
  if (mobileBoardQuery?.addEventListener) {
    mobileBoardQuery.addEventListener("change", updateBoardModeAccessibility);
  } else if (mobileBoardQuery?.addListener) {
    mobileBoardQuery.addListener(updateBoardModeAccessibility);
  }
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function init() {
  state.soundMuted = readSoundPreference();
  updateSoundButton();
  hydrateGameText();
  renderRules();
  bindEvents();
  const savedState = readSavedState();
  if (hasMeaningfulSavedState(savedState)) {
    resetGameState();
    renderFreshGame({ persist: false });
    showSavedGamePrompt(savedState);
    return;
  }
  if (savedState && loadState(savedState)) return;
  resetGameState();
  renderFreshGame({ persist: false });
}

init();
