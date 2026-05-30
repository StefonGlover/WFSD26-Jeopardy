import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const htmlPath = "jeopardy-game.html";
const versionFiles = [
  "jeopardy-game.css",
  "jeopardy-data.js",
  "state-utils.js",
  "jeopardy-sound.js",
  "jeopardy-dialogs.js",
  "jeopardy-game.js"
];

const versions = Object.fromEntries(await Promise.all(versionFiles.map(async (file) => {
  const content = await readFile(file);
  const hash = createHash("sha1").update(content).digest("hex").slice(0, 10);
  return [file, hash];
})));

let html = await readFile(htmlPath, "utf8");
for (const [file, hash] of Object.entries(versions)) {
  html = html.replace(new RegExp(`${file}\\?v=[^"']+`, "g"), `${file}?v=${hash}`);
}

await writeFile(htmlPath, html);
console.log(`Updated ${htmlPath} asset versions.`);
