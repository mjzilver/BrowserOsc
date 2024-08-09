<script context="module">
  import { onMount } from "svelte";
  import { audioContext } from "../services/audioContext.js";
  import { Oscillator } from "../services/oscillator.js";

  let canvas, ctx;
  let activeKeys = new Set();
  let oscillators = [];

  const keys = [
    // octave 1
    { note: "C", freq: 130.81, key: "q", isWhite: true },
    { note: "C#", freq: 138.59, key: "w", isWhite: false },
    { note: "D", freq: 146.83, key: "e", isWhite: true },
    { note: "D#", freq: 155.56, key: "r", isWhite: false },
    { note: "E", freq: 164.81, key: "t", isWhite: true },
    { note: "F", freq: 174.61, key: "y", isWhite: true },
    { note: "F#", freq: 185.0, key: "u", isWhite: false },
    { note: "G", freq: 196.0, key: "i", isWhite: true },
    { note: "G#", freq: 207.65, key: "o", isWhite: false },
    { note: "A", freq: 220.0, key: "p", isWhite: true },
    { note: "A#", freq: 233.08, key: "[", isWhite: false },
    { note: "B", freq: 246.94, key: "]", isWhite: true },
    // octave 2
    { note: "C", freq: 261.63, key: "a", isWhite: true },
    { note: "C#", freq: 277.18, key: "s", isWhite: false },
    { note: "D", freq: 293.66, key: "d", isWhite: true },
    { note: "D#", freq: 311.13, key: "f", isWhite: false },
    { note: "E", freq: 329.63, key: "g", isWhite: true },
    { note: "F", freq: 349.23, key: "h", isWhite: true },
    { note: "F#", freq: 369.99, key: "j", isWhite: false },
    { note: "G", freq: 392.0, key: "k", isWhite: true },
    { note: "G#", freq: 415.3, key: "l", isWhite: false },
    { note: "A", freq: 440.0, key: ";", isWhite: true },
    { note: "A#", freq: 466.16, key: "'", isWhite: false },
    { note: "B", freq: 493.88, key: "\\", isWhite: true },
    // octave 3
    { note: "C", freq: 523.25, key: "z", isWhite: true },
    { note: "C#", freq: 554.37, key: "x", isWhite: false },
    { note: "D", freq: 587.33, key: "c", isWhite: true },
    { note: "D#", freq: 622.25, key: "v", isWhite: false },
    { note: "E", freq: 659.25, key: "b", isWhite: true },
    { note: "F", freq: 698.46, key: "n", isWhite: true },
    { note: "F#", freq: 739.99, key: "m", isWhite: false },
    { note: "G", freq: 783.99, key: ",", isWhite: true },
    { note: "G#", freq: 830.61, key: ".", isWhite: false },
    { note: "A", freq: 880.0, key: "/", isWhite: true },
    { note: "A#", freq: 932.33, key: "-", isWhite: false },
    { note: "B", freq: 987.77, key: "=", isWhite: true },
  ];

  function setupOscillators(oscTypes) {
    oscillators = [];
    for (let i = 0; i < oscTypes.length; i++) {
      const osc = new Oscillator(oscTypes[i]);
      osc.start();
      oscillators.push(osc);
    }
  }

  function playNote(note) {
    oscillators.forEach((osc) => osc.setFrequency(note.freq));
    oscillators.forEach((osc) => osc.triggerAttack());
  }

  function stopNote() {
    oscillators.forEach((osc) => osc.triggerRelease());
  }

  function handleKeyDown(e) {
    const key = keys.find((k) => k.key === e.key);
    if (key && !activeKeys.has(key.key)) {
      activeKeys.add(key.key);
      playNote(key);
    }
  }

  function handleKeyUp(e) {
    const key = keys.find((k) => k.key === e.key);
    if (key && activeKeys.has(key.key)) {
      activeKeys.delete(key.key);
      stopNote();
    }
  }

  function drawKeyboard() {
    const keyWidth = 60;
    const keyHeight = 200;
    const blackKeyHeight = keyHeight * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    keys.forEach((key, index) => {
      const x = index * keyWidth;
      ctx.fillStyle = key.isWhite ? "white" : "black";
      ctx.fillRect(x, 0, keyWidth, key.isWhite ? keyHeight : blackKeyHeight);

      if (activeKeys.has(key.key)) {
        ctx.fillStyle = key.isWhite ? "lightgrey" : "darkgrey";
        ctx.fillRect(x, 0, keyWidth, key.isWhite ? keyHeight : blackKeyHeight);
      }
    });
  }

  export { setupOscillators };
</script>
<!--On mount outside module -->
<script>
  onMount(() => {
    ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = 300;
    drawKeyboard();

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const interval = setInterval(drawKeyboard, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    background: #ccc;
    display: block;
    margin: 0;
  }
</style>
