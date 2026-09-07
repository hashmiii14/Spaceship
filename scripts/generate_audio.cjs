const fs = require('fs');
const path = require('path');

function createWavBuffer(sampleRate, samples) {
  const byteLength = samples.length * 2; // 16-bit = 2 bytes
  const buffer = Buffer.alloc(44 + byteLength);

  // RIFF identifier
  buffer.write('RIFF', 0);
  // file length minus 8
  buffer.writeUInt32LE(36 + byteLength, 4);
  // RIFF type
  buffer.write('WAVE', 8);
  // format chunk identifier
  buffer.write('fmt ', 12);
  // format chunk length
  buffer.writeUInt32LE(16, 16);
  // sample format (raw PCM = 1)
  buffer.writeUInt16LE(1, 20);
  // channel count (1 = mono)
  buffer.writeUInt16LE(1, 22);
  // sample rate
  buffer.writeUInt32LE(sampleRate, 24);
  // byte rate (sampleRate * channels * bytesPerSample)
  buffer.writeUInt32LE(sampleRate * 2, 28);
  // block align (channels * bytesPerSample)
  buffer.writeUInt16LE(2, 32);
  // bits per sample
  buffer.writeUInt16LE(16, 34);
  // data chunk identifier
  buffer.write('data', 36);
  // data chunk length
  buffer.writeUInt32LE(byteLength, 40);

  // Write 16-bit signed PCM samples (-32768 to 32767)
  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    buffer.writeInt16LE(Math.floor(intSample), 44 + i * 2);
  }

  return buffer;
}

function generateTrack(type, durationSeconds = 15) {
  const sampleRate = 22050;
  const totalSamples = sampleRate * durationSeconds;
  const samples = new Float32Array(totalSamples);

  let pattern = [];
  let tempo = 140; // BPM

  if (type === 'dubidubidu') {
    // Chipi Chipi Chapa Chapa: G4, G4, A4, C5, G4, G4, F4, E4, E4, F4, G4, F4, E4, D4, C4
    tempo = 145;
    pattern = [
      392, 392, 440, 523, 392, 392, 349, 330,
      330, 349, 392, 349, 330, 294, 262, 262
    ];
  } else if (type === 'axel-f') {
    // Axel F hook: F4, Ab4, F4, F4, Bb4, F4, Eb4, F4, C5, F4, F4, Db5, C5, Ab4, F4, C5, F5, F4, Eb4, Eb4, C4, G4, F4
    tempo = 138;
    pattern = [
      349, 415, 349, 349, 466, 349, 311, 0,
      349, 523, 349, 349, 554, 523, 415, 0,
      349, 523, 698, 349, 311, 311, 262, 392, 349, 0
    ];
  } else {
    // Gangnam Style hook: B4, B4, B4, A4, B4, B4, B4, A4, B4, D5, B4, A4
    tempo = 132;
    pattern = [
      494, 494, 494, 440, 494, 494, 494, 440,
      494, 587, 494, 440, 494, 587, 659, 494
    ];
  }

  const secondsPerBeat = 60 / (tempo * 2);
  const samplesPerBeat = Math.floor(sampleRate * secondsPerBeat);

  for (let i = 0; i < totalSamples; i++) {
    const beatIndex = Math.floor(i / samplesPerBeat);
    const note = pattern[beatIndex % pattern.length];
    const beatPhase = (i % samplesPerBeat) / samplesPerBeat;

    let val = 0;
    if (note > 0) {
      // Lead melodic synth (square/saw mix with decay)
      const t = i / sampleRate;
      const freq = note;
      const decay = Math.exp(-beatPhase * 4);
      // Lead tone
      const lead = Math.sin(2 * Math.PI * freq * t) * 0.4 + 
                   (Math.sin(4 * Math.PI * freq * t) > 0 ? 0.2 : -0.2);
      val += lead * decay * 0.45;
    }

    // Punchy Kick Drum on every 2 beats
    if (beatIndex % 2 === 0) {
      const kickPhase = beatPhase;
      const kickFreq = 120 * Math.exp(-kickPhase * 18) + 40;
      const kick = Math.sin(2 * Math.PI * kickFreq * (kickPhase * secondsPerBeat));
      val += kick * Math.exp(-kickPhase * 8) * 0.5;
    }

    // Hi-hat noise on off-beats
    if (beatIndex % 2 === 1) {
      const noise = (Math.random() * 2 - 1) * 0.15 * Math.exp(-beatPhase * 12);
      val += noise;
    }

    // Bassline
    const bassNote = pattern[Math.floor(beatIndex / 2) % pattern.length] / 2;
    if (bassNote > 0) {
      const bass = Math.sin(2 * Math.PI * bassNote * (i / sampleRate));
      val += bass * 0.25;
    }

    samples[i] = Math.max(-0.95, Math.min(0.95, val));
  }

  return createWavBuffer(sampleRate, samples);
}

const outDir = path.join(__dirname, '..', 'public', 'audio');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating procedural audio assets...');
fs.writeFileSync(path.join(outDir, 'dubidubidu.mp3'), generateTrack('dubidubidu', 25));
fs.writeFileSync(path.join(outDir, 'axel-f.mp3'), generateTrack('axel-f', 25));
fs.writeFileSync(path.join(outDir, 'gangnam-style.mp3'), generateTrack('gangnam-style', 25));
console.log('Audio files created in public/audio/');
