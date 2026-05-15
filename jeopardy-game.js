const gameData = window.JeopardyData;
const SOUND_STORAGE_KEY = "jeopardy-sound-muted";
const GAME_STATE_STORAGE_KEY = "wfsd-jeopardy-game-state-v1";
const dialogReturnFocus = new WeakMap();
let toastTimer = null;

const state = {
  teams: [
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
    { name: "Team 3", score: 0 }
  ],
  activeTeam: 0,
  usedClues: new Set(),
  currentClue: null,
  timer: null,
  secondsLeft: 30,
  soundMuted: true,
  audioContext: null,
  seenCategoryPrompts: new Set(),
  challengeEnabled: true,
  challengeClueId: null,
  presenterMode: false,
  actionHistory: [],
  undoSnapshot: null,
  finalWagers: [],
  finalResponseRevealed: false,
  finalScoredTeams: new Set(),
  finalComplete: false
};

const gameTitle = document.getElementById("gameTitle");
const gameSubtitle = document.getElementById("gameSubtitle");
const gameTheme = document.getElementById("gameTheme");
const soundButton = document.getElementById("soundButton");
const scoreboard = document.getElementById("scoreboard");
const gameBoard = document.getElementById("gameBoard");
const boardStatus = document.getElementById("boardStatus");
const progressStatus = document.getElementById("progressStatus");
const undoButton = document.getElementById("undoButton");
const setupDialog = document.getElementById("setupDialog");
const setupForm = document.getElementById("setupForm");
const teamFields = document.getElementById("teamFields");
const clueDialog = document.getElementById("clueDialog");
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
const whyText = document.getElementById("whyText");
const teachingTag = document.getElementById("teachingTag");
const glossaryStrip = document.getElementById("glossaryStrip");
const bridgeText = document.getElementById("bridgeText");
const riskSignal = document.getElementById("riskSignal");
const riskConcern = document.getElementById("riskConcern");
const riskAction = document.getElementById("riskAction");
const modalTeamSelect = document.getElementById("modalTeamSelect");
const timerButton = document.getElementById("timerButton");
const timerDisplay = document.getElementById("timerDisplay");
const revealButton = document.getElementById("revealButton");
const correctButton = document.getElementById("correctButton");
const incorrectButton = document.getElementById("incorrectButton");
const noScoreButton = document.getElementById("noScoreButton");
const backButton = document.getElementById("backButton");
const closeClueButton = document.getElementById("closeClueButton");
const hostNote = document.getElementById("hostNote");
const finalDialog = document.getElementById("finalDialog");
const finalCategory = document.getElementById("finalCategory");
const finalClue = document.getElementById("finalClue");
const finalResponseBlock = document.getElementById("finalResponseBlock");
const finalResponse = document.getElementById("finalResponse");
const finalWhy = document.getElementById("finalWhy");
const finalGlossaryStrip = document.getElementById("finalGlossaryStrip");
const finalBridge = document.getElementById("finalBridge");
const finalRiskSignal = document.getElementById("finalRiskSignal");
const finalRiskConcern = document.getElementById("finalRiskConcern");
const finalRiskAction = document.getElementById("finalRiskAction");
const wagerGrid = document.getElementById("wagerGrid");
const finalButton = document.getElementById("finalButton");
const revealFinalButton = document.getElementById("revealFinalButton");
const finalSteps = document.getElementById("finalSteps");
const endButton = document.getElementById("endButton");
const hostNotesDialog = document.getElementById("hostNotesDialog");
const hostScriptList = document.getElementById("hostScriptList");
const recentPlayList = document.getElementById("recentPlayList");
const shortcutList = document.getElementById("shortcutList");
const presenterToggle = document.getElementById("presenterToggle");
const challengeToggle = document.getElementById("challengeToggle");
const challengeToggleLabel = document.getElementById("challengeToggleLabel");
const challengeToggleDescription = document.getElementById("challengeToggleDescription");
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

function clueId(categoryIndex, clueIndex) {
  return `${categoryIndex}-${clueIndex}`;
}

function getTotalClues() {
  return gameData.categories.reduce((sum, category) => sum + category.clues.length, 0);
}

function getClueById(id) {
  const [categoryIndex, clueIndex] = String(id).split("-").map(Number);
  const category = gameData.categories[categoryIndex];
  const clue = category?.clues?.[clueIndex];
  if (!category || !clue) return null;
  return { categoryIndex, clueIndex, category, clue };
}

function serializeCurrentClue() {
  if (!state.currentClue) return null;
  return {
    id: state.currentClue.id,
    isChallenge: Boolean(state.currentClue.isChallenge),
    scoredTeams: [...state.currentClue.scoredTeams],
    noScore: Boolean(state.currentClue.noScore),
    stealOpen: Boolean(state.currentClue.stealOpen),
    resolved: Boolean(state.currentClue.resolved),
    revealed: Boolean(state.currentClue.revealed)
  };
}

