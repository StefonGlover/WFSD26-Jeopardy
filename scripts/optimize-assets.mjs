import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const assetDir = path.resolve("assets/generated");
const files = await readdir(assetDir);
const pngs = files.filter((file) => file.endsWith(".png"));

await Promise.all(pngs.map(async (file) => {
  const source = path.join(assetDir, file);
  const target = path.join(assetDir, file.replace(/\.png$/i, ".webp"));
  await sharp(source)
    .webp({ quality: 78, effort: 5 })
    .toFile(target);
  console.log(`${file} -> ${path.basename(target)}`);
}));
