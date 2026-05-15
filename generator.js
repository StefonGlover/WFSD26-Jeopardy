const { assets, formats } = window.CampaignData;

const canvas = document.getElementById("campaignCanvas");
const ctx = canvas.getContext("2d");
const assetSelect = document.getElementById("assetSelect");
const formatSelect = document.getElementById("formatSelect");
const headlineInput = document.getElementById("headlineInput");
const bodyInput = document.getElementById("bodyInput");
const ctaInput = document.getElementById("ctaInput");
const kickerInput = document.getElementById("kickerInput");
const qrInput = document.getElementById("qrInput");
const promptText = document.getElementById("promptText");
const assetMeta = document.getElementById("assetMeta");
const sizeMeta = document.getElementById("sizeMeta");
const imageInput = document.getElementById("imageInput");
const packetGrid = document.getElementById("packetGrid");

const imageCache = new Map();
const customImages = new Map();
let currentAsset = assets[0];

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function wrapText(text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(/\s+/);
  let line = "";
  let lines = 0;
  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = words[i];
      if (maxLines && lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && (!maxLines || lines < maxLines)) ctx.fillText(line, x, y);
  return y + lineHeight;
}

function coverImage(img, width, height) {
  const scale = Math.max(width / img.width, height / img.height);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
}

