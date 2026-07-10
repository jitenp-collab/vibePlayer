import { decodeAudioData } from 'react-native-audio-api';

export const analyzeSong = async (filePath: string) => {
  try {
    console.log('Analyzing:', filePath);

    const buffer = await decodeAudioData(filePath);

    // getChannelData(0) gives us the raw sound wave as numbers
    // between -1 and 1, thousands of them per second
    const samples = buffer.getChannelData(0);

    // Calculate average "loudness" (called RMS energy)
    let sumSquares = 0;
    for (let i = 0; i < samples.length; i++) {
      sumSquares += samples[i] * samples[i];
    }
    const energy = Math.sqrt(sumSquares / samples.length);

    console.log('--- RESULT ---');
    console.log('Duration (seconds):', buffer.duration);
    console.log('Sample rate:', buffer.sampleRate);
    console.log('Energy (loudness):', energy);

    return { duration: buffer.duration, energy };
  } catch (error) {
    console.log('Analysis failed:', error);
    return null;
  }
};