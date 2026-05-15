const gameData = window.JeopardyData;

const state = {
  teams: [
    { name: "Team 1", score: 0 },
    { name: "Team 2", score: 0 },
    { name: "Team 3", score: 0 }
  ],
  activeTeam: 0,
  usedClues: new Set(),
  currentClue: null
};

const gameTitle = document.getElementById("gameTitle");
const gameSubtitle = document.getElementById("gameSubtitle");
const gameTheme = document.getElementById("gameTheme");
const scoreboard = document.getElementById("scoreboard");
const gameBoard = document.getElementById("gameBoard");
const boardStatus = document.getElementById("boardStatus");
const setupDialog = document.getElementById("setupDialog");
const setupForm = document.getElementById("setupForm");
const teamFields = document.getElementById("teamFields");
const clueDialog = document.getElementById("clueDialog");
const clueMeta = document.getElementById("clueMeta");
const clueStage = document.getElementById("clueStage");
const clueText = document.getElementById("clueText");
const responseBlock = document.getElementById("responseBlock");
const responseText = document.getElementById("responseText");
const whyText = document.getElementById("whyText");
const modalTeamSelect = document.getElementById("modalTeamSelect");
const revealButton = document.getElementById("revealButton");
const correctButton = document.getElementById("correctButton");
const incorrectButton = document.getElementById("incorrectButton");
const noScoreButton = document.getElementById("noScoreButton");
const hostNote = document.getElementById("hostNote");
const finalDialog = document.getElementById("finalDialog");
const finalCategory = document.getElementById("finalCategory");
const finalClue = document.getElementById("finalClue");
const finalResponseBlock = document.getElementById("finalResponseBlock");
const finalResponse = document.getElementById("finalResponse");
const finalWhy = document.getElementById("finalWhy");
const wagerGrid = document.getElementById("wagerGrid");
const revealFinalButton = document.getElementById("revealFinalButton");
const rulesDialog = document.getElementById("rulesDialog");
const rulesList = document.getElementById("rulesList");

function clueId(categoryIndex, clueIndex) {
  return `${categoryIndex}-${clueIndex}`;
}

function showDialog(dialog) {
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
}

function formatScore(score) {
  return score < 0 ? `-$${Math.abs(score)}` : `$${score}`;
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
      boardStatus.textContent = `${team.name} is choosing.`;
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
  closeDialog(setupDialog);
}

function openClue(categoryIndex, itemIndex) {
  const category = gameData.categories[categoryIndex];
  const clue = category.clues[itemIndex];
  state.currentClue = {
    id: clueId(categoryIndex, itemIndex),
    category,
    clue,
    scoredTeams: new Set(),
    noScore: false
  };

  clueMeta.textContent = `${category.name} - ${clue.value} Points`;
  clueStage.textContent = "Clue";
  clueText.textContent = clue.clue;
  responseText.textContent = clue.response;
  whyText.textContent = clue.why;
  responseBlock.hidden = true;
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
  responseBlock.hidden = false;
  clueStage.textContent = "Response Revealed";
  revealButton.disabled = true;
  updateScoreButtons();
}

function markCurrentUsed() {
  if (!state.currentClue) return;
  state.usedClues.add(state.currentClue.id);
  renderBoard();
}

function applyScore(multiplier) {
  if (!state.currentClue) return;
  const teamIndex = Number(modalTeamSelect.value);
  if (state.currentClue.noScore || state.currentClue.scoredTeams.has(teamIndex)) return;
  const team = state.teams[teamIndex];
  const value = state.currentClue.clue.value;
  team.score += value * multiplier;
  state.currentClue.scoredTeams.add(teamIndex);
  state.activeTeam = teamIndex;
  markCurrentUsed();
  renderScoreboard();
  renderTeamSelect();
  updateScoreButtons();
  hostNote.textContent = `${team.name} ${multiplier > 0 ? "earned" : "lost"} ${value} points. You can adjust another team for a steal, or return to the board.`;
}

function noScore() {
  if (!state.currentClue) return;
  state.currentClue.noScore = true;
  markCurrentUsed();
  updateScoreButtons();
  hostNote.textContent = "Clue marked used with no score change.";
}

