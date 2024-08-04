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
    NOISE: 'noise',
    DISABLE: 'disable'
};

let envelope;

let keys = [
    // octave 1
    { note: 'C', freq: 130.81, key: 'q', isWhite: true },
    { note: 'C#', freq: 138.59, key: 'w', isWhite: false },
    { note: 'D', freq: 146.83, key: 'e', isWhite: true },
    { note: 'D#', freq: 155.56, key: 'r', isWhite: false },
    { note: 'E', freq: 164.81, key: 't', isWhite: true },
    { note: 'F', freq: 174.61, key: 'y', isWhite: true },
    { note: 'F#', freq: 185.00, key: 'u', isWhite: false },
    { note: 'G', freq: 196.00, key: 'i', isWhite: true },
    { note: 'G#', freq: 207.65, key: 'o', isWhite: false },
    { note: 'A', freq: 220.00, key: 'p', isWhite: true },
    { note: 'A#', freq: 233.08, key: '[', isWhite: false },
    { note: 'B', freq: 246.94, key: ']', isWhite: true },
    // octave 2
    { note: 'C', freq: 261.63, key: 'a', isWhite: true },
    { note: 'C#', freq: 277.18, key: 's', isWhite: false },
    { note: 'D', freq: 293.66, key: 'd', isWhite: true },
    { note: 'D#', freq: 311.13, key: 'f', isWhite: false },
    { note: 'E', freq: 329.63, key: 'g', isWhite: true },
    { note: 'F', freq: 349.23, key: 'h', isWhite: true },
    { note: 'F#', freq: 369.99, key: 'j', isWhite: false },
    { note: 'G', freq: 392.00, key: 'k', isWhite: true },
    { note: 'G#', freq: 415.30, key: 'l', isWhite: false },
    { note: 'A', freq: 440.00, key: ';', isWhite: true },
    { note: 'A#', freq: 466.16, key: '\'', isWhite: false },
    { note: 'B', freq: 493.88, key: '\\', isWhite: true },
    // octave 3
    { note: 'C', freq: 523.25, key: 'z', isWhite: true },
    { note: 'C#', freq: 554.37, key: 'x', isWhite: false },
    { note: 'D', freq: 587.33, key: 'c', isWhite: true },
    { note: 'D#', freq: 622.25, key: 'v', isWhite: false },
    { note: 'E', freq: 659.25, key: 'b', isWhite: true },
    { note: 'F', freq: 698.46, key: 'n', isWhite: true },
    { note: 'F#', freq: 739.99, key: 'm', isWhite: false },
    { note: 'G', freq: 783.99, key: ',', isWhite: true },
    { note: 'G#', freq: 830.61, key: '.', isWhite: false },
    { note: 'A', freq: 880.00, key: '/', isWhite: true },
    { note: 'A#', freq: 932.33, key: '-', isWhite: false },
    { note: 'B', freq: 987.77, key: '=', isWhite: true },
];

let keyMap = new Map();
keys.forEach(key => {
    keyMap.set(key.key, key);
});

class Oscillator {
    constructor(type, index) {
        this.osc = new p5.Oscillator("sine");
        this.index = index;
        this.oscType = type;
        this.osc.amp(0);
        this.osc.stop();
    }

    setFrequency(freq) {
        this.osc.freq(freq);
    }

    setAmplitude(amp) {
        this.osc.amp(amp);
    }

    stop() {
        this.osc.stop();
        this.osc.amp(0);
    }

    start() {
        this.osc.start();
    }

    setType(type) {
        this.oscType = type;
        this.osc.setType(type);
    }

    getType() {
        return this.oscType;
    }

    triggerAttack(envelope) {
        if (this.getType() === oscillatorTypes.DISABLE) {
            return;
        }

        this.osc.start();

        envelope.play(this.osc);
    }

