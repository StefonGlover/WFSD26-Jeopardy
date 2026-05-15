const gameData = window.JeopardyData;
const SOUND_STORAGE_KEY = "jeopardy-sound-muted";
const dialogReturnFocus = new WeakMap();

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
const setupDialog = document.getElementById("setupDialog");
const setupForm = document.getElementById("setupForm");
const teamFields = document.getElementById("teamFields");
const clueDialog = document.getElementById("clueDialog");
const clueMeta = document.getElementById("clueMeta");
const clueStage = document.getElementById("clueStage");
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
const hostNotesDialog = document.getElementById("hostNotesDialog");
const hostScriptList = document.getElementById("hostScriptList");
const shortcutList = document.getElementById("shortcutList");
const rulesDialog = document.getElementById("rulesDialog");
const rulesList = document.getElementById("rulesList");
const rulesThemeLens = document.getElementById("rulesThemeLens");
const endDialog = document.getElementById("endDialog");
const winnerCelebration = document.getElementById("winnerCelebration");
const winnerTitle = document.getElementById("winnerTitle");
const closeoutText = document.getElementById("closeoutText");
const finalScoreList = document.getElementById("finalScoreList");
const debriefTakeaways = document.getElementById("debriefTakeaways");

function clueId(categoryIndex, clueIndex) {
  return `${categoryIndex}-${clueIndex}`;
}

