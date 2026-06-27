import type { AudioAnalysisFrame } from "@/types";

export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private outputGain: GainNode | null = null;
  private activeSource: AudioNode | null = null;
  private activeBufferSource: AudioBufferSourceNode | null = null;
  private activeOscillator: OscillatorNode | null = null;
  private activeStream: MediaStream | null = null;
  private frequencyData: Uint8Array<ArrayBuffer> | null = null;
  private waveformData: Uint8Array<ArrayBuffer> | null = null;
  private smoothedFrame: AudioAnalysisFrame = emptyFrame();

  async initialize(): Promise<void> {
    if (this.context) {
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
      return;
    }

    this.context = new AudioContext();
    this.analyser = this.context.createAnalyser();
    this.outputGain = this.context.createGain();
    this.analyser.fftSize = 2048;
    this.outputGain.gain.value = 0;
    this.analyser.connect(this.outputGain);
    this.outputGain.connect(this.context.destination);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.waveformData = new Uint8Array(this.analyser.fftSize);
  }

  getFrame(): AudioAnalysisFrame {
    if (!this.analyser || !this.frequencyData || !this.waveformData) {
      return emptyFrame();
    }

    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.waveformData);

    const frequency = Array.from(this.frequencyData).map((value) => value / 255);
    const waveform = Array.from(this.waveformData).map((value) => (value - 128) / 128);

    const bass = average(frequency.slice(0, 16));
    const mids = average(frequency.slice(16, 96));
    const highs = average(frequency.slice(96, 256));
    const volume = average(frequency);

    const nextFrame = {
      volume,
      bass,
      mids,
      highs,
      waveform,
      frequency
    };

    this.smoothedFrame = smoothFrame(this.smoothedFrame, nextFrame, 0.18);

    return this.smoothedFrame;
  }

  async startOscillator(type: OscillatorType): Promise<void> {
    await this.initialize();

    if (!this.context || !this.analyser) {
      throw new Error("Audio engine is not initialized.");
    }

    this.stopCurrentSource();
    const oscillator = this.context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = 110;
    oscillator.connect(this.analyser);
    oscillator.start();
    this.activeOscillator = oscillator;
    this.activeSource = oscillator;
  }

  async connectMicrophone(): Promise<void> {
    await this.initialize();

    if (!this.context || !this.analyser) {
      throw new Error("Audio engine is not initialized.");
    }

    this.stopCurrentSource();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.context.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.activeStream = stream;
    this.activeSource = source;
  }

  async connectFile(file: File): Promise<void> {
    await this.initialize();

    if (!this.context || !this.analyser) {
      throw new Error("Audio engine is not initialized.");
    }

    this.stopCurrentSource();
    const arrayBuffer = await file.arrayBuffer();
    let buffer: AudioBuffer;

    try {
      buffer = await this.context.decodeAudioData(arrayBuffer);
    } catch {
      throw new Error("Audio file could not be decoded.");
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.analyser);
    source.start();
    this.activeBufferSource = source;
    this.activeSource = source;
  }

  stopCurrentSource(): void {
    if (this.activeBufferSource) {
      try {
        this.activeBufferSource.stop();
      } catch {
        // Source may already be stopped by the browser.
      }
      this.activeBufferSource.disconnect();
      this.activeBufferSource = null;
      this.activeSource = null;
    }

    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
      } catch {
        // Source may already be stopped by the browser.
      }
      this.activeOscillator.disconnect();
      this.activeOscillator = null;
      this.activeSource = null;
    }

    if (this.activeSource) {
      this.activeSource.disconnect();
      this.activeSource = null;
    }

    if (this.activeStream) {
      for (const track of this.activeStream.getTracks()) {
        track.stop();
      }
      this.activeStream = null;
    }
  }
}

export const audioEngine = new AudioEngine();

function emptyFrame(): AudioAnalysisFrame {
  return {
    volume: 0,
    bass: 0,
    mids: 0,
    highs: 0,
    waveform: [],
    frequency: []
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function smoothFrame(previous: AudioAnalysisFrame, next: AudioAnalysisFrame, amount: number): AudioAnalysisFrame {
  return {
    volume: smooth(previous.volume, next.volume, amount),
    bass: smooth(previous.bass, next.bass, amount),
    mids: smooth(previous.mids, next.mids, amount),
    highs: smooth(previous.highs, next.highs, amount),
    waveform: next.waveform,
    frequency: next.frequency
  };
}

function smooth(previous: number, next: number, amount: number): number {
  return previous + (next - previous) * amount;
}
