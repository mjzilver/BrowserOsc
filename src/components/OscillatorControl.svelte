<script>
    export let oscTypes = [];
    export let updateOscillatorTypes;

    function onOscillatorChange(index, event) {
        oscTypes[index] = event.target.value;
        updateOscillatorTypes(index);
    }
</script>

<div class="controls">
    {#each oscTypes as type, i}
        <div>
            <label for={`oscillator-${i + 1}`}>Oscillator {i + 1}</label>
            <select id={`oscillator-${i + 1}`} bind:value={oscTypes[i]} on:change={(e) => onOscillatorChange(i, e)}>
                <option value="sine">Sine</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
                <option value="square">Square</option>
                <option value="disable">Disable</option>
            </select>
        </div>
    {/each}
</div>

<style>
    .controls {
        display: flex;
        gap: 20px;
    }

    .controls div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    select {
        margin-top: 10px;
    }
</style>