function updateScoreButtons() {
  const revealed = revealButton.disabled;
  const selectedTeam = Number(modalTeamSelect.value);
  const alreadyScored = state.currentClue?.scoredTeams.has(selectedTeam);
  const noScoreApplied = Boolean(state.currentClue?.noScore);
  correctButton.disabled = !revealed || alreadyScored || noScoreApplied;
  incorrectButton.disabled = !revealed || alreadyScored || noScoreApplied;
  noScoreButton.disabled = !revealed || noScoreApplied || Boolean(state.currentClue?.scoredTeams.size);
}

function resetGame() {
  const confirmed = window.confirm("Reset scores and reopen every tile?");
  if (!confirmed) return;
  state.teams = state.teams.map((team) => ({ ...team, score: 0 }));
  state.activeTeam = 0;
  state.usedClues.clear();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  boardStatus.textContent = "Game reset. Choose a team, then choose a clue.";
}

function openFinal() {
  finalCategory.textContent = gameData.finalJeopardy.category;
  finalClue.textContent = gameData.finalJeopardy.clue;
  finalResponse.textContent = gameData.finalJeopardy.response;
  finalWhy.textContent = gameData.finalJeopardy.why;
  finalResponseBlock.hidden = true;
  revealFinalButton.disabled = false;
  renderWagers();
  showDialog(finalDialog);
}

function renderWagers() {
  wagerGrid.innerHTML = "";
  state.teams.forEach((team, index) => {
    const card = document.createElement("article");
    card.className = "wager-card";
    card.innerHTML = `
      <label>
        <span>${team.name}</span>
        <input type="number" min="0" step="100" value="0" data-wager-index="${index}" aria-label="${team.name} wager">
      </label>
      <div class="wager-actions">
        <button class="score-button positive" type="button" data-final-result="correct" data-team-index="${index}" disabled>Correct</button>
        <button class="score-button negative" type="button" data-final-result="incorrect" data-team-index="${index}" disabled>Incorrect</button>
      </div>
    `;
    wagerGrid.appendChild(card);
  });
}

function revealFinal() {
  finalResponseBlock.hidden = false;
  revealFinalButton.disabled = true;
  wagerGrid.querySelectorAll("button").forEach((button) => {
    button.disabled = false;
  });
}

function applyFinalScore(button) {
  const teamIndex = Number(button.dataset.teamIndex);
  const result = button.dataset.finalResult;
  const input = wagerGrid.querySelector(`[data-wager-index="${teamIndex}"]`);
  const wager = Math.max(0, Number(input.value) || 0);
  state.teams[teamIndex].score += result === "correct" ? wager : -wager;
  button.closest(".wager-card").classList.add("scored");
  button.closest(".wager-actions").querySelectorAll("button").forEach((item) => {
    item.disabled = true;
  });
  renderScoreboard();
}

function renderRules() {
  rulesList.innerHTML = gameData.rules.map((rule) => `<li>${rule}</li>`).join("");
}

function bindEvents() {
  document.getElementById("setupButton").addEventListener("click", openSetup);
  document.getElementById("rulesButton").addEventListener("click", () => showDialog(rulesDialog));
  document.getElementById("closeRulesButton").addEventListener("click", () => closeDialog(rulesDialog));
  document.getElementById("resetButton").addEventListener("click", resetGame);
  document.getElementById("finalButton").addEventListener("click", openFinal);
  document.getElementById("closeClueButton").addEventListener("click", () => closeDialog(clueDialog));
  document.getElementById("backButton").addEventListener("click", () => closeDialog(clueDialog));
  document.getElementById("closeFinalButton").addEventListener("click", () => closeDialog(finalDialog));
  document.getElementById("finalBackButton").addEventListener("click", () => closeDialog(finalDialog));
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
    updateScoreButtons();
  });
  revealButton.addEventListener("click", revealClue);
  correctButton.addEventListener("click", () => applyScore(1));
  incorrectButton.addEventListener("click", () => applyScore(-1));
  noScoreButton.addEventListener("click", noScore);
  revealFinalButton.addEventListener("click", revealFinal);
  wagerGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-final-result]");
    if (button) applyFinalScore(button);
  });
}

function init() {
  gameTitle.textContent = gameData.title;
  gameSubtitle.textContent = gameData.subtitle;
  gameTheme.textContent = gameData.theme;
  renderRules();
  renderScoreboard();
  renderTeamSelect();
  renderBoard();
  bindEvents();
}

init();