    triggerRelease() {
        if (this.getType() === oscillatorTypes.DISABLE) {
            return;
        }
        envelope.triggerRelease(this.osc);
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    let oscillatorTypeSelectX = 200;
    let selectBoxY = windowHeight * 0.55;
    let labelOffset = 40;

    envelope = new p5.Envelope();
    envelope.setADSR(0.001, 0.5, 0.1, 0.8);
    envelope.setRange(1, 0);

    for (let i = 0; i < 4; i++) {
        let osc = new Oscillator(oscillatorTypes.DISABLE, i);
        osc.setAmplitude(envelope);
        oscillators.push(osc);

        let oscTypeLabel = createP('Oscillator ' + (i + 1) + ' Type');
        oscTypeLabel.position(oscillatorTypeSelectX, selectBoxY - labelOffset);
        let oscTypeSelect = createSelect();
        oscTypeSelect.position(oscillatorTypeSelectX, selectBoxY);
        oscTypeSelect.option(oscillatorTypes.SINE);
        oscTypeSelect.option(oscillatorTypes.SAW);
        oscTypeSelect.option(oscillatorTypes.TRIANGLE);
        oscTypeSelect.option(oscillatorTypes.SQUARE);
        oscTypeSelect.option(oscillatorTypes.DISABLE);
        oscTypeSelect.selected(oscillatorTypes.DISABLE);
        oscTypeSelect.changed(() => {
            let type = oscTypeSelect.value();
            osc.setType(type);
        });

        oscillatorTypeSelectX += 200;
    }

    let envelopeX = 200;
    let envelopeY = windowHeight * 0.6;
    let envelopeOffsetX = 200;

    // sliders to control the envelope
    let attackSliderLable = createP('Attack');
    attackSliderLable.position(envelopeX, envelopeY);
    let attackSlider = createSlider(0, 1, envelope.aTime, 0.001);
    attackSlider.position(envelopeX, envelopeY + labelOffset);
    attackSlider.input(() => {
        envelope.setADSR(attackSlider.value(), envelope.dTime, envelope.sPercent, envelope.rTime);
    });

    let decaySliderLable = createP('Decay');
    decaySliderLable.position(envelopeX + envelopeOffsetX, envelopeY);
    let decaySlider = createSlider(0, 1, envelope.dTime, 0.001);
    decaySlider.position(envelopeX + envelopeOffsetX, envelopeY + labelOffset);
    decaySlider.input(() => {
        envelope.setADSR(envelope.aTime, decaySlider.value(), envelope.sPercent, envelope.rTime);
    });

    let sustainSliderLable = createP('Sustain');
    sustainSliderLable.position(envelopeX + envelopeOffsetX * 2, envelopeY);
    let sustainSlider = createSlider(0, 1, envelope.sPercent, 0.001);
    sustainSlider.position(envelopeX + envelopeOffsetX * 2, envelopeY + labelOffset);
    sustainSlider.input(() => {
        envelope.setADSR(envelope.aTime, envelope.dTime, sustainSlider.value(), envelope.rTime);
    });

    let releaseSliderLable = createP('Release');
    releaseSliderLable.position(envelopeX + envelopeOffsetX * 3, envelopeY);
    let releaseSlider = createSlider(0, 1, envelope.rTime, 0.001);
    releaseSlider.position(envelopeX + envelopeOffsetX * 3, envelopeY + labelOffset);
    releaseSlider.input(() => {
        envelope.setADSR(envelope.aTime, envelope.dTime, envelope.sPercent, releaseSlider.value());
    });

    fft = new p5.FFT();

    window.addEventListener('keydown', (event) => {
        let key = event.key;
        keyPressed(key);
    });

    window.addEventListener('keyup', (event) => {
        let key = event.key;
        keyReleased(key);
    });

    window.addEventListener('mousedown', (event) => {
        mousePressed(event);
    });

    // to start off first oscillator is a sine
    oscillators[0].setType(oscillatorTypes.SINE);
    // set first selectbox too
    let oscTypeSelect = document.getElementsByTagName('select')[0];
    oscTypeSelect.value = oscillatorTypes.SINE;
}

function draw() {
    background(240);

    drawWaveform();
    drawKeyboard();
    drawEnvelope();
}

function drawGrid(bounds, spacing) {
    fill(200);
    rect(bounds.x, bounds.y, bounds.width, bounds.height);

    stroke(180);
    strokeWeight(1);

    // Vertical grid lines
    for (let x = bounds.x; x <= bounds.x + bounds.width; x += spacing) {
        line(x, bounds.y, x, bounds.y + bounds.height);
    }

    // Horizontal grid lines
    for (let y = bounds.y; y <= bounds.y + bounds.height; y += spacing) {
        line(bounds.x, y, bounds.x + bounds.width, y);
    }
}

let waveformBounds = {
    x: 0,
    y: 0,
    width: windowWidth * 0.75,
    height: windowHeight / 2
};

function drawWaveform() {
    drawGrid(waveformBounds, 20);

    // draw the waveform on the graph
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

let spectrumBounds = {
    x: windowWidth * 0.75,
    y: 0,
    width: windowWidth - windowWidth * 0.75,
    height: windowHeight / 2
};

function drawSpectrum() {
    drawGrid(spectrumBounds, 20);

    let spectrum = fft.analyze();
    noFill();
    stroke(0);

    beginShape();
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, spectrumBounds.x, spectrumBounds.x + spectrumBounds.width);
        let y = map(spectrum[i], 0, 255, spectrumBounds.y + spectrumBounds.height, spectrumBounds.y);
        vertex(x, y);
    }
    endShape();
}

