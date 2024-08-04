let started = false;
let paused = false;
let pauseButton;
let fft;

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let oscillators = [];
let defaultAmp = 0.5;
let defaultFreq = 440;

let oscillatorTypes = {
    SINE: 'sine',
    SAW: 'sawtooth',
    TRIANGLE: 'triangle',
    SQUARE: 'square',
    NOISE: 'noise'
};

let keys = [
    { note: 'C', freq: 261.63, key: 'a' },
    { note: 'C#', freq: 277.18, key: 'w' },
    { note: 'D', freq: 293.66, key: 's' },
    { note: 'D#', freq: 311.13, key: 'e' },
    { note: 'E', freq: 329.63, key: 'd' },
    { note: 'F', freq: 349.23, key: 'f' },
    { note: 'F#', freq: 369.99, key: 't' },
    { note: 'G', freq: 392.00, key: 'g' },
    { note: 'G#', freq: 415.30, key: 'y' },
    { note: 'A', freq: 440.00, key: 'h' },
    { note: 'A#', freq: 466.16, key: 'u' },
    { note: 'B', freq: 493.88, key: 'j' },
];

let keyMap = new Map();
keys.forEach(key => {
    keyMap.set(key.key, key);
});

class Oscillator {
    constructor(type, index) {
        this.osc = new p5.Oscillator(type);
        this.previousAmp = 0.5;
        this.paused = false;
        this.started = false;
        this.index = index;  // Index to help identify which sliders to update
        this.osc.amp(0);
        this.osc.stop();
    }

    setFrequency(freq) {
        this.osc.freq(freq);
    }

    setAmplitude(amp) {
        this.osc.amp(amp);
    }

    togglePause() {
        if (this.paused && this.started) {
            this.start();
            this.paused = false;
        } else if (this.started) {
            this.previousAmp = this.osc.getAmp();
            this.osc.amp(0);
            this.paused = true;
        }
    }

    stop() {
        this.osc.stop();
        this.previousAmp = this.osc.getAmp();
        this.osc.amp(0);
        this.started = false;
    }

    start() {
        this.osc.start();
        this.osc.amp(this.previousAmp);
        this.started = true;
    }

    setType(type) {
        this.oscType = type;
        this.osc.setType(type);
        this.start();
    }