function getTotalClues() {
  return gameData.categories.reduce((sum, category) => sum + category.clues.length, 0);
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

function formatScore(score) {
  return score < 0 ? `-$${Math.abs(score)}` : `$${score}`;
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
  if (message) {
    boardStatus.textContent = message;
  } else if (state.finalComplete) {
    boardStatus.textContent = "Final Jeopardy complete. Show results when ready.";
  } else if (state.usedClues.size === getTotalClues()) {
    boardStatus.textContent = "Board complete. Open Final Jeopardy.";
  } else {
    boardStatus.textContent = `${state.teams[state.activeTeam].name} is choosing.`;
  }
  updateFinalButton();
}

function updateProgress() {
  progressStatus.textContent = `${state.usedClues.size}/${getTotalClues()} clues played`;
}

function updateFinalButton() {
  finalButton.textContent = state.finalComplete ? "Show Results" : "Final Jeopardy";
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
  renderScoreboard();
  renderTeamSelect();
  updateBoardStatus();
  closeDialog(setupDialog);
}

function openClue(categoryIndex, itemIndex) {
  playSound("tile");
  stopTimer();
  const category = gameData.categories[categoryIndex];
  const clue = category.clues[itemIndex];
  state.currentClue = {
    id: clueId(categoryIndex, itemIndex),
    category,
    clue,
    scoredTeams: new Set(),
    noScore: false,
    stealOpen: false,
    resolved: false
  };

  clueMeta.textContent = `${category.name} - ${clue.value} Points`;
  clueStage.textContent = "Clue";
  const showCategoryPrompt = !state.seenCategoryPrompts.has(category.id);
  categoryPrompt.hidden = !showCategoryPrompt;
  categoryPrompt.textContent = showCategoryPrompt ? `Category lens: ${category.accent}` : "";
  state.seenCategoryPrompts.add(category.id);
  clueText.textContent = clue.clue;
  responseText.textContent = clue.response;
  whyText.textContent = clue.why;
  teachingTag.textContent = clue.tag;
  renderGlossary(glossaryStrip, clue);
  bridgeText.textContent = clue.bridge;
  riskSignal.textContent = clue.riskCard.signal;
  riskConcern.textContent = clue.riskCard.risk;
  riskAction.textContent = clue.riskCard.action;
  responseBlock.hidden = true;
  resetTimerDisplay();
  revealButton.disabled = false;
  correctButton.disabled = true;
  incorrectButton.disabled = true;
  noScoreButton.disabled = true;
  hostNote.textContent = `${state.teams[state.activeTeam].name} has about 30 seconds. The host may allow one steal after a miss.`;
  renderTeamSelect();
  updateScoreButtons();
  showDialog(clueDialog);
}

function revealClue() {
  playSound("reveal");
  stopTimer();
  responseBlock.hidden = false;
  clueStage.textContent = "Response Revealed";
  revealButton.disabled = true;
  updateScoreButtons();
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
  card.classList.remove("score-up", "score-down");
  void card.offsetWidth;
  card.classList.add(multiplier > 0 ? "score-up" : "score-down");
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
  const value = state.currentClue.clue.value;
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
}

function noScore() {
  if (!state.currentClue) return;
  state.currentClue.noScore = true;
  state.currentClue.resolved = true;
  markCurrentUsed();
  updateScoreButtons();
  updateBoardStatus();
  hostNote.textContent = state.currentClue.scoredTeams.size
    ? "Clue closed with no steal score."
    : "Clue marked used with no score change.";
}

function updateScoreButtons() {
  const revealed = revealButton.disabled;
  const selectedTeam = Number(modalTeamSelect.value);
  const alreadyScored = state.currentClue?.scoredTeams.has(selectedTeam);
  const noScoreApplied = Boolean(state.currentClue?.noScore);
  const resolved = Boolean(state.currentClue?.resolved);
  const stealPending = Boolean(state.currentClue?.stealOpen && !resolved);
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
  state.seenCategoryPrompts.clear();
  state.finalScoredTeams.clear();
  state.finalComplete = false;
  updateFinalButton();
  stopTimer();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  updateBoardStatus("Game reset. Choose a team, then choose a clue.");
}

function nextTeam() {
  state.activeTeam = (state.activeTeam + 1) % state.teams.length;
  renderScoreboard();
  renderTeamSelect();
  updateBoardStatus();
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
  finalResponseBlock.hidden = true;
  revealFinalButton.disabled = false;
  renderWagers();
  showDialog(finalDialog);
}

function renderWagers() {
  wagerGrid.innerHTML = "";
  state.teams.forEach((team, index) => {
    const card = document.createElement("article");
    const maxWager = Math.max(0, team.score);
    const isScored = state.finalScoredTeams.has(index);
    card.className = `wager-card${isScored ? " scored" : ""}`;
    card.innerHTML = `
      <label>
        <span>${team.name}</span>
        <input type="number" min="0" max="${maxWager}" step="100" value="0" data-wager-index="${index}" aria-label="${team.name} wager" ${isScored ? "disabled" : ""}>
      </label>
      <p class="wager-limit">Max wager: ${formatScore(maxWager)}</p>
      <div class="wager-actions">
        <button class="score-button positive" type="button" data-final-result="correct" data-team-index="${index}" disabled>Correct</button>
        <button class="score-button negative" type="button" data-final-result="incorrect" data-team-index="${index}" disabled>Incorrect</button>
      </div>
    `;
    wagerGrid.appendChild(card);
  });
}

function revealFinal() {
  playSound("reveal");
  finalResponseBlock.hidden = false;
  revealFinalButton.disabled = true;
  wagerGrid.querySelectorAll("button").forEach((button) => {
    button.disabled = state.finalScoredTeams.has(Number(button.dataset.teamIndex));
  });
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
  const multiplier = result === "correct" ? 1 : -1;
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
  if (state.finalScoredTeams.size === state.teams.length) {
    state.finalComplete = true;
    updateFinalButton();
    updateBoardStatus();
    renderEndScreen();
    closeDialog(finalDialog);
    window.setTimeout(() => showDialog(endDialog, finalButton), 0);
  }
}

function renderRules() {
  rulesThemeLens.textContent = gameData.themeLens;
  rulesList.innerHTML = gameData.rules.map((rule) => `<li>${rule}</li>`).join("");
}

function renderHostNotes() {
  hostScriptList.innerHTML = gameData.hostNotes
    .map((note) => `
      <article class="host-note-card">
        <span>${note.title}</span>
        <p>${note.text}</p>
      </article>
    `)
    .join("");
  shortcutList.innerHTML = gameData.shortcuts
    .map((shortcut) => `
      <article>
        <kbd>${shortcut.key}</kbd>
        <span>${shortcut.action}</span>
      </article>
    `)
    .join("");
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
  document.getElementById("resetButton").addEventListener("click", resetGame);
  document.getElementById("nextTeamButton").addEventListener("click", nextTeam);
  finalButton.addEventListener("click", openFinal);
  document.getElementById("endButton").addEventListener("click", (event) => {
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
  });
  revealButton.addEventListener("click", revealClue);
  timerButton.addEventListener("click", startTimer);
  correctButton.addEventListener("click", () => applyScore(1));
  incorrectButton.addEventListener("click", () => applyScore(-1));
  noScoreButton.addEventListener("click", noScore);
  revealFinalButton.addEventListener("click", revealFinal);
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
  renderHostNotes();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  updateBoardStatus();
  bindEvents();
}

init();
