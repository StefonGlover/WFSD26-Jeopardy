import { expect, test } from "@playwright/test";

test("launcher and print packet routes are stable", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.getByRole("link", { name: "Play Jeopardy" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Host Score Sheet" })).toBeVisible();

  await page.goto("/print-kit.html");
  await expect(page).toHaveURL(/campaign-generator\.html#printPacket$/);
  await expect(page.getByRole("heading", { name: "Food Safety Passport Challenge" })).toBeVisible();
});

test("quiz requires an answer before advancing", async ({ page }) => {
  await page.goto("/digital-quiz.html");
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByRole("button", { name: "Myth" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Question 2 of 6")).toBeVisible();
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
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
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
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("final zero wager uses mark reviewed", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=final-zero");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Final Jeopardy" }).click();
  await page.getByRole("button", { name: "Lock Wagers" }).click();
  await page.getByRole("button", { name: "Reveal Final Response" }).click();
  await expect(page.getByRole("button", { name: "Mark Reviewed" })).toHaveCount(3);
});

test("generator event config renders scannable QR canvas source", async ({ page }) => {
  await page.goto("/campaign-generator.html");
  await page.getByLabel("Feedback / event URL").fill("https://example.com/feedback");
  await page.getByLabel("Event time").fill("2 PM");
  await page.getByLabel("Event location").fill("Main Lobby");
  await expect(page.getByLabel("Generated material preview")).toBeVisible();
});

test("game layout avoids horizontal overflow at core viewports", async ({ page }) => {
  const viewports = [
    { width: 1075, height: 908 },
    { width: 1366, height: 768 },
    { width: 390, height: 844 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/jeopardy-game.html?test=viewport");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByRole("heading", { name: "Safe Food, Fast Thinking" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("saved game prompt can start fresh", async ({ page }) => {
  await page.goto("/jeopardy-game.html?test=resume");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole("button", { name: "Food Safety Basics for 100 points" }).click();
  await page.getByRole("button", { name: "Reveal Response" }).click();
  await page.getByRole("button", { name: "No Score" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Resume or Start Fresh?" })).toBeVisible();
  await page.getByRole("button", { name: "Start Fresh" }).click();
  await expect(page.getByText("0/25")).toBeVisible();
});

test("host score sheet route renders print controls", async ({ page }) => {
  await page.goto("/host-score-sheet.html");
  await expect(page.getByRole("heading", { name: "Host Score Sheet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print Score Sheet" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
});
