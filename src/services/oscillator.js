import { audioContext } from './audioContext.js';

const envelope = {
    attack: 0.001,
    decay: 0.5,
    sustain: 0.1,
    release: 0.8,
};

export class Oscillator {
    constructor(type) {
        this.osc = audioContext.createOscillator();
        this.gainNode = audioContext.createGain();
        this.gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        this.osc.connect(this.gainNode);
        this.gainNode.connect(audioContext.destination);
        this.setType(type);
    }

    setFrequency(freq) {
        this.osc.frequency.setValueAtTime(freq, audioContext.currentTime);
    }

    setType(type) {
        this.osc.type = type;
        if (type === 'disable') {
            this.osc.disconnect();
        } else {
            this.osc.connect(this.gainNode);
        }
    }

    start() {
        this.osc.start();
    }

    stop() {
        this.osc.stop();
    }

    triggerAttack() {
        const now = audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(0, now);
        this.gainNode.gain.linearRampToValueAtTime(1, now + envelope.attack);
        this.gainNode.gain.linearRampToValueAtTime(envelope.sustain, now + envelope.attack + envelope.decay);
    }

    triggerRelease() {
        const now = audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + envelope.release);
    }
}
