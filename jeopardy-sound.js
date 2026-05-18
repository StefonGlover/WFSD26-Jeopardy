window.JeopardySound = (() => {
  function getPattern(kind) {
    return {
      tile: [{ frequency: 220, start: 0, duration: 0.08, volume: 0.35, type: "triangle" }],
      reveal: [
        { frequency: 420, start: 0, duration: 0.11, volume: 0.32, type: "sine" },
        { frequency: 660, start: 0.08, duration: 0.14, volume: 0.28, type: "sine" }
      ],
      correct: [
        { frequency: 523.25, start: 0, duration: 0.12, volume: 0.34, type: "sine" },
        { frequency: 783.99, start: 0.1, duration: 0.18, volume: 0.32, type: "sine" }
      ],
      incorrect: [
        { frequency: 164.81, start: 0, duration: 0.16, volume: 0.3, type: "sawtooth" },
        { frequency: 123.47, start: 0.11, duration: 0.2, volume: 0.26, type: "sawtooth" }
      ],
      winner: [
        { frequency: 523.25, start: 0, duration: 0.13, volume: 0.32, type: "triangle" },
        { frequency: 659.25, start: 0.11, duration: 0.13, volume: 0.32, type: "triangle" },
        { frequency: 783.99, start: 0.22, duration: 0.15, volume: 0.34, type: "triangle" },
        { frequency: 1046.5, start: 0.36, duration: 0.28, volume: 0.3, type: "sine" }
      ]
    }[kind] || [];
  }

  function synthSample(phase, type) {
    if (type === "sawtooth") return 2 * (phase / (Math.PI * 2) - Math.floor(phase / (Math.PI * 2) + 0.5));
    if (type === "triangle") return (2 / Math.PI) * Math.asin(Math.sin(phase));
    return Math.sin(phase);
  }

  function makeWavUrl(pattern) {
    const sampleRate = 22050;
    const totalSeconds = Math.max(...pattern.map((item) => item.start + item.duration), 0.12) + 0.04;
    const sampleCount = Math.ceil(totalSeconds * sampleRate);
    const dataSize = sampleCount * 2;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const writeText = (offset, text) => [...text].forEach((character, index) => {
      view.setUint8(offset + index, character.charCodeAt(0));
    });

    writeText(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeText(8, "WAVE");
    writeText(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, "data");
    view.setUint32(40, dataSize, true);

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      const time = sampleIndex / sampleRate;
      const value = pattern.reduce((sum, item) => {
        if (time < item.start || time > item.start + item.duration) return sum;
        const localTime = time - item.start;
        const fadeIn = Math.min(1, localTime / 0.015);
        const fadeOut = Math.min(1, (item.duration - localTime) / 0.035);
        const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
        return sum + synthSample(localTime * item.frequency * Math.PI * 2, item.type) * item.volume * envelope;
      }, 0);
      view.setInt16(44 + sampleIndex * 2, Math.max(-1, Math.min(1, value)) * 0x7fff, true);
    }

    return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
  }

  return { getPattern, makeWavUrl };
})();
