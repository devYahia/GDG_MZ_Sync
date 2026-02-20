// audio-processor.js

// A simple AudioWorklet that downsamples the input and converts it to 16-bit PCM little-endian
class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];
        this.targetSampleRate = 16000;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            const channelData = input[0]; // Process only the first channel (mono)

            // Simple downsampling: accumulate audio data
            for (let i = 0; i < channelData.length; i++) {
                this.buffer.push(channelData[i]);
            }

            // 128 is the standard quantum size of an AudioWorklet
            // We aim to map current sample rate down to 16000
            // In a real production app we'd want a proper resample function
            // but for simplicity we rely on the host `AudioContext` being 16khz if possible, 
            // or we just send chunks and the server handles it if it's close enough.
            // 
            // Actually, if we set the AudioContext to 16000 when creating it:
            // const audioCtx = new AudioContext({ sampleRate: 16000 })
            // Then `channelData` is ALREADY 16kHz! 

            // We package exactly 2048 samples (approx 128ms at 16kHz) as a chunk to send to WebSocket
            // Gemini Live API expects chunks around 20ms - 40ms, so 512 samples/chunk is better (~32ms)

            const chunkSize = 512;
            while (this.buffer.length >= chunkSize) {
                const chunk = this.buffer.splice(0, chunkSize);

                // Convert Float32 to Int16
                const pcm16 = new Int16Array(chunkSize);
                for (let j = 0; j < chunkSize; j++) {
                    // clamp -1 to +1
                    let s = Math.max(-1, Math.min(1, chunk[j]));
                    // Scale and round
                    pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send Int16 array buffer to the main thread
                this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
            }
        }
        return true; // Keep processor alive
    }
}

registerProcessor("pcm-processor", PCMProcessor);
