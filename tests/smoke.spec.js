import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const GAME_STATE_STORAGE_KEY = "wfsd-jeopardy-game-state-v1";
const DATA_SCRIPT = readFileSync(new URL("../jeopardy-data.js", import.meta.url), "utf8");
const TARGET_VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1075, height: 908 },
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 }
];

async function expectNoPageOverflow(page) {
  const overflow = await page.evaluate(() => ({
    x: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    y: document.documentElement.scrollHeight - Math.max(document.documentElement.clientHeight, window.innerHeight)
  }));
  expect(overflow.x).toBeLessThanOrEqual(1);
}

async function expectVisibleInViewport(page, locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

function scoreSheetSnapshotState() {
  return {
    version: 1,
    teams: [
      { name: "QA", score: 150 },
      { name: "Supply", score: -50 },
      { name: "Ops", score: 0 }
    ],
    activeTeam: 0,
    usedClues: ["0-0", "1-2", "2-3", "4-4"],
    seenCategoryPrompts: [],
    actionHistory: [],
    finalWagers: [50, 0, 0],
    finalWagersLocked: true,
    finalResponseRevealed: true,
    finalScoredTeams: [0, 1, 2],
    finalResults: [
      { result: "partial", label: "Half", delta: 25 },
      { result: "none", label: "Auto-reviewed", delta: 0 },
      { result: "none", label: "Auto-reviewed", delta: 0 }
    ],
    finalComplete: false,
    mobileCategoryIndex: 0,
    currentClue: null,
    openDialog: null
  };
}

async function loadSeededScoreSheet(page) {
  await page.goto("/host-score-sheet.html?test=visual-snapshot");
  await page.evaluate(({ storageKey, state }) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, {
    storageKey: GAME_STATE_STORAGE_KEY,
    state: scoreSheetSnapshotState()
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
}

test("root route opens directly to the gameboard", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page).toHaveURL(/jeopardy-game\.html$/);
  await expect(page.getByRole("heading", { name: "Food Safety Face-Off" })).toBeVisible();
});

test("gameboard exposes host support links from footer", async ({ page, context }) => {
  await page.goto("/jeopardy-game.html?test=score-sheet-footer");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Host Notes" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next Team" })).toHaveCount(0);
  const quickStartLink = page.getByRole("link", { name: "Quick Start" });
  await expect(quickStartLink).toBeVisible();
  await expect(page.getByRole("link", { name: "Quick Start, opens in a new tab" })).toBeVisible();
  await expect(quickStartLink).toHaveAttribute("href", "host-quick-start.html");
  await expect(quickStartLink).toHaveAttribute("target", "_blank");
  const scoreSheetLink = page.getByRole("link", { name: "Score Sheet" });
  await expect(scoreSheetLink).toBeVisible();
  await expect(page.getByRole("link", { name: "Score Sheet, opens in a new tab" })).toBeVisible();
  await expect(scoreSheetLink).toHaveAttribute("href", "host-score-sheet.html");
  await expect(scoreSheetLink).toHaveAttribute("target", "_blank");

  let newPagePromise = context.waitForEvent("page");
  await quickStartLink.click();
  const quickStartPage = await newPagePromise;
  await expect(quickStartPage).toHaveURL(/host-quick-start\.html$/);
  await expect(quickStartPage.getByRole("heading", { name: "Host Quick Start" })).toBeVisible();
  await quickStartPage.close();

  newPagePromise = context.waitForEvent("page");
  await scoreSheetLink.click();
  const scoreSheetPage = await newPagePromise;
  await expect(scoreSheetPage).toHaveURL(/host-score-sheet\.html$/);
  await expect(scoreSheetPage.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
  await scoreSheetPage.close();
});

test("sound toggle unlocks Web Audio from a user gesture", async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioStats = { contexts: 0, resumes: 0, oscillatorStarts: 0, oscillatorStops: 0 };
    class FakeAudioContext {
      constructor() {
        window.__audioStats.contexts += 1;
        this.currentTime = 0;
        this.destination = {};
        this.state = "suspended";
      }

      resume() {
        window.__audioStats.resumes += 1;
        this.state = "running";
        return Promise.resolve();
      }

      createOscillator() {
        return {
          frequency: { setValueAtTime() {} },
          type: "sine",
          connect() {},
          start() { window.__audioStats.oscillatorStarts += 1; },
          stop() { window.__audioStats.oscillatorStops += 1; }
        };
      }

      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {}
          },
          connect() {}
        };
      }
    }
    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = undefined;
  });
  await page.goto("/jeopardy-game.html?test=sound-web-audio");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Sound is off. Turn sound on." }).click();
  await expect(page.getByRole("button", { name: "Sound is on. Turn sound off." })).toBeVisible();
  const stats = await page.evaluate(() => window.__audioStats);
  expect(stats.contexts).toBe(1);
  expect(stats.resumes).toBeGreaterThanOrEqual(1);
  expect(stats.oscillatorStarts).toBeGreaterThanOrEqual(3);
  expect(stats.oscillatorStops).toBeGreaterThanOrEqual(3);
});

