import { audioContextPromise } from "./audioContext";

export class Oscillator {
	audioContext;
	osc;
	gainNode;

	envelope = {
		attack: 0.001,
		decay: 0.5,
		sustain: 0.1,
		release: 0.8,
	};

	constructor(type) {
		this.init(type);
	}

	async init(type) {
		try {
			this.audioContext = await audioContextPromise;
			console.log("audioContext", this.audioContext);

			this.osc = new OscillatorNode(this.audioContext);
			this.gainNode = new GainNode(this.audioContext);
			this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
			this.osc.connect(this.gainNode);
			this.gainNode.connect(this.audioContext.destination);
			this.setType(type);
		} catch (error) {
			console.error("Error initializing audio context:", error);
		}
	}

	setFrequency(freq) {
		if (this.osc) {
			this.osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
		}
	}

	setType(type) {
		if (this.osc) {
			this.osc.type = type;
			if (type === "disable") {
				this.osc.disconnect();
			} else {
				this.osc.connect(this.gainNode);
			}
		}
	}

	async start() {
		await this.init(); 
		if (this.osc) {
			this.osc.start();
		}
	}

	async stop() {
		await this.init(); 
		if (this.osc) {
			this.osc.stop();
		}
	}

	triggerAttack() {
		if (this.gainNode) {
			const now = this.audioContext.currentTime;
			this.gainNode.gain.cancelScheduledValues(now);
			this.gainNode.gain.setValueAtTime(0, now);
			this.gainNode.gain.linearRampToValueAtTime(1, now + this.envelope.attack);
			this.gainNode.gain.linearRampToValueAtTime(
				this.envelope.sustain,
				now + this.envelope.attack + this.envelope.decay
			);
		}
	}

	triggerRelease() {
		if (this.gainNode) {
			const now = this.audioContext.currentTime;
			this.gainNode.gain.cancelScheduledValues(now);
			this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
			this.gainNode.gain.linearRampToValueAtTime(0, now + this.envelope.release);
		}
	}
}