    getType() {
        return this.osc.getType();
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    let oscillatorTypeSelectX = 10;
    let freqSliderX = 150;
    let ampSliderX = 350;
    let sliderY = 600;
    let sliderSpacingY = 50;
    let labelOffset = 40;

    for (let i = 0; i < 4; i++) {
        let osc = new Oscillator(oscillatorTypes.SINE, i);
        oscillators.push(osc);

        let oscTypeLabel = createP('Oscillator ' + i + ' Type');
        oscTypeLabel.position(oscillatorTypeSelectX, sliderY - labelOffset);
        let oscTypeSelect = createSelect();
        oscTypeSelect.position(oscillatorTypeSelectX, sliderY);
        oscTypeSelect.option(oscillatorTypes.SINE);
        oscTypeSelect.option(oscillatorTypes.SAW);
        oscTypeSelect.option(oscillatorTypes.TRIANGLE);
        oscTypeSelect.option(oscillatorTypes.SQUARE);
        oscTypeSelect.option("Disable");
        oscTypeSelect.selected("Disable");
        oscTypeSelect.changed(() => {
            let type = oscTypeSelect.value();
            if (type === "Disable") {
                osc.stop();
                return;
            }
            osc.setType(type);
            updateSliders(i);
        });

        let freqSliderLabel = createP('Frequency Oscillator ' + i);
        freqSliderLabel.position(freqSliderX, sliderY - labelOffset);
        let freqSlider = createSlider(0, 1000, 440, 1);
        freqSlider.position(freqSliderX, sliderY);
        freqSlider.input(() => {
            let freq = freqSlider.value();
            osc.setFrequency(freq);
        });

        let ampSliderLabel = createP('Amplitude Oscillator ' + i);
        ampSliderLabel.position(ampSliderX, sliderY - labelOffset);
        let ampSlider = createSlider(0, 1, 0.5, 0.01);
        ampSlider.position(ampSliderX, sliderY);
        ampSlider.input(() => {
            let amp = ampSlider.value();
            osc.setAmplitude(amp);
        });

        osc.freqSlider = freqSlider;
        osc.ampSlider = ampSlider;

        sliderY += sliderSpacingY;
    }

    pauseButton = createButton('Pause');
    pauseButton.position(10, sliderY);
    pauseButton.mousePressed(togglePause);

    // Octave selector
    let octaveLabel = createP('Octave');
    octaveLabel.position(300, sliderY - labelOffset);
    octaveSelect = createSelect();
    octaveSelect.position(300, sliderY);
    octaveSelect.option('0');
    octaveSelect.option('1');
    octaveSelect.option('2');
    octaveSelect.option('3');
    octaveSelect.option('4');
    octaveSelect.selected('2');  // Default to octave 2

    octaveSelect.changed(() => {
        let octave = parseInt(octaveSelect.value(), 10); 
        for (let i = 0; i < oscillators.length; i++) {
            let osc = oscillators[i];
            if (osc.started) {
                // Calculate the frequency based on the selected octave
                let baseFrequency = defaultFreq; // Base frequency for octave 2 (440 Hz)
                let newFrequency = baseFrequency * Math.pow(2, octave - 2);
                osc.setFrequency(newFrequency);
                updateSliders(i);
            }
        }
    });

    fft = new p5.FFT();

    textSize(16);
    fill(0);
    text('Click anywhere to start the oscillators', 10, 290);

    window.addEventListener('keydown', (event) => {
        let key = event.key;
        keyPressed(key);
    });
}

function draw() {
    background(200);

    if (started && !paused) {
        drawWaveform();
    } else if (!started) {
        textSize(16);
        fill(0);
        text('Click anywhere to start the oscillators', 10, 330);
    } else if (paused) {
        textSize(16);
        fill(0);
        text('Oscillators paused', 10, 330);
    }

    drawKeyboard();
}

let waveformBounds = {
    x: 0,
    y: 0,
    width: windowWidth,
    height: windowHeight / 2
};

function drawWaveform() {
    noFill();
    stroke(0);

    for (let i = 0; i < oscillators.length; i++) {
        let osc = oscillators[i];
        let waveform = fft.waveform();

        beginShape();
        for (let j = 0; j < waveform.length; j++) {
            let x = map(j, 0, waveform.length, waveformBounds.x, waveformBounds.x + waveformBounds.width);
            let y = map(waveform[j], -1, 1, waveformBounds.y + waveformBounds.height, waveformBounds.y);
            vertex(x, y);
        }
        endShape();
    }
}

function drawKeyboard() {
    let keyWidth = (windowWidth * 0.9) / keys.length;
    let keyHeight = 80;
    let keyY = (windowHeight * 0.95) - keyHeight;
    let keyColor = 200;

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let keyX = i * keyWidth;
        fill(keyColor);
        rect(keyX, keyY, keyWidth, keyHeight);
        fill(0);
        textSize(16);
        text(key.note, keyX + keyWidth / 2, keyY + keyHeight / 2);
        text(key.key, keyX + keyWidth / 2, keyY + keyHeight / 2 + 20);
    }
}

function mousePressed() {
    if (!started) {
        started = true;
    }
}

function keyPressed(key) {
    console.log(key);
    if (key === ' ') {
        togglePause();
        return;
    }

    if (keyMap.has(key)) {
        let keyInfo = keyMap.get(key);
        for (let i = 0; i < oscillators.length; i++) {
            let osc = oscillators[i];
            if (osc.started) {
                osc.setFrequency(keyInfo.freq);
                updateSliders(i);
            }
        }
    }
}

function togglePause() {
    if (started) {
        if (paused) {
            for (let i = 0; i < oscillators.length; i++) {
                oscillators[i].togglePause();
            }
            pauseButton.html('Pause');
        } else {
            for (let i = 0; i < oscillators.length; i++) {
                oscillators[i].togglePause();
            }
            pauseButton.html('Resume');
        }
        paused = !paused;
    }
}

function updateSliders(index) {
    let osc = oscillators[index];
    console.log(osc.osc.getFreq())
    console.log(osc.osc.freq())

    if (osc.freqSlider) {
        osc.freqSlider.value(osc.osc.getFreq());
    }
    if (osc.ampSlider) {
        osc.ampSlider.value(osc.osc.getAmp());
    }
}