test("sound toggle falls back to generated audio when Web Audio is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioFallbackStats = { constructed: 0, played: 0, revoked: 0 };
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
    const nativeRevokeObjectURL = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      window.__audioFallbackStats.revoked += 1;
      nativeRevokeObjectURL(url);
    };
    window.Audio = class FakeAudio {
      constructor(url) {
        window.__audioFallbackStats.constructed += 1;
        this.url = url;
        this.volume = 1;
      }

      addEventListener() {}

      play() {
        window.__audioFallbackStats.played += 1;
        return Promise.resolve();
      }
    };
  });
  await page.goto("/jeopardy-game.html?test=sound-fallback");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Sound is off. Turn sound on." }).click();
  await expect(page.getByRole("button", { name: "Sound is on. Turn sound off." })).toBeVisible();
  const stats = await page.evaluate(() => window.__audioFallbackStats);
  expect(stats.constructed).toBe(1);
  expect(stats.played).toBe(1);
});

test("team cards clearly show and change the active team", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=active-team-badge");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator(".team-card.active")).toContainText("Team 1");
  await expect(page.locator(".team-card.active .active-team-badge")).toHaveText("Active");
  await expect(page.getByRole("button", { name: /Team 1/ })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: /Team 2/ }).click();
  await expect(page.locator(".team-card.active")).toContainText("Team 2");
  await expect(page.locator(".team-card.active .active-team-badge")).toHaveText("Active");
  await expect(page.getByRole("button", { name: /Team 2/ })).toHaveAttribute("aria-pressed", "true");
});

test("team setup disables add and remove at team limits", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=team-setup-limits");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Teams" }).click();
  const addTeam = page.getByRole("button", { name: "Add Team" });
  const removeTeam = page.getByRole("button", { name: "Remove Team" });

  await expect(addTeam).toBeEnabled();
  await expect(removeTeam).toBeEnabled();
  await removeTeam.click();
  await expect(page.locator("#teamFields label")).toHaveCount(2);
  await expect(removeTeam).toBeDisabled();

  await addTeam.click();
  await addTeam.click();
  await addTeam.click();
  await expect(page.locator("#teamFields label")).toHaveCount(5);
  await expect(addTeam).toBeDisabled();
  await expect(removeTeam).toBeEnabled();
});

test("content guardrails and clue point values remain stable", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=content-copy");
  const values = await page.evaluate(() => window.JeopardyData.categories.map((category) => category.clues.map((clue) => clue.value)));
  expect(values).toEqual(Array.from({ length: 5 }, () => [100, 200, 300, 400, 500]));

  const text = await page.evaluate(() => JSON.stringify(window.JeopardyData));
  expect(text).toContain("Keep examples generic and non-confidential");
  expect(text).toContain("do not change point values during play");
  expect(text).toContain("Certificate of Analysis (COA)");
  expect(text).toContain("World Health Organization (WHO)");
  expect(text).toContain("Quality and Food Safety:");
  expect(text).not.toContain("customer/consumer");
  expect(text).not.toContain("required food-safety document");
});

test("jeopardy clue can reveal, no-score, and undo", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=smoke");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("button", { name: "No Score" })).toBeEnabled();
  await page.getByRole("button", { name: "No Score" }).click();
  await expect(page.getByText("1/25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Food Safety Basics for 200 points" })).toBeFocused();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await expect(page.getByText("Category Lens")).toBeVisible();
  await expect(page.locator("#clueDialog").getByText("Every check protects someone.")).toBeVisible();
});