function serializeState({ includeTransient = false } = {}) {
  const totalTeams = state.teams.length;
  return {
    version: 1,
    teams: state.teams.map((team) => ({ name: team.name, score: team.score })),
    activeTeam: state.activeTeam,
    usedClues: [...state.usedClues],
    seenCategoryPrompts: [...state.seenCategoryPrompts],
    challengeEnabled: state.challengeEnabled,
    challengeClueId: state.challengeClueId,
    presenterMode: state.presenterMode,
    actionHistory: state.actionHistory.slice(0, 5),
    finalWagers: Array.from({ length: totalTeams }, (_, index) => Number(state.finalWagers[index]) || 0),
    finalResponseRevealed: state.finalResponseRevealed,
    finalScoredTeams: [...state.finalScoredTeams],
    finalComplete: state.finalComplete,
    currentClue: includeTransient ? serializeCurrentClue() : null,
    openDialog: includeTransient ? getOpenDialogName() : null
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
  state.currentClue = {
    id: savedClue.id,
    category: clueInfo.category,
    clue: clueInfo.clue,
    isChallenge: Boolean(savedClue.isChallenge),
    scoredTeams: new Set(savedClue.scoredTeams || []),
    noScore: Boolean(savedClue.noScore),
    stealOpen: Boolean(savedClue.stealOpen),
    resolved: Boolean(savedClue.resolved),
    revealed: Boolean(savedClue.revealed)
  };
}

function restoreState(snapshot, { reopenDialogs = false } = {}) {
  if (!snapshot) return false;
  state.teams = Array.isArray(snapshot.teams) && snapshot.teams.length
    ? snapshot.teams.map((team, index) => ({
      name: team.name || `Team ${index + 1}`,
      score: Number(team.score) || 0
    }))
    : state.teams;
  state.activeTeam = Math.min(Math.max(0, Number(snapshot.activeTeam) || 0), state.teams.length - 1);
  state.usedClues = new Set(snapshot.usedClues || []);
  state.seenCategoryPrompts = new Set(snapshot.seenCategoryPrompts || []);
  state.challengeEnabled = snapshot.challengeEnabled !== false;
  state.challengeClueId = snapshot.challengeClueId || null;
  state.presenterMode = Boolean(snapshot.presenterMode);
  state.actionHistory = Array.isArray(snapshot.actionHistory) ? snapshot.actionHistory.slice(0, 5) : [];
  state.finalWagers = Array.isArray(snapshot.finalWagers) ? snapshot.finalWagers.slice(0, state.teams.length) : [];
  state.finalResponseRevealed = Boolean(snapshot.finalResponseRevealed);
  state.finalScoredTeams = new Set(snapshot.finalScoredTeams || []);
  state.finalComplete = Boolean(snapshot.finalComplete);
  restoreCurrentClue(snapshot.currentClue);
  renderState();
  if (reopenDialogs) {
    restoreOpenDialog(snapshot.openDialog);
  }
  return true;
}

function saveState() {
  try {
    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(serializeState()));
  } catch (error) {
    // Local persistence is helpful but not required for the live game to run.
  }
}

function loadState() {
  try {
    const rawState = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!rawState) return false;
    const savedState = JSON.parse(rawState);
    if (savedState?.version !== 1) return false;
    return restoreState(savedState);
  } catch (error) {
    return false;
  }
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
  if (
    returnFocusElement instanceof HTMLElement &&
    document.contains(returnFocusElement) &&
    !returnFocusElement.disabled
  ) {
    returnFocusElement.focus();
  }
  dialogReturnFocus.delete(dialog);
}

function showDialog(dialog, returnFocusElement = document.activeElement) {
  rememberDialogFocus(dialog, returnFocusElement);
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
  restoreDialogFocus(dialog);
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
  if (dialogName === "end") {
    renderEndScreen();
    showDialog(endDialog);
  }
}