function drawOverlay(width, height, format) {
  const grd = ctx.createLinearGradient(0, 0, width * 0.7, 0);
  grd.addColorStop(0, "rgba(0, 0, 0, 0.78)");
  grd.addColorStop(0.48, "rgba(0, 0, 0, 0.42)");
  grd.addColorStop(1, "rgba(0, 0, 0, 0.03)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  const bottom = ctx.createLinearGradient(0, height * 0.65, 0, height);
  bottom.addColorStop(0, "rgba(244, 0, 0, 0)");
  bottom.addColorStop(1, "rgba(244, 0, 0, 0.82)");
  ctx.fillStyle = bottom;
  ctx.fillRect(0, height * 0.55, width, height * 0.45);

  ctx.save();
  ctx.globalAlpha = 0.78;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(8, width * 0.008);
  ctx.beginPath();
  ctx.ellipse(width * 0.16, height * 0.76, width * 0.38, height * 0.11, -0.17, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (format === "passport") {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(width * 0.08, height * 0.17, width * 0.84, height * 0.62, 34, true);
  }
}

function roundRect(x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawBrand(width) {
  ctx.save();
  ctx.translate(width * 0.055, canvas.height * 0.075);
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 4;
  roundRect(0, 0, 292, 92, 46, false, true);
  ctx.font = "italic 42px Georgia, serif";
  ctx.fillText("Coca-Cola", 34, 52);
  ctx.font = "bold 15px Arial";
  ctx.fillText("QSE PASSPORT FAIR", 62, 75);
  ctx.beginPath();
  ctx.ellipse(142, 68, 118, 18, -0.06, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawTextBlock(asset, format, width, height) {
  const isPortrait = format === "station";
  const isPassport = format === "passport";
  const x = isPassport ? width * 0.14 : width * 0.055;
  const maxWidth = isPortrait ? width * 0.82 : width * 0.52;
  let y = isPassport ? height * 0.19 : height * 0.21;

  ctx.fillStyle = isPassport ? "#f40000" : "#fff";
  ctx.font = `900 ${Math.round(width * (isPortrait ? 0.033 : 0.017))}px Arial`;
  ctx.fillText(kickerInput.value.toUpperCase(), x, y);
  y += height * 0.06;

  ctx.font = `900 ${Math.round(width * (isPortrait ? 0.071 : isPassport ? 0.047 : 0.046))}px Arial`;
  ctx.fillStyle = isPassport ? "#111" : "#fff";
  y = wrapText(headlineInput.value, x, y, isPassport ? width * 0.72 : maxWidth, height * (isPortrait ? 0.078 : 0.061), 4);

  ctx.font = `500 ${Math.round(width * (isPortrait ? 0.033 : 0.022))}px Arial`;
  ctx.fillStyle = isPassport ? "#333" : "rgba(255,255,255,0.92)";
  y += height * 0.018;
  y = wrapText(bodyInput.value, x, y, isPassport ? width * 0.66 : maxWidth, height * (isPortrait ? 0.045 : 0.036), 4);

  if (isPassport) {
    drawPassportStamps(width, height);
  } else {
    drawCTA(width, height, format);
  }
}

function drawCTA(width, height, format) {
  const bandHeight = format === "station" ? height * 0.17 : height * 0.15;
  const bandY = height - bandHeight;
  ctx.fillStyle = "rgba(244, 0, 0, 0.92)";
  ctx.fillRect(0, bandY, width, bandHeight);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${Math.round(width * (format === "station" ? 0.038 : 0.025))}px Arial`;
  wrapText(ctaInput.value, width * 0.055, bandY + bandHeight * 0.42, width * 0.68, bandHeight * 0.28, 2);
  drawQR(width, bandY + bandHeight * 0.18, bandHeight * 0.63);
}

function drawQR(width, y, size) {
  const x = width - size - width * 0.055;
  ctx.fillStyle = "#fff";
  roundRect(x, y, size, size, 14, true);
  ctx.fillStyle = "#111";
  const cells = 7;
  const pad = size * 0.14;
  const cell = (size - pad * 2) / cells;
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      const on = row === 0 || col === 0 || row === cells - 1 || col === cells - 1 || (row + col) % 3 === 0;
      if (on) ctx.fillRect(x + pad + col * cell, y + pad + row * cell, cell * 0.76, cell * 0.76);
    }
  }
  ctx.font = `900 ${Math.round(size * 0.12)}px Arial`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(qrInput.value.toUpperCase(), x + size / 2, y + size + size * 0.23);
  ctx.textAlign = "left";
}

function drawMarkers(asset, width, height) {
  if (!asset.markers) return;
  asset.markers.forEach((marker) => {
    const x = marker.x * width;
    const y = marker.y * height;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, width * 0.023, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f40000";
    ctx.lineWidth = width * 0.006;
    ctx.stroke();
    ctx.fillStyle = "#f40000";
    ctx.font = `900 ${Math.round(width * 0.024)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(marker.label, x, y + 1);
  });
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawChips(asset, width, height, format) {
  if (!asset.chips || format === "passport") return;
  const y = format === "station" ? height * 0.64 : height * 0.55;
  let x = width * 0.055;
  ctx.font = `900 ${Math.round(width * (format === "station" ? 0.026 : 0.017))}px Arial`;
  asset.chips.forEach((chip) => {
    const w = ctx.measureText(chip).width + width * 0.045;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 3;
    roundRect(x, y, w, height * 0.055, height * 0.027, true, true);
    ctx.fillStyle = "#fff";
    ctx.fillText(chip, x + width * 0.022, y + height * 0.037);
    x += w + width * 0.012;
  });
}

function drawPassportStamps(width, height) {
  const labels = ["Spot the Risk", "Perfect Product", "Myth or Fact", "Allergen Alert", "Raise the Red Flag", "Raffle Verified"];
  const startX = width * 0.14;
  const startY = height * 0.58;
  const cardW = width * 0.22;
  const cardH = height * 0.105;
  labels.forEach((label, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = startX + col * (cardW + width * 0.035);
    const y = startY + row * (cardH + height * 0.05);
    ctx.strokeStyle = "#f40000";
    ctx.lineWidth = 5;
    ctx.setLineDash([16, 10]);
    roundRect(x, y, cardW, cardH, 18, false, true);
    ctx.setLineDash([]);
    ctx.fillStyle = "#f40000";
    ctx.font = `900 ${Math.round(width * 0.017)}px Arial`;
    wrapText(`${index + 1}. ${label}`, x + 22, y + cardH * 0.58, cardW - 44, cardH * 0.25, 2);
  });
}

async function render() {
  const format = formatSelect.value;
  const dims = formats[format];
  canvas.width = dims.width;
  canvas.height = dims.height;
  const img = customImages.get(currentAsset.id) || await loadImage(currentAsset.image);
  coverImage(img, canvas.width, canvas.height);
  drawOverlay(canvas.width, canvas.height, format);
  drawBrand(canvas.width);
  drawTextBlock(currentAsset, format, canvas.width, canvas.height);
  drawChips(currentAsset, canvas.width, canvas.height, format);
  drawMarkers(currentAsset, canvas.width, canvas.height);
  assetMeta.textContent = `${currentAsset.type} · ${currentAsset.headline}`;
  sizeMeta.textContent = `${dims.width} x ${dims.height}px`;
}

function setAsset(asset) {
  currentAsset = asset;
  headlineInput.value = asset.headline;
  bodyInput.value = asset.body;
  ctaInput.value = asset.cta;
  kickerInput.value = asset.kicker;
  qrInput.value = asset.qr;
  promptText.textContent = asset.prompt;
  render();
}

function downloadPNG() {
  render().then(() => {
    const link = document.createElement("a");
    link.download = `${currentAsset.id}-${formatSelect.value}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function openPNG() {
  render().then(() => {
    const win = window.open();
    if (!win) return;
    win.document.write(`<title>${currentAsset.headline}</title><img alt="${currentAsset.headline}" src="${canvas.toDataURL("image/png")}" style="max-width:100%;height:auto;display:block;margin:0 auto;background:#111;">`);
    win.document.close();
  });
}

function buildPacket() {
  packetGrid.innerHTML = "";
  assets.forEach((asset) => {
    const card = document.createElement("article");
    card.className = "packet-card";
    card.style.backgroundImage = `linear-gradient(90deg, rgba(0,0,0,.78), rgba(0,0,0,.18)), url('${asset.image}')`;
    card.innerHTML = `
      <p>${asset.type}</p>
      <h3>${asset.headline}</h3>
      <span>${asset.cta}</span>
    `;
    packetGrid.appendChild(card);
  });
}

assetSelect.innerHTML = assets
  .map((asset, index) => `<option value="${index}">${asset.type} · ${asset.headline}</option>`)
  .join("");

assetSelect.addEventListener("change", () => setAsset(assets[Number(assetSelect.value)]));
formatSelect.addEventListener("change", render);
[headlineInput, bodyInput, ctaInput, kickerInput, qrInput].forEach((input) => input.addEventListener("input", render));
document.getElementById("downloadButton").addEventListener("click", downloadPNG);
document.getElementById("openPngButton").addEventListener("click", openPNG);
document.getElementById("resetButton").addEventListener("click", () => setAsset(currentAsset));
document.getElementById("printPacketButton").addEventListener("click", () => window.print());

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      customImages.set(currentAsset.id, img);
      render();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

buildPacket();
setAsset(assets[0]);