test("incorrect answer opens one-click steal close", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=steal-close");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 200 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Incorrect -200" }).click();
  await expect(page.locator("#modalTeamSelect")).toHaveValue("1");
  await expect(page.getByRole("button", { name: "Close Clue" })).toBeEnabled();
  await page.getByRole("button", { name: "Close Clue" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("steal target persists through reload and resume", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=steal-resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 200 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Incorrect -200" }).click();
  await expect(page.locator("#modalTeamSelect")).toHaveValue("1");
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#modalTeamSelect")).toHaveValue("1");
  await expect(page.getByRole("button", { name: "Correct +200" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Incorrect -200" })).toBeEnabled();
});

test("undo after a steal restores the full clue sequence", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=steal-undo");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 200 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Incorrect -200" }).click();
  await expect(page.getByRole("button", { name: "Correct +200" })).toBeEnabled();
  await page.getByRole("button", { name: "Correct +200" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 -$200" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 2 $200" })).toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: "Team 1 $0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 2 $0" })).toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("correct auto-close undo returns to board", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=correct-undo");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("1/25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Food Safety Basics for 200 points" })).toBeFocused();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByText("0/25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 $0" })).toBeVisible();
});

test("host note updates after clue reveal", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=host-note");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await expect(page.locator("#hostNote")).toContainText("Reveal when ready");
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.locator("#hostNote")).toContainText("Score the selected team");
});

test("previewed clue can close without creating saved progress or consuming category intro", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=preview-close");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await expect(page.locator("#clueStinger")).toBeVisible();
  await expect(page.locator("#clueStinger")).toContainText("Every check protects someone.");
  await page.getByRole("button", { name: "Back to board" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("0/25 clues");

  await page.reload();
  await expect(page.getByRole("button", { name: "Resume Game" })).toHaveCount(0);
  await expect(page.locator("#progressStatus")).toHaveText("0/25 clues");
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await expect(page.locator("#clueStinger")).toBeVisible();
  await expect(page.locator("#clueStinger")).toContainText("Every check protects someone.");
});

test("revealed clue Escape and close button require explicit no-score confirmation", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=clue-close-confirm");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { name: "Close This Clue?" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
  await expect(page.locator("#clueDialog")).toBeVisible();

  await page.getByRole("button", { name: "Back to board" }).click();
  await expect(page.getByRole("heading", { name: "Close This Clue?" })).toBeVisible();
  await page.getByRole("button", { name: "Close As No Score" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("1/25 clues");
});

test("no-score auto-close resumes without reopening clue dialog", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=no-score-resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score / Close" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("1/25 clues");
  await expect(page.locator("#progressStatus")).toHaveAttribute("aria-label", /1 of 25 clues played/);
});

test("final zero wagers auto-review and show results without extra click", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-zero");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByText("Revealing locks wagers.")).toBeVisible();
  await page.getByRole("button", { name: "Reveal Final Clue" }).click();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Reviewed" })).toHaveCount(0);
  await expect(page.locator("#finalDialog").getByRole("button", { name: "Show Results" })).toHaveCount(0);
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalComplete).toBe(true);
  expect(savedState.finalScoredTeams).toEqual([0, 1, 2]);
  expect(savedState.finalResults.map((result) => result.label)).toEqual(["Auto-reviewed", "Auto-reviewed", "Auto-reviewed"]);
});

test("final guided scoring supports half credit and hides early results", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-guided");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Show Winner" })).toHaveCount(0);
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByLabel("Team 1 wager").fill("100");
  await expect(page.getByText("Revealing locks wagers.")).toBeVisible();
  await page.getByRole("button", { name: "Reveal Final Clue" }).click();
  await expect(page.getByRole("button", { name: "Reveal Final Response" })).toBeVisible();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByRole("button", { name: "Host Details" })).toBeVisible();
  await expect(page.locator("#finalRubric")).toBeVisible();
  await expect(page.getByText("Five or more relevant functions")).toBeVisible();
  await expect(page.locator("#finalHostDetails")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Full +100" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Half +50" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Miss -100" })).toBeVisible();
  await page.getByRole("button", { name: "Host Details" }).click();
  await expect(page.locator("#finalHostDetails")).toBeVisible();
  await page.getByRole("button", { name: "Hide Host Details" }).click();
  await page.getByRole("button", { name: "Half +50" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await expect(page.getByRole("dialog", { name: /Winner/ }).getByText("$150")).toBeVisible();
});

test("legacy final restore preserves locked wagers and derives completion", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=legacy-final-wagers");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Full Team", score: 300 },
        { name: "Half Team", score: 225 },
        { name: "Miss Team", score: 50 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [150, 150, 150],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: [0, 1, 2],
      finalResults: [
        { result: "correct", label: "Full", delta: 150 },
        { result: "partial", label: "Half", delta: 75 },
        { result: "incorrect", label: "Miss", delta: -150 }
      ],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "final"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalComplete).toBe(true);
  expect(savedState.finalStartingScores).toEqual([150, 150, 200]);
  expect(savedState.finalWagers).toEqual([150, 150, 150]);
  expect(savedState.finalResults.map((result) => `${result.label} ${result.delta}`)).toEqual(["Full 150", "Half 75", "Miss -150"]);

  await page.goto("/host-score-sheet.html?test=legacy-final-wagers");
  await expect(page.getByText("Wager: $150")).toHaveCount(3);
  await expect(page.getByText("Result: Full +150")).toBeVisible();
  await expect(page.getByText("Result: Half +75")).toBeVisible();
  await expect(page.getByText("Result: Miss -150")).toBeVisible();
});

