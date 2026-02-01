const fs = require('fs');
const path = require('path');

function writeWav(filename) {
    const sampleRate = 44100;
    const duration = 2.0; // 2 seconds of alert
    const numSamples = sampleRate * duration;
    const buffer = Buffer.alloc(44 + numSamples * 2);

    // WAV Header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);

    // Generate "Thunder/Alert" Sound (Sawtooth + Noise)
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;

        // 1. Low frequency oscillation (Thunder rumble)
        const rumble = Math.sin(t * 50 * Math.PI) * Math.sin(t * 2 * Math.PI);

        // 2. High pitch alert (Siren)
        const siren = Math.sin(t * 800 * Math.PI);

        // 3. White noise (Crash)
        const noise = (Math.random() * 2 - 1);

        // Mix them: Loud start, fade out slightly
        const envelope = 1 - (t / duration);
        const signal = (rumble * 0.5 + siren * 0.3 + noise * 0.4) * envelope;

        // Clip to -1 to 1
        const clipped = Math.max(-1, Math.min(1, signal));

        // Convert to 16-bit PCM
        const sample = clipped * 32767;
        buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
    }

    fs.writeFileSync(filename, buffer);
    console.log(`✅ Generated ${filename}`);
}

// Save directly to frontend public folder
const outputPath = path.join(__dirname, '../frontend/public/thunder_alert.wav');
writeWav(outputPath);
