let resolveAudioContext;
let rejectAudioContext;

export const audioContextPromise = new Promise((resolve, reject) => {
	resolveAudioContext = resolve;
	rejectAudioContext = reject;

	const AudioContext = window.AudioContext || window.webkitAudioContext;

	if (!AudioContext) {
		reject('Web Audio API is not supported.');
		return;
	}

	function initializeAudioContext() {
		if (resolveAudioContext) {
			const audioContext = new AudioContext();
			if (audioContext.state === 'suspended') {
				audioContext.resume().then(() => resolveAudioContext(audioContext));
			} else {
				resolveAudioContext(audioContext);
			}
			// Remove event listeners once AudioContext is initialized
			document.removeEventListener('click', initializeAudioContext);
			document.removeEventListener('keydown', initializeAudioContext);
		}
	}

	// Add event listeners for user gestures
	document.addEventListener('click', initializeAudioContext);
	document.addEventListener('keydown', initializeAudioContext);
});