test("new final flow persists starting scores through scoring and reload", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-starting-scores");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByLabel("Team 1 wager").fill("100");
  await page.getByRole("button", { name: "Reveal Final Clue" }).click();
  let savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalStartingScores).toEqual([100, 0, 0]);
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await page.getByRole("button", { name: "Miss -100" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.teams[0].score).toBe(0);
  expect(savedState.finalStartingScores).toEqual([100, 0, 0]);
  expect(savedState.finalWagers[0]).toBe(100);
  expect(savedState.finalResults[0]).toMatchObject({ label: "Miss", delta: -100 });
});

test("tampered finalComplete cannot bypass final scoring", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=tampered-final-complete");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 100 },
        { name: "Team 2", score: 0 },
        { name: "Team 3", score: 0 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalScoredTeams: [],
      finalResults: [],
      finalComplete: true,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "end"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Final Jeopardy" })).toBeVisible();
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalComplete).toBe(false);
});

test("final score controls stay visible across compact viewports", async ({ page }) => {
  const finalViewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 }
  ];

  for (const viewport of finalViewports) {
    await page.setViewportSize(viewport);
    await page.goto(`/jeopardy-game.html?test=final-controls-${viewport.width}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
    await page.getByRole("button", { name: "Reveal Response" }).click();
    await page.getByRole("button", { name: "Correct +100" }).click();
    await page.getByRole("button", { name: "Final Jeopardy" }).click();
    await page.getByLabel("Team 1 wager").fill("100");
    await page.getByRole("button", { name: "Reveal Final Clue" }).click();
    await page.getByRole("button", { name: "Reveal Final Response" }).click();
    await expect(page.locator("#finalHostDetails")).not.toBeVisible();
    await expectVisibleInViewport(page, page.locator("#finalHostDetailsToggle"));
    await expectVisibleInViewport(page, page.locator("#finalDialog .final-controls"));
    await expectVisibleInViewport(page, page.getByRole("button", { name: "Half +50" }));
    await expectNoPageOverflow(page);
    await page.getByRole("button", { name: "Back to board" }).click();
  }
});

test("revealed clue uses collapsible host details without layout overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/jeopardy-game.html?test=host-details-layout");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide Host Details" })).toBeVisible();
  await expect(page.locator("#clueHostDetails")).toBeVisible();
  await expect(page.locator("#clueDialog .host-controls")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.getByRole("button", { name: "Hide Host Details" }).click();
  await expect(page.locator("#clueHostDetails")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Host Details" })).toBeVisible();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await expect(page.locator("#clueDialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 $100" })).toBeVisible();
});

test("mobile revealed clue starts with host details collapsed", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jeopardy-game.html?test=host-details-mobile");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Host Details" })).toBeVisible();
  await expect(page.locator("#clueHostDetails")).not.toBeVisible();
  await page.getByRole("button", { name: "Host Details" }).click();
  await expect(page.locator("#clueHostDetails")).toBeVisible();
});

test("early Final Jeopardy opens directly without a confirmation detour", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=early-final-guard");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByLabel("Team 1 wager")).toBeVisible();
  await page.getByRole("button", { name: "Back to board" }).click();

  await page.goto("/jeopardy-game.html?test=final-complete-board");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    const usedClues = Array.from({ length: 25 }, (_, index) => `${index % 5}-${Math.floor(index / 5)}`);
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 100 },
        { name: "Team 2", score: 200 },
        { name: "Team 3", score: 300 }
      ],
      activeTeam: 0,
      usedClues,
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalScoredTeams: [],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: null
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByLabel("Team 1 wager")).toBeVisible();
});

test("team count is locked after Final wagers are locked but names remain editable", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-team-lock");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByLabel("Team 1 wager").fill("100");
  await page.getByRole("button", { name: "Reveal Final Clue" }).click();
  await page.getByRole("button", { name: "Back to board" }).click();
  await page.getByRole("button", { name: "Teams" }).click();
  await expect(page.getByRole("button", { name: "Add Team" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove Team" })).toBeDisabled();
  await page.locator("#teamFields input").first().fill("QA Final");
  await page.getByRole("button", { name: "Save Teams" }).click();
  await expect(page.locator(".team-card")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /QA Final/ })).toBeVisible();
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.teams.map((team) => team.name)).toEqual(["QA Final", "Team 2", "Team 3"]);
  expect(savedState.finalWagers).toEqual([100, 0, 0]);
});

test("streamlined game controls stay removed from live UI", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=streamlined-controls");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("button", { name: "Show Winner" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Start 30s|Stop Timer/ })).toHaveCount(0);
  await expect(page.getByText("Challenge Clue")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Host Notes" })).toHaveCount(0);
  await expect(page.getByText("Shortcuts")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Print Score Sheet" })).toHaveCount(0);
  await expect(page.getByText("Recent Plays")).toHaveCount(0);
});

test("legacy saved results cannot bypass final completion", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=legacy-end-restore");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 100 },
        { name: "Team 2", score: 0 },
        { name: "Team 3", score: 0 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalScoredTeams: [],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "end"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Final Jeopardy" })).toBeVisible();
});

test("stale final scoring is ignored until final response is revealed", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=stale-final-scoring");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "A", score: 500 },
        { name: "B", score: 300 }
      ],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalWagers: [999999, -10],
      finalResults: [
        { result: "correct", label: "Full", delta: 999999 },
        { result: "incorrect", label: "Miss", delta: -50 }
      ],
      finalScoredTeams: [0, 1]
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByRole("button", { name: "Reveal Final Clue" }).click();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByRole("heading", { name: /Winner/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Full +500" })).toBeEnabled();
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalScoredTeams).toEqual([1]);
  expect(savedState.finalResults[0]).toEqual({ result: "none", label: "", delta: 0 });
});

test("legacy final scoring restore sanitizes stale team indexes", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=legacy-final-restore");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "Team 1", score: 200 },
        { name: "Team 2", score: 100 }
      ],
      activeTeam: 0,
      usedClues: [],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [100, 100],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: [0, 1, 2],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: "final"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Winner/ })).toBeVisible();
  await expect(page.locator("#finalDialog").getByRole("button", { name: "Show Results" })).toHaveCount(0);
});

test("closed mobile clue tiles do not reveal teaching tags", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jeopardy-game.html?test=mobile-tag-leakage");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Signals to Solutions" }).click();
  await expect(page.locator("#mobileBoard").getByText("Available")).toHaveCount(5);
  await expect(page.locator("#mobileBoard").getByText("Risk Ranking")).toHaveCount(0);
  await page.getByRole("button", { name: "Signals to Solutions for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score / Close" }).click();
  await expect(page.locator("#mobileBoard .mobile-clue-tile.used").first()).toContainText("Used");
});

test("category visual URLs are restricted to generated local assets", async ({ page }) => {
  const hostileRequests = [];
  await page.route("**/jeopardy-data.js*", async (route) => {
    const body = DATA_SCRIPT
      .replace('image: "assets/generated/hero-campaign.png"', 'image: "https://evil.test/leak.png"')
      .replace('image: "assets/generated/station-spot-risk.png"', 'image: "javascript:alert(1)"');
    await route.fulfill({ contentType: "application/javascript", body });
  });
  page.on("request", (request) => {
    if (request.url().includes("evil.test")) hostileRequests.push(request.url());
  });
  await page.goto("/jeopardy-game.html?test=asset-allowlist");
  await expect(page.getByRole("heading", { name: "Food Safety Face-Off" })).toBeVisible();
  const firstCategoryBg = await page.locator(".category-heading").first().evaluate((element) => element.style.getPropertyValue("--category-bg"));
  expect(firstCategoryBg).toContain("assets/generated/station-myth-fact.png");
  expect(firstCategoryBg).not.toContain("evil.test");
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  const clueImage = await page.locator("#clueDialog .clue-panel").evaluate((element) => element.style.getPropertyValue("--category-image"));
  expect(clueImage).toContain("assets/generated/station-myth-fact.png");
  expect(hostileRequests).toEqual([]);
});

test("game layout avoids horizontal overflow at core viewports", async ({ page }) => {
  for (const viewport of TARGET_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await page.goto("/jeopardy-game.html?test=viewport");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole("heading", { name: "Food Safety Face-Off" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Final Jeopardy" })).toBeVisible();
    await expectNoPageOverflow(page);
    if (viewport.width === 390) {
      const mobileBoardTop = await page.locator("#mobileBoard").evaluate((element) => element.getBoundingClientRect().top);
      expect(mobileBoardTop).toBeLessThan(viewport.height);
    }
  }
});

test("primary dialogs remain usable across target viewport families", async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(`/jeopardy-game.html?test=dialogs-${viewport.width}`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.getByRole("button", { name: "Teams" }).click();
    await expect(page.getByRole("heading", { name: "Build Teams" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save Teams" })).toBeVisible();
    await expectNoPageOverflow(page);
    await page.getByRole("button", { name: "Close Team Setup" }).click();

    await page.getByRole("button", { name: "Show rules" }).click();
    await expect(page.getByRole("heading", { name: "Classic Jeopardy Format" })).toBeVisible();
    await expectNoPageOverflow(page);
    await page.getByRole("button", { name: "Close rules" }).click();

    await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
    await page.getByRole("button", { name: "Reveal Response" }).click();
    await expect(page.getByRole("heading", { name: "The consumer." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Correct +100" })).toBeVisible();
    await expectNoPageOverflow(page);
    await page.locator("#noScoreButton").click();
    await expect(page.locator("#clueDialog")).not.toHaveAttribute("open", "");

    await page.getByRole("button", { name: "Final Jeopardy" }).click();
    await expect(page.getByRole("heading", { name: "Start Final Jeopardy?" })).toHaveCount(0);
    await expect(page.getByLabel("Team 1 wager")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reveal Final Clue" })).toBeVisible();
    await expectNoPageOverflow(page);
    await page.getByRole("button", { name: "Back to board" }).click();
  }
});

test("keyboard navigation reaches controls, traps dialogs, and restores focus", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=keyboard-flow");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Show rules" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Sound is off. Turn sound on." })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Teams" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Build Teams" })).toBeVisible();
  await expect(page.locator("#teamFields input").first()).toBeFocused();

  await page.getByRole("button", { name: "Close Team Setup" }).focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Save Teams" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Teams" })).toBeFocused();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("score changes do not run score-card animations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/jeopardy-game.html?test=reduced-motion-score");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
    await page.getByRole("button", { name: "Reveal Response" }).click();
    await page.getByRole("button", { name: "Correct +100" }).click();
    await expect(page.locator(".team-card.active")).toContainText("Team 1");
    await expect(page.locator(".team-card.active")).toHaveClass(/score-up/);
    const animationName = await page.locator(".team-card.active").evaluate((element) => (
      getComputedStyle(element).animationName
    ));
    expect(animationName).toBe("none");
    const motionStyles = await page.evaluate(() => ({
      progressTransition: getComputedStyle(document.querySelector(".progress-status")).transitionDuration,
      toastTransition: getComputedStyle(document.querySelector(".score-toast")).transitionDuration
    }));
    expect(motionStyles.progressTransition).toBe("0s");
    expect(motionStyles.toastTransition).toBe("0s");
  });
});

test("reset cancel preserves state and confirm clears play while keeping team names", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=reset-behavior");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Teams" }).click();
  await page.locator("#teamFields input").first().fill("QA Crew");
  await page.getByRole("button", { name: "Save Teams" }).click();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "Correct +100" }).click();
  await expect(page.getByRole("button", { name: "QA Crew $100" })).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("button", { name: "QA Crew $100" })).toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("1/25 clues");

  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "Reset Game" }).click();
  await expect(page.getByRole("button", { name: "QA Crew $0" })).toBeVisible();
  await expect(page.locator("#progressStatus")).toHaveText("0/25 clues");
  await expect(page.getByRole("button", { name: "Final Jeopardy" })).toBeVisible();
});

test("saved game prompt can start fresh", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Teams" }).click();
  await page.locator("#teamFields input").first().fill("Saved QA");
  await page.getByRole("button", { name: "Save Teams" }).click();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Resume or Start Fresh?" })).toBeVisible();
  await page.getByRole("button", { name: "Start Fresh" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
  await expect(page.getByRole("button", { name: "Team 1 $0" })).toBeVisible();
  await expect(page.getByText("Saved QA")).toHaveCount(0);
});

test("host score sheet route renders print controls", async ({ page }) => {
  await page.goto("/host-score-sheet.html");
  await expect(page.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print Score Sheet" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Quick Start" })).toHaveAttribute("href", "host-quick-start.html");
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("table", { name: "Board tracker by category and point value" })).toBeVisible();
  await expect(page.locator("th[scope='col']")).toHaveCount(5);
});

test("host quick start route renders printable facilitator guide", async ({ page }) => {
  const viewports = [
    { width: 390, height: 844 },
    { width: 1075, height: 908 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(`/host-quick-start.html?test=quick-start-${viewport.width}`);
    await expect(page.getByRole("heading", { name: "Host Quick Start" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Print / Save PDF" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Score Sheet" })).toHaveAttribute("href", "host-score-sheet.html");
    await expect(page.getByRole("heading", { name: "Host Notes" })).toBeVisible();
    await expect(page.getByText("Keep examples generic")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Scoring Rules" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Final Jeopardy Flow" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Debrief Cue" })).toBeVisible();
    await expectNoPageOverflow(page);
  }
});

test("host score sheet reflects saved scores, used clues, wagers, and final results", async ({ page }) => {
  await page.goto("/host-score-sheet.html?test=saved-state");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "QA", score: 150 },
        { name: "Supply", score: -50 },
        { name: "Ops", score: 0 }
      ],
      activeTeam: 0,
      usedClues: ["0-0", "2-3"],
      seenCategoryPrompts: [],
      actionHistory: [],
      finalWagers: [50, 0, 0],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: [0, 1, 2],
      finalResults: [
        { result: "partial", label: "Half", delta: 25 },
        { result: "none", label: "Auto-reviewed", delta: 0 },
        { result: "none", label: "Auto-reviewed", delta: 0 }
      ],
      finalComplete: false,
      mobileCategoryIndex: 0,
      currentClue: null,
      openDialog: null
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await expect(page.locator("#scoreTeamGrid").getByText("QA")).toBeVisible();
  await expect(page.getByText("Score: $150")).toBeVisible();
  await expect(page.getByText("Score: -$50")).toBeVisible();
  await expect(page.locator(".used-clue")).toHaveCount(2);
  await expect(page.getByText("Wager: $50")).toBeVisible();
  await expect(page.getByText("Result: Half +25")).toBeVisible();
  await expect(page.getByText("Result: Auto-reviewed")).toHaveCount(2);
});

test("host score sheet desktop visual snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await loadSeededScoreSheet(page);
  await expect(page).toHaveScreenshot("host-score-sheet-desktop.png", {
    animations: "disabled",
    fullPage: true
  });
});

test("host score sheet mobile visual snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loadSeededScoreSheet(page);
  await expect(page).toHaveScreenshot("host-score-sheet-mobile.png", {
    animations: "disabled",
    fullPage: true
  });
});

test("host score sheet print visual snapshot", async ({ page }) => {
  await page.setViewportSize({ width: 1056, height: 816 });
  await page.emulateMedia({ media: "print" });
  await loadSeededScoreSheet(page);
  await expect(page).toHaveScreenshot("host-score-sheet-print.png", {
    animations: "disabled",
    fullPage: true
  });
});

test("host score sheet ignores stale final results before response reveal", async ({ page }) => {
  await page.goto("/host-score-sheet.html?test=stale-final-results");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "A", score: 500 },
        { name: "B", score: 300 }
      ],
      finalWagersLocked: false,
      finalResponseRevealed: false,
      finalWagers: [999999, -10],
      finalResults: [
        { result: "correct", label: "Full", delta: 999999 },
        { result: "incorrect", label: "Miss", delta: -50 }
      ],
      finalScoredTeams: [0, 1]
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await expect(page.getByText("Wager: $500")).toBeVisible();
  await expect(page.getByText("Result: Full +500")).toHaveCount(0);
  await expect(page.getByText("Result: Miss -300")).toHaveCount(0);
});

test("malformed saved game state is normalized before restoring", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=malformed-state");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    window.__teamNameInjected = false;
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "<img src=x onerror='window.__teamNameInjected=true'>VeryLongTeamNameThatShouldBeTrimmed", score: 100 },
        { name: "Team 2", score: 50 },
        { name: "Team 3", score: 0 },
        { name: "Team 4", score: 0 },
        { name: "Team 5", score: 0 },
        { name: "Team 6", score: 0 }
      ],
      activeTeam: 99,
      usedClues: ["0-0", "999-999", "<script>alert(1)</script>"],
      seenCategoryPrompts: ["food-safety-basics", "bad-category"],
      actionHistory: [
        { title: "<img src=x onerror='window.__historyInjected=true'>OversizedHistoryTitleThatShouldBeTrimmed", detail: "<script>alert(1)</script>", delta: "not-a-number", type: "bad-type" },
        null
      ],
      finalWagers: [999999, 999999, 999999, 999999, 999999, 999999],
      finalWagersLocked: true,
      finalResponseRevealed: true,
      finalScoredTeams: { bad: true },
      finalResults: [
        { result: "correct", label: "<script>alert(1)</script>", delta: 999999 },
        { result: "incorrect", label: "Bad", delta: -999999 }
      ],
      finalComplete: false,
      mobileCategoryIndex: 99,
      currentClue: {
        id: "0-0",
        scoredTeams: [0, 99, "<script>"],
        noScore: false,
        stealOpen: false,
        resolved: false,
        revealed: true
      },
      openDialog: "final",
      undoSnapshot: {
        label: "<script>alert(1)</script>",
        snapshot: {
          version: 1,
          teams: [null],
          undoSnapshot: { label: "nested", snapshot: {} }
        }
      }
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator(".team-card")).toHaveCount(5);
  await expect(page.locator("#progressStatus")).toHaveText("1/25 clues");
  await expect(page.locator('[data-wager-index="0"]')).toHaveValue("100");
  await expect(page.getByRole("button", { name: "Full +100" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Miss -50" })).toBeVisible();
  await expect(page.getByText("999999")).toHaveCount(0);
  await expect(page.getByText("<script>alert(1)</script>")).toHaveCount(0);
  expect(await page.evaluate(() => window.__teamNameInjected)).not.toBe(true);
  const savedState = await page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), GAME_STATE_STORAGE_KEY);
  expect(savedState.finalScoredTeams).toEqual([2, 3, 4]);
  expect(savedState.finalWagers.slice(0, 2)).toEqual([100, 50]);
  expect(savedState.actionHistory).toEqual([
    expect.objectContaining({ type: "neutral", delta: 0 })
  ]);
  expect(savedState.undoSnapshot.label).not.toContain("<script>");
  expect(savedState.undoSnapshot.snapshot.undoSnapshot).toBeNull();
});

test("restored resolved current clue is reconciled with used clues", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=resolved-current-clue");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "A", score: 0 },
        { name: "B", score: 0 }
      ],
      usedClues: [],
      currentClue: {
        id: "0-0",
        scoredTeams: [],
        noScore: true,
        stealOpen: false,
        resolved: true,
        revealed: true
      },
      openDialog: "clue"
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await page.getByRole("button", { name: "Resume Game" }).click();
  await expect(page.locator("#progressStatus")).toHaveText("1/25 clues");
  await page.locator("#closeClueButton").click();
  await expect(page.getByRole("button", { name: "Food Safety Basics for 100 points" })).toBeDisabled();
});

test("host score sheet sanitizes malformed saved state", async ({ page }) => {
  await page.goto("/host-score-sheet.html?test=malformed-state");
  await page.evaluate((storageKey) => {
    localStorage.clear();
    localStorage.setItem(storageKey, JSON.stringify({
      version: 1,
      teams: [
        { name: "<svg onload='window.__scoreSheetInjected=true'>VeryLongTeamNameThatShouldBeTrimmed", score: 50 },
        { name: "Supply", score: 25 },
        { name: "Ops", score: 0 },
        { name: "QA", score: 0 },
        { name: "Lab", score: 0 },
        { name: "Extra", score: 0 }
      ],
      usedClues: ["0-0", "9-9", "not-a-clue"],
      finalResponseRevealed: true,
      finalWagers: [99999],
      finalResults: [
        { result: "correct", label: "<script>alert(1)</script>", delta: 99999 }
      ],
      finalScoredTeams: [0, 99]
    }));
  }, GAME_STATE_STORAGE_KEY);
  await page.reload();
  await expect(page.locator("#scoreTeamGrid article")).toHaveCount(5);
  await expect(page.locator(".used-clue")).toHaveCount(1);
  await expect(page.getByText("Wager: $50")).toBeVisible();
  await expect(page.getByText("Result: Full +50")).toBeVisible();
  await expect(page.getByText("<script>alert(1)</script>")).toHaveCount(0);
});