let envelopeBounds = {
    x: windowWidth * 0.75,
    y: 0,
    width: windowWidth - windowWidth * 0.75,
    height: windowHeight / 2
};

function drawEnvelope() {
    drawGrid(envelopeBounds, 20);

    // draw the envelope on the graph
    noFill();
    stroke(0);

    let attackTime = envelope.aTime;
    let decayTime = envelope.dTime;
    let sustainLevel = envelope.sPercent;
    let releaseTime = envelope.rTime;

    let totalDuration = attackTime + decayTime + releaseTime;

    let sustainY = map(sustainLevel, 0, 1, envelopeBounds.y + envelopeBounds.height, envelopeBounds.y);

    beginShape();
    vertex(envelopeBounds.x, envelopeBounds.y + envelopeBounds.height); // Start at the bottom left
    vertex(envelopeBounds.x + envelopeBounds.width * (attackTime / totalDuration), envelopeBounds.y); // Attack peak
    vertex(envelopeBounds.x + envelopeBounds.width * ((attackTime + decayTime) / totalDuration), sustainY); // Decay end at sustain level
    vertex(envelopeBounds.x + envelopeBounds.width * ((attackTime + decayTime + releaseTime) / totalDuration), sustainY); // Sustain end
    vertex(envelopeBounds.x + envelopeBounds.width, envelopeBounds.y + envelopeBounds.height); // Release end at bottom right
    endShape();
}

let keyBounds = [];

function drawKeyboard() {
    let keyWidth = 80;
    let keyHeight = 200;
    let keyY = (windowHeight * 0.95) - keyHeight;

    let keyX = 10;
    // draw black keys later
    let blackKeys = [];
    keyBounds = [];

    // Draw white keys and record black key positions
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (key.isWhite) {
            drawWhiteKey(keyX, keyY, keyWidth, keyHeight, key);
            keyBounds.push({ key: key, x: keyX, y: keyY, w: keyWidth, h: keyHeight });
            keyX += keyWidth;
        } else {
            blackKeys.push({ key: key, x: keyX });
        }
    }

    // Draw black keys on top
    for (let i = 0; i < blackKeys.length; i++) {
        let blackKeyX = blackKeys[i].x;
        const key = blackKeys[i].key;
        const keyX = blackKeyX - keyWidth / 4;
        const keyW = keyWidth / 2;
        const keyH = keyHeight * 0.75;

        drawBlackKey(keyX, keyY, keyW, keyH, key);
        keyBounds.push({ key: key, x: keyX, y: keyY, w: keyW, h: keyH });
    }
}

function drawBlackKey(x, y, w, h, key) {
    fill(key.held ? 200 : 0);
    rect(x, y, w, h);

    fill(key.held ? 255 : 255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(key.note, x + w / 2, y + h / 2);
    text(key.key, x + w / 2, y + h / 2 + 20);
}

function drawWhiteKey(x, y, w, h, key) {
    fill(key.held ? 200 : 255);
    rect(x, y, w, h);

    fill(key.held ? 255 : 0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(key.note, x + w / 2, y + h / 2);
    text(key.key, x + w / 2, y + h / 2 + 20);
}

function mousePressed(event) {
    let x = event.clientX;
    let y = event.clientY;

    let keysHit = [];

    for (key of keyBounds) {
        if (x >= key.x && x <= key.x + key.w && y >= key.y && y <= key.y + key.h) {
            keysHit.push(key);
        }
    }

    if (keysHit.length !== 0) {
        // if multiple keys are hit, play the black key
        if (keysHit.length > 1) {
            let blackKey = keysHit.find(key => !key.key.isWhite);
            keyPressed(blackKey.key.key);
        } else {
            keyPressed(keysHit[0].key.key);
        }
    }
}

function mouseReleased(event) {
    // release all keys
    for (let key of keyMap.keys()) {
        keyReleased(key);
    }
}

function keyPressed(key) {
    if (key === ' ') {
        togglePause();
        return;
    }

    if (keyMap.has(key)) {
        let keyInfo = keyMap.get(key);
        keyInfo.held = true;
        for (let i = 0; i < oscillators.length; i++) {
            let osc = oscillators[i];
            osc.setFrequency(keyInfo.freq);
            osc.triggerAttack(envelope);
        }
    }
}

function keyReleased(key) {
    if (keyMap.has(key)) {
        let keyInfo = keyMap.get(key);
        keyInfo.held = false;

        for (let i = 0; i < oscillators.length; i++) {
            let osc = oscillators[i];
            osc.triggerRelease();
        }
    }
}
