<script>
    import { onMount } from 'svelte';
	import Keyboard, { setupOscillators } from './components/Keyboard.svelte';
	import OscillatorControl from './components/OscillatorControl.svelte';

    let oscTypes = ["sine", "sine", "sine", "sine"];

    function updateOscillatorTypes(index) {
        setupOscillators(oscTypes);
    }

    onMount(() => {
        setupOscillators(oscTypes);
    });
</script>

<OscillatorControl {oscTypes} {updateOscillatorTypes} />
<Keyboard {oscTypes} />