function renderState() {
  stopTimer();
  updateFinalButton();
  applyPresenterMode();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  renderHostNotes();
  updateUndoButton();
  updateBoardStatus();
  if (isDialogOpen(finalDialog)) {
    renderFinalStage();
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
  strip.innerHTML = chips
    .map((chip) => `
      <article class="glossary-chip" title="${chip.title}">
        <span>${chip.label}</span>
        <p>${chip.text}</p>
      </article>
    `)
    .join("");
}

function updateBoardStatus(message) {
  let statusText;
  if (message) {
    statusText = message;
  } else if (state.finalComplete) {
    statusText = "Final Jeopardy complete. Show results when ready.";
  } else if (state.usedClues.size === getTotalClues()) {
    statusText = "Board complete. Open Final Jeopardy.";
  } else {
    statusText = `${state.teams[state.activeTeam].name} is choosing.`;
  }
  if (boardStatus) {
    boardStatus.textContent = statusText;
  }
  updateFinalButton();
}

function updateProgress() {
  const totalClues = getTotalClues();
  const progressRatio = totalClues ? state.usedClues.size / totalClues : 0;
  const stage = getCurrentJourneyStage(progressRatio);
  progressStatus.textContent = `${state.usedClues.size}/${totalClues}`;
  progressStatus.style.setProperty("--progress-percent", `${Math.round(progressRatio * 100)}%`);
  progressStatus.setAttribute(
    "aria-label",
    `${state.usedClues.size} of ${totalClues} clues played. Current journey stage: ${stage}.`
  );
}

function updateFinalButton() {
  finalButton.textContent = state.finalComplete ? "Show Results" : "Final Jeopardy";
  endButton.classList.toggle("results-ready", state.finalComplete);
  endButton.textContent = state.finalComplete ? "Results" : "Show Winner";
}

function updateUndoButton() {
  undoButton.disabled = !state.undoSnapshot;
  undoButton.title = state.undoSnapshot ? `Undo ${state.undoSnapshot.label}` : "Nothing to undo";
}

function captureUndo(label) {
  state.undoSnapshot = {
    label,
    snapshot: serializeState({ includeTransient: true })
  };
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
  renderRecentPlays();
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

function applyPresenterMode() {
  document.body.classList.toggle("presenter-mode", state.presenterMode);
  if (presenterToggle) {
    presenterToggle.checked = state.presenterMode;
  }
}

function setPresenterMode(enabled) {
  state.presenterMode = Boolean(enabled);
  applyPresenterMode();
  saveState();
}

function getCurrentJourneyStage(progressRatio) {
  const stages = gameData.progressStages;
  const activeStage = Math.min(stages.length - 1, Math.floor(progressRatio * stages.length));
  return stages[activeStage];
}

function eligibleChallengeClueIds() {
  const ids = [];
  gameData.categories.forEach((category, categoryIndex) => {
    category.clues.forEach((clue, clueIndex) => {
      const id = clueId(categoryIndex, clueIndex);
      if (clue.value >= 300 && !state.usedClues.has(id)) {
        ids.push(id);
      }
    });
  });
  return ids;
}

function seedChallengeClue() {
  if (!state.challengeEnabled) {
    state.challengeClueId = null;
    return;
  }
  const eligibleIds = eligibleChallengeClueIds();
  state.challengeClueId = eligibleIds.length
    ? eligibleIds[Math.floor(Math.random() * eligibleIds.length)]
    : null;
}

function isChallengeClue(id) {
  return Boolean(state.challengeEnabled && state.challengeClueId && state.challengeClueId === id);
}

function currentClueScoreValue() {
  if (!state.currentClue) return 0;
  return state.currentClue.clue.value * (state.currentClue.isChallenge ? 2 : 1);
}

function setChallengeEnabled(enabled) {
  state.challengeEnabled = enabled;
  challengeToggle.checked = enabled;
  seedChallengeClue();
  saveState();
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
  soundButton.setAttribute("aria-label", state.soundMuted ? "Unmute sounds" : "Mute sounds");
  soundButton.setAttribute("title", state.soundMuted ? "Unmute sounds" : "Mute sounds");
}

function getAudioContext() {
  if (state.soundMuted) return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!state.audioContext) {
    state.audioContext = new AudioContextClass();
  }
  if (state.audioContext.state === "suspended") {
    state.audioContext.resume().catch(() => {});
  }
  return state.audioContext;
}

function tone(frequency, start, duration, volume, type = "sine") {
  const audio = getAudioContext();
  if (!audio) return;
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

function playSound(kind) {
  const audio = getAudioContext();
  if (!audio) return;
  const now = audio.currentTime;
  const sounds = {
    tile: () => tone(180, now, 0.055, 0.035, "triangle"),
    reveal: () => {
      tone(420, now, 0.08, 0.03, "sine");
      tone(660, now + 0.07, 0.11, 0.026, "sine");
    },
    correct: () => {
      tone(523.25, now, 0.09, 0.036, "sine");
      tone(783.99, now + 0.09, 0.14, 0.034, "sine");
    },
    incorrect: () => {
      tone(164.81, now, 0.13, 0.032, "sawtooth");
      tone(123.47, now + 0.09, 0.17, 0.026, "sawtooth");
    }
  };
  sounds[kind]?.();
}

function toggleSound() {
  state.soundMuted = !state.soundMuted;
  saveSoundPreference();
  updateSoundButton();
  if (!state.soundMuted) {
    playSound("reveal");
  }
}

function renderScoreboard() {
  scoreboard.innerHTML = "";
  state.teams.forEach((team, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `team-card${index === state.activeTeam ? " active" : ""}`;
    card.setAttribute("aria-pressed", index === state.activeTeam ? "true" : "false");
    card.innerHTML = `
      <span>${team.name}</span>
      <strong>${formatScore(team.score)}</strong>
    `;
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
  modalTeamSelect.innerHTML = state.teams
    .map((team, index) => `<option value="${index}">${team.name}</option>`)
    .join("");
  modalTeamSelect.value = String(state.activeTeam);
}

function renderBoard() {
  gameBoard.innerHTML = "";
  gameBoard.style.setProperty("--category-count", gameData.categories.length);

  gameData.categories.forEach((category) => {
    const heading = document.createElement("div");
    heading.className = "category-heading";
    heading.textContent = category.shortName;
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
      tile.disabled = state.usedClues.has(id);
      tile.setAttribute("aria-label", `${category.name} for ${clue.value} points`);
      tile.addEventListener("click", () => openClue(categoryIndex, clueIndex));
      gameBoard.appendChild(tile);
    });
  }
  updateProgress();
}

function renderSetupFields() {
  teamFields.innerHTML = "";
  state.teams.forEach((team, index) => {
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
}

function openSetup() {
  renderSetupFields();
  showDialog(setupDialog);
}

function saveTeams() {
  const inputs = Array.from(teamFields.querySelectorAll("input"));
  state.teams = inputs.map((input, index) => ({
    name: input.value.trim() || `Team ${index + 1}`,
    score: state.teams[index]?.score || 0
  }));
  state.activeTeam = Math.min(state.activeTeam, state.teams.length - 1);
  state.finalWagers = state.finalWagers.slice(0, state.teams.length);
  renderScoreboard();
  renderTeamSelect();
  updateBoardStatus();
  saveState();
  closeDialog(setupDialog);
}

function renderCurrentClueView() {
  if (!state.currentClue) return;
  const { category, clue, isChallenge } = state.currentClue;
  clueMeta.textContent = `${category.name} - ${isChallenge ? clue.value * 2 : clue.value} Points`;
  clueStage.textContent = state.currentClue.revealed ? "Response Revealed" : "Clue";
  categoryPrompt.hidden = true;
  renderClueStinger(category, isChallenge, false);
  clueText.textContent = clue.clue;
  responseText.textContent = clue.response;
  whyText.textContent = clue.why;
  teachingTag.textContent = clue.tag;
  renderGlossary(glossaryStrip, clue);
  bridgeText.textContent = clue.bridge;
  riskSignal.textContent = clue.riskCard.signal;
  riskConcern.textContent = clue.riskCard.risk;
  riskAction.textContent = clue.riskCard.action;
  responseBlock.hidden = !state.currentClue.revealed;
  resetTimerDisplay();
  revealButton.disabled = state.currentClue.revealed;
  renderTeamSelect();
  updateScoreButtons();
}

function openClue(categoryIndex, itemIndex) {
  playSound("tile");
  stopTimer();
  const category = gameData.categories[categoryIndex];
  const clue = category.clues[itemIndex];
  const id = clueId(categoryIndex, itemIndex);
  const isChallenge = isChallengeClue(id);
  state.currentClue = {
    id,
    category,
    clue,
    isChallenge,
    scoredTeams: new Set(),
    noScore: false,
    stealOpen: false,
    resolved: false,
    revealed: false
  };

  const showCategoryPrompt = !state.seenCategoryPrompts.has(category.id);
  state.seenCategoryPrompts.add(category.id);
  renderCurrentClueView();
  renderClueStinger(category, isChallenge, showCategoryPrompt);
  correctButton.disabled = true;
  incorrectButton.disabled = true;
  noScoreButton.disabled = true;
  hostNote.textContent = `${state.teams[state.activeTeam].name} has about 30 seconds. The host may allow one steal after a miss.`;
  saveState();
  showDialog(clueDialog);
}

function revealClue() {
  playSound("reveal");
  stopTimer();
  responseBlock.hidden = false;
  state.currentClue.revealed = true;
  clueStage.textContent = "Response Revealed";
  revealButton.disabled = true;
  updateScoreButtons();
  correctButton.focus();
}

function markCurrentUsed() {
  if (!state.currentClue) return;
  state.usedClues.add(state.currentClue.id);
  if (state.currentClue.id === state.challengeClueId) {
    state.challengeClueId = null;
  }
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

function applyScore(multiplier) {
  if (!state.currentClue) return;
  const teamIndex = Number(modalTeamSelect.value);
  if (
    state.currentClue.noScore ||
    state.currentClue.resolved ||
    state.currentClue.scoredTeams.has(teamIndex)
  ) return;
  playSound(multiplier > 0 ? "correct" : "incorrect");
  const team = state.teams[teamIndex];
  const value = currentClueScoreValue();
  const delta = value * multiplier;
  captureUndo(`${team.name} ${formatDelta(delta)}`);
  team.score += value * multiplier;
  state.currentClue.scoredTeams.add(teamIndex);
  state.activeTeam = teamIndex;
  markCurrentUsed();
  if (multiplier > 0) {
    state.currentClue.resolved = true;
  } else if (state.currentClue.stealOpen || state.currentClue.scoredTeams.size >= state.teams.length) {
    state.currentClue.resolved = true;
  } else {
    state.currentClue.stealOpen = true;
  }
  renderScoreboard();
  animateScore(teamIndex, multiplier);
  renderTeamSelect();
  updateScoreButtons();
  updateBoardStatus();
  if (multiplier > 0) {
    hostNote.textContent = `${team.name} earned ${value} points. This clue is closed.`;
  } else if (state.currentClue.resolved) {
    hostNote.textContent = `${team.name} lost ${value} points. The steal attempt is complete and this clue is closed.`;
  } else {
    hostNote.textContent = `${team.name} lost ${value} points. Steal available: choose another team, or use No Score to close the clue.`;
  }
  recordHistory({
    title: `${state.currentClue.category.name} ${state.currentClue.clue.value}`,
    detail: `${team.name} ${formatDelta(delta)}`,
    delta,
    type: multiplier > 0 ? "positive" : "negative"
  });
  showToast(`${team.name} ${formatDelta(delta)}`, multiplier > 0 ? "positive" : "negative");
  saveState();
}

function noScore() {
  if (!state.currentClue) return;
  const label = `${state.currentClue.category.name} ${state.currentClue.clue.value} closed`;
  captureUndo(label);
  state.currentClue.noScore = true;
  state.currentClue.resolved = true;
  markCurrentUsed();
  updateScoreButtons();
  updateBoardStatus();
  hostNote.textContent = state.currentClue.scoredTeams.size
    ? "Clue closed with no steal score."
    : "Clue marked used with no score change.";
  recordHistory({
    title: `${state.currentClue.category.name} ${state.currentClue.clue.value}`,
    detail: "Closed with no score",
    type: "neutral"
  });
  showToast(label, "neutral");
  saveState();
}

function updateScoreButtons() {
  const revealed = revealButton.disabled;
  const selectedTeam = Number(modalTeamSelect.value);
  const alreadyScored = state.currentClue?.scoredTeams.has(selectedTeam);
  const noScoreApplied = Boolean(state.currentClue?.noScore);
  const resolved = Boolean(state.currentClue?.resolved);
  const stealPending = Boolean(state.currentClue?.stealOpen && !resolved);
  const scoreValue = currentClueScoreValue();
  correctButton.textContent = scoreValue ? `Correct +${scoreValue}` : "Correct +";
  incorrectButton.textContent = scoreValue ? `Incorrect -${scoreValue}` : "Incorrect -";
  correctButton.disabled = !revealed || alreadyScored || noScoreApplied || resolved;
  incorrectButton.disabled = !revealed || alreadyScored || noScoreApplied || resolved;
  noScoreButton.disabled = !revealed || noScoreApplied || resolved;
  noScoreButton.textContent = stealPending ? "Close Clue" : "No Score";
  backButton.disabled = stealPending;
  closeClueButton.disabled = stealPending;
  backButton.classList.toggle("primary-next", resolved && !stealPending);
}

function resetGame() {
  const confirmed = window.confirm("Reset scores, used tiles, and Final Jeopardy state?");
  if (!confirmed) return;
  state.teams = state.teams.map((team) => ({ ...team, score: 0 }));
  state.activeTeam = 0;
  state.usedClues.clear();
  state.currentClue = null;
  state.seenCategoryPrompts.clear();
  state.challengeEnabled = true;
  challengeToggle.checked = true;
  seedChallengeClue();
  state.actionHistory = [];
  state.undoSnapshot = null;
  state.finalWagers = [];
  state.finalResponseRevealed = false;
  state.finalScoredTeams.clear();
  state.finalComplete = false;
  updateFinalButton();
  stopTimer();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  renderHostNotes();
  updateUndoButton();
  updateBoardStatus("Game reset. Choose a team, then choose a clue.");
  clearSavedState();
  closeGameDialogs();
  showToast("Game reset", "neutral");
}

function nextTeam() {
  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  renderScoreboard();
  renderTeamSelect();
  updateBoardStatus();
  saveState();
}

function openFinal() {
  stopTimer();
  if (state.finalComplete) {
    renderEndScreen();
    showDialog(endDialog, finalButton);
    return;
  }
  finalCategory.textContent = gameData.finalJeopardy.category;
  finalClue.textContent = gameData.finalJeopardy.clue;
  finalResponse.textContent = gameData.finalJeopardy.response;
  finalWhy.textContent = gameData.finalJeopardy.why;
  renderGlossary(finalGlossaryStrip, gameData.finalJeopardy);
  finalBridge.textContent = gameData.finalJeopardy.bridge;
  finalRiskSignal.textContent = gameData.finalJeopardy.riskCard.signal;
  finalRiskConcern.textContent = gameData.finalJeopardy.riskCard.risk;
  finalRiskAction.textContent = gameData.finalJeopardy.riskCard.action;
  finalResponseBlock.hidden = !state.finalResponseRevealed;
  revealFinalButton.disabled = state.finalResponseRevealed;
  renderWagers();
  renderFinalStage();
  showDialog(finalDialog);
}

function renderWagers() {
  wagerGrid.innerHTML = "";
  state.teams.forEach((team, index) => {
    const card = document.createElement("article");
    const maxWager = Math.max(0, team.score);
    const isScored = state.finalScoredTeams.has(index);
    const wager = Math.min(maxWager, Math.max(0, Number(state.finalWagers[index]) || 0));
    state.finalWagers[index] = wager;
    card.className = `wager-card${isScored ? " scored" : ""}`;
    card.innerHTML = `
      <label>
        <span>${team.name}</span>
        <input type="number" min="0" max="${maxWager}" step="100" value="${wager}" data-wager-index="${index}" aria-label="${team.name} wager" ${isScored ? "disabled" : ""}>
      </label>
      <p class="wager-limit">Max wager: ${formatScore(maxWager)}</p>
      <div class="wager-actions">
        <button class="score-button positive" type="button" data-final-result="correct" data-team-index="${index}" ${state.finalResponseRevealed && !isScored ? "" : "disabled"}>Correct</button>
        <button class="score-button negative" type="button" data-final-result="incorrect" data-team-index="${index}" ${state.finalResponseRevealed && !isScored ? "" : "disabled"}>Incorrect</button>
      </div>
    `;
    wagerGrid.appendChild(card);
  });
}

function renderFinalStage() {
  if (!finalSteps) return;
  let activeStep = "wagers";
  const scoredCount = state.finalScoredTeams.size;
  if (state.finalComplete) {
    activeStep = "results";
  } else if (scoredCount > 0) {
    activeStep = "score";
  } else if (state.finalResponseRevealed) {
    activeStep = "response";
  }
  const order = ["wagers", "prompt", "response", "score", "results"];
  const activeIndex = order.indexOf(activeStep);
  finalSteps.querySelectorAll("li").forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.finalStep);
    step.classList.toggle("active", step.dataset.finalStep === activeStep);
    step.classList.toggle("complete", stepIndex > -1 && stepIndex < activeIndex);
  });
}

function revealFinal() {
  playSound("reveal");
  finalResponseBlock.hidden = false;
  state.finalResponseRevealed = true;
  revealFinalButton.disabled = true;
  wagerGrid.querySelectorAll("button").forEach((button) => {
    button.disabled = state.finalScoredTeams.has(Number(button.dataset.teamIndex));
  });
  renderFinalStage();
  saveState();
  wagerGrid.querySelector("button:not(:disabled)")?.focus();
}

function applyFinalScore(button) {
  const teamIndex = Number(button.dataset.teamIndex);
  if (state.finalScoredTeams.has(teamIndex) || state.finalComplete) return;
  const result = button.dataset.finalResult;
  const input = wagerGrid.querySelector(`[data-wager-index="${teamIndex}"]`);
  const maxWager = Math.max(0, state.teams[teamIndex].score);
  const wager = Math.min(maxWager, Math.max(0, Number(input.value) || 0));
  input.value = String(wager);
  state.finalWagers[teamIndex] = wager;
  const multiplier = result === "correct" ? 1 : -1;
  const delta = wager * multiplier;
  captureUndo(`${state.teams[teamIndex].name} Final ${formatDelta(delta)}`);
  playSound(multiplier > 0 ? "correct" : "incorrect");
  state.teams[teamIndex].score += wager * multiplier;
  state.finalScoredTeams.add(teamIndex);
  const card = button.closest(".wager-card");
  card.classList.add("scored");
  card.querySelector("input").disabled = true;
  button.closest(".wager-actions").querySelectorAll("button").forEach((item) => {
    item.disabled = true;
  });
  renderScoreboard();
  animateScore(teamIndex, multiplier);
  updateBoardStatus();
  renderFinalStage();
  recordHistory({
    title: "Final Jeopardy",
    detail: `${state.teams[teamIndex].name} ${formatDelta(delta)}`,
    delta,
    type: multiplier > 0 ? "positive" : "negative"
  });
  showToast(`${state.teams[teamIndex].name} ${formatDelta(delta)}`, multiplier > 0 ? "positive" : "negative");
  if (state.finalScoredTeams.size === state.teams.length) {
    state.finalComplete = true;
    updateFinalButton();
    updateBoardStatus();
    renderFinalStage();
    renderEndScreen();
    closeDialog(finalDialog);
    window.setTimeout(() => showDialog(endDialog, finalButton), 0);
  }
  saveState();
}

function renderRules() {
  rulesThemeLens.textContent = gameData.themeLens;
  rulesList.innerHTML = gameData.rules.map((rule) => `<li>${rule}</li>`).join("");
}

function renderHostNotes() {
  presenterToggle.checked = state.presenterMode;
  challengeToggle.checked = state.challengeEnabled;
  challengeToggleLabel.textContent = gameData.challengeClue.label;
  challengeToggleDescription.textContent = gameData.challengeClue.description;
  hostScriptList.innerHTML = gameData.hostNotes
    .map((note) => `
      <article class="host-note-card">
        <span>${note.title}</span>
        <p>${note.text}</p>
      </article>
    `)
    .join("");
  const hostShortcuts = [
    ...gameData.shortcuts,
    { key: "U", action: "Undo last action" },
    { key: "P", action: "Presenter mode" }
  ];
  shortcutList.innerHTML = hostShortcuts
    .map((shortcut) => `
      <article>
        <kbd>${shortcut.key}</kbd>
        <span>${shortcut.action}</span>
      </article>
    `)
    .join("");
  renderRecentPlays();
}

function renderRecentPlays() {
  if (!recentPlayList) return;
  if (!state.actionHistory.length) {
    recentPlayList.innerHTML = "<p>No plays yet.</p>";
    return;
  }
  recentPlayList.innerHTML = state.actionHistory
    .map((entry) => `
      <article class="${entry.type || "neutral"}">
        <span>${entry.title}</span>
        <p>${entry.detail}</p>
      </article>
    `)
    .join("");
}

function renderClueStinger(category, isChallenge, showCategoryPrompt) {
  clueStinger.hidden = !(isChallenge || showCategoryPrompt);
  clueStinger.classList.toggle("challenge", isChallenge);
  if (clueStinger.hidden) return;

  stingerEyebrow.textContent = isChallenge ? gameData.challengeClue.label : "Category Lens";
  stingerTitle.textContent = category.name;
  stingerText.textContent = isChallenge
    ? `${category.accent} This clue is worth double.`
    : category.accent;
}

function resetTimerDisplay() {
  state.secondsLeft = 30;
  timerDisplay.textContent = ":30";
  timerDisplay.classList.remove("warning", "done");
  timerButton.textContent = "Start 30s";
}

function stopTimer() {
  if (state.timer) {
    window.clearInterval(state.timer);
    state.timer = null;
  }
  timerButton.textContent = "Start 30s";
}

function startTimer() {
  if (state.timer) {
    stopTimer();
    return;
  }
  state.secondsLeft = 30;
  timerDisplay.textContent = ":30";
  timerDisplay.classList.remove("warning", "done");
  timerButton.textContent = "Stop Timer";
  state.timer = window.setInterval(() => {
    state.secondsLeft -= 1;
    timerDisplay.textContent = `:${String(Math.max(0, state.secondsLeft)).padStart(2, "0")}`;
    timerDisplay.classList.toggle("warning", state.secondsLeft <= 10 && state.secondsLeft > 0);
    if (state.secondsLeft <= 0) {
      stopTimer();
      timerDisplay.classList.add("done");
      timerDisplay.textContent = "Time";
      hostNote.textContent = "Time. The host may reveal, score, or offer a steal.";
    }
  }, 1000);
}

function renderWinnerCelebration() {
  winnerCelebration.innerHTML = "";
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

  winnerCelebration.innerHTML = particles
    .map((particle) => `
      <span
        class="winner-confetti ${particle.shape}"
        style="--x: ${particle.x}; --dx: ${particle.dx}px; --delay: ${particle.delay}s; --duration: ${particle.duration}s; --rotate: ${particle.rotate}deg; --confetti-color: ${particle.color};"
      ></span>
    `)
    .join("");
}

function renderEndScreen() {
  const ranked = [...state.teams].sort((a, b) => b.score - a.score);
  const highScore = ranked[0]?.score ?? 0;
  const winners = ranked.filter((team) => team.score === highScore).map((team) => team.name);
  renderWinnerCelebration();
  winnerTitle.textContent = winners.length > 1 ? `Winners: ${winners.join(" + ")}` : `Winner: ${winners[0]}`;
  closeoutText.textContent = gameData.closeout;
  finalScoreList.innerHTML = ranked
    .map((team, index) => `<div style="--score-index: ${index};"><span>${team.name}</span><strong>${formatScore(team.score)}</strong></div>`)
    .join("");
  pledgeCard.innerHTML = `
    <span>${gameData.pledge.title}</span>
    <p>${gameData.pledge.text}</p>
  `;
  debriefTakeaways.innerHTML = gameData.debriefTakeaways
    .map((takeaway) => `
      <article>
        <span>${takeaway.title}</span>
        <p>${takeaway.text}</p>
      </article>
    `)
    .join("");
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

function clickIfAvailable(button) {
  if (!button || button.disabled) return false;
  button.click();
  return true;
}

function handleKeyboardShortcuts(event) {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    isTypingTarget(event.target)
  ) return;

  const key = event.key.toLowerCase();
  if (key === "u") {
    event.preventDefault();
    undoLastAction();
    return;
  }

  if (key === "p") {
    event.preventDefault();
    setPresenterMode(!state.presenterMode);
    return;
  }

  if (key === "r") {
    if (isDialogOpen(clueDialog)) {
      event.preventDefault();
      clickIfAvailable(revealButton);
    } else if (isDialogOpen(finalDialog)) {
      event.preventDefault();
      clickIfAvailable(revealFinalButton);
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

  if (
    key === "n" &&
    !isDialogOpen(setupDialog) &&
    !isDialogOpen(clueDialog) &&
    !isDialogOpen(finalDialog) &&
    !isDialogOpen(rulesDialog) &&
    !isDialogOpen(hostNotesDialog) &&
    !isDialogOpen(endDialog)
  ) {
    event.preventDefault();
    nextTeam();
  }
}

function bindEvents() {
  soundButton.addEventListener("click", toggleSound);
  document.getElementById("setupButton").addEventListener("click", openSetup);
  document.getElementById("rulesButton").addEventListener("click", (event) => showDialog(rulesDialog, event.currentTarget));
  document.getElementById("closeRulesButton").addEventListener("click", () => closeDialog(rulesDialog));
  document.getElementById("hostNotesButton").addEventListener("click", (event) => showDialog(hostNotesDialog, event.currentTarget));
  document.getElementById("closeHostNotesIcon").addEventListener("click", () => closeDialog(hostNotesDialog));
  undoButton.addEventListener("click", undoLastAction);
  presenterToggle.addEventListener("change", () => setPresenterMode(presenterToggle.checked));
  challengeToggle.addEventListener("change", () => setChallengeEnabled(challengeToggle.checked));
  document.getElementById("resetButton").addEventListener("click", resetGame);
  document.getElementById("nextTeamButton").addEventListener("click", nextTeam);
  finalButton.addEventListener("click", openFinal);
  endButton.addEventListener("click", (event) => {
    if (!state.finalComplete && !window.confirm("Final Jeopardy is not complete. Show current scores anyway?")) {
      return;
    }
    renderEndScreen();
    showDialog(endDialog, event.currentTarget);
  });
  closeClueButton.addEventListener("click", () => closeDialog(clueDialog));
  backButton.addEventListener("click", () => closeDialog(clueDialog));
  clueDialog.addEventListener("cancel", (event) => {
    if (state.currentClue?.stealOpen && !state.currentClue.resolved) {
      event.preventDefault();
    }
  });
  document.getElementById("closeFinalButton").addEventListener("click", () => closeDialog(finalDialog));
  document.getElementById("finalBackButton").addEventListener("click", () => closeDialog(finalDialog));
  document.getElementById("closeEndButton").addEventListener("click", () => closeDialog(endDialog));
  [setupDialog, clueDialog, finalDialog, hostNotesDialog, rulesDialog, endDialog].forEach((dialog) => {
    dialog.addEventListener("close", () => restoreDialogFocus(dialog));
  });
  document.getElementById("addTeamButton").addEventListener("click", () => {
    if (state.teams.length >= 5) return;
    state.teams.push({ name: `Team ${state.teams.length + 1}`, score: 0 });
    renderSetupFields();
  });
  document.getElementById("removeTeamButton").addEventListener("click", () => {
    if (state.teams.length <= 2) return;
    state.teams.pop();
    state.activeTeam = Math.min(state.activeTeam, state.teams.length - 1);
    renderSetupFields();
  });
  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveTeams();
  });
  modalTeamSelect.addEventListener("change", () => {
    state.activeTeam = Number(modalTeamSelect.value);
    renderScoreboard();
    updateBoardStatus();
    updateScoreButtons();
    saveState();
  });
  revealButton.addEventListener("click", revealClue);
  timerButton.addEventListener("click", startTimer);
  correctButton.addEventListener("click", () => applyScore(1));
  incorrectButton.addEventListener("click", () => applyScore(-1));
  noScoreButton.addEventListener("click", noScore);
  revealFinalButton.addEventListener("click", revealFinal);
  wagerGrid.addEventListener("input", (event) => {
    const input = event.target.closest("input[data-wager-index]");
    if (!input) return;
    const teamIndex = Number(input.dataset.wagerIndex);
    const maxWager = Math.max(0, state.teams[teamIndex].score);
    const wager = Math.min(maxWager, Math.max(0, Number(input.value) || 0));
    state.finalWagers[teamIndex] = wager;
    saveState();
  });
  wagerGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-final-result]");
    if (button) applyFinalScore(button);
  });
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

function init() {
  state.soundMuted = readSoundPreference();
  updateSoundButton();
  gameTitle.textContent = gameData.title;
  gameSubtitle.textContent = gameData.subtitle;
  gameTheme.textContent = gameData.theme;
  renderRules();
  const resumed = loadState();
  if (!resumed) {
    seedChallengeClue();
    renderScoreboard();
    renderTeamSelect();
    renderBoard();
    renderHostNotes();
    updateBoardStatus();
    updateUndoButton();
    applyPresenterMode();
  }
  bindEvents();
}

init();
