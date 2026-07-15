import { AudioContext } from 'react-native-audio-api';
import { SongFeatures, SongProp, MoodResult, Mood } from '../util/const/Type';
import { GROQ_API_KEY } from '../util/const/apiConfig';

// ---------- FEATURE CALCULATIONS ----------

const calculateRMS = (samples: Float32Array): number => {
  let sumOfSquares = 0;
  for (let i = 0; i < samples.length; i++) {
    sumOfSquares += samples[i] * samples[i];
  }
  return Math.sqrt(sumOfSquares / samples.length);
};

const calculateZCR = (samples: Float32Array): number => {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    const prevIsPositive = samples[i - 1] >= 0;
    const currIsPositive = samples[i] >= 0;
    if (prevIsPositive !== currIsPositive) {
      crossings++;
    }
  }
  return crossings / samples.length;
};

// ---------- ANALYZE ONE SONG ----------

export const analyzeSong = async (
  songId: string,
  songUrl: string
): Promise<SongFeatures | null> => {
  try {
    const audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(songUrl);
    const channelData = buffer.getChannelData(0);

    return {
      id: songId,
      rms: calculateRMS(channelData),
      zcr: calculateZCR(channelData),
    };
  } catch (err) {
    console.log('❌ Failed to analyze:', songUrl, err);
    return null;
  }
};

// ---------- ANALYZE MANY SONGS (with progress + breathing room) ----------

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(resolve, ms));

export const analyzeLibrary = async (
  songs: SongProp[],
  onProgress?: (done: number, total: number) => void
): Promise<SongFeatures[]> => {
  const results: SongFeatures[] = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const result = await analyzeSong(song.id, song.url);

    if (result) {
      results.push(result);
    }

    onProgress?.(i + 1, songs.length);
    await wait(50);
  }

  return results;
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

export const calculateThresholds = (features: SongFeatures[]) => {
  const rmsValues = features.map(f => f.rms);
  const zcrValues = features.map(f => f.zcr);

  return {
    rmsThreshold: median(rmsValues),
    zcrThreshold: median(zcrValues),
  };
};

export const labelMood = (
  feature: SongFeatures,
  thresholds: { rmsThreshold: number; zcrThreshold: number }
): MoodResult => {
  const energyLevel = feature.rms >= thresholds.rmsThreshold ? 'high' : 'low';
  const brightness = feature.zcr >= thresholds.zcrThreshold ? 'bright' : 'warm';

  let mood: MoodResult['mood'];
  if (energyLevel === 'high' && brightness === 'warm') mood = 'energetic';
  else if (energyLevel === 'high' && brightness === 'bright') mood = 'intense';
  else if (energyLevel === 'low' && brightness === 'warm') mood = 'chill';
  else mood = 'airy';

  return { ...feature, energyLevel, brightness, mood };
};

// ---------- MOOD MATCHING FROM CHAT TEXT ----------

const moodKeywords: Record<MoodResult['mood'], string[]> = {
  energetic: [
    'happy', 'energetic', 'party', 'workout', 'gym', 'pump', 'dance',
    'upbeat', 'excited', 'motivation', 'motivated', 'running', 'run',
    'exercise', 'fun', 'celebration', 'festival', 'morning workout',
    'gym song', 'joy', 'joyful', 'cheerful', 'pumped up', 'energised',
    'energized', 'lively', 'groovy', 'bouncy', 'feel good', 'good vibes',
    'positive', 'weekend', 'road trip', 'roadtrip', 'sunny day',
  ],
  intense: [
    'angry', 'intense', 'rage', 'hype', 'power', 'aggressive', 'strong',
    'fight', 'battle', 'pumped', 'adrenaline', 'gym beast', 'furious',
    'anger', 'mad', 'frustrated', 'frustration', 'rebel', 'rebellious',
    'dark', 'heavy', 'metal', 'workout beast', 'competitive', 'fierce',
    'savage', 'warrior', 'unstoppable',
  ],
  chill: [
    'sad', 'chill', 'relax', 'relaxed', 'relaxing', 'calm', 'down',
    'lonely', 'tired', 'slow', 'sleep', 'sleepy', 'night', 'night song',
    'evening', 'evening song', 'rainy', 'rain', 'monsoon', 'cloudy',
    'breakup', 'break up', 'heartbreak', 'heartbroken', 'study', 'focus',
    'lofi', 'lo-fi', 'melancholy', 'melancholic', 'blue', 'depressed',
    'low', 'low mood', 'quiet', 'unwind', 'winding down', 'introspective',
    'nostalgic', 'nostalgia', 'missing someone', 'miss you', 'alone',
  ],
  airy: [
    'dreamy', 'soft', 'soft song', 'light', 'peaceful', 'airy', 'floating',
    'romantic', 'morning', 'morning song', 'sunrise', 'fresh', 'love',
    'cute', 'gentle', 'soothing', 'spa', 'meditation', 'yoga', 'serene',
    'calm morning', 'coffee', 'coffee time', 'breeze', 'sunset',
    'in love', 'crush', 'butterflies', 'warm feeling', 'cosy', 'cozy',
    'ethereal', 'weightless', 'tender', 'delicate',
  ],
};

export const matchMoodFromText = (text: string): MoodResult['mood'] | null => {
  const lower = text.toLowerCase();


  for (const mood of Object.keys(moodKeywords) as MoodResult['mood'][]) {
    const hit = moodKeywords[mood].some(keyword => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
      return pattern.test(lower);
    });
    if (hit) return mood;
  }

  return null;
};


export const getSongsForMood = (
  text: string,
  songs: SongProp[],
  songMoods: Record<string, MoodResult>
): { mood: MoodResult['mood'] | null; results: SongProp[] } => {
  const mood = matchMoodFromText(text);

  if (!mood) {
    return { mood: null, results: [] };
  }

  const results = songs.filter(song => songMoods[song.id]?.mood === mood);
  return { mood, results };
};


const VALID_MOODS: Mood[] = ['energetic', 'intense', 'chill', 'airy'];

export const matchMoodFromTextAI = async (text: string) => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        reasoning_effort: 'low',
        messages: [
          {
            role: 'system',

            content:
              'You classify how a person is feeling or what kind of songs they want into exactly one mood word. ' +
              'Valid moods are ONLY: energetic, intense, chill, airy. ' +
              'energetic = happy, upbeat, workout, gym, dance, party, motivation, celebration, joyful, lively vibes. ' +
              'intense = angry, aggressive, hype, powerful, fight, adrenaline, furious, rebellious, dark, heavy vibes. ' +
              'chill = sad, relaxed, calm, tired, lonely, night, evening, rainy, study, lofi, melancholy, nostalgic vibes. ' +
              'airy = dreamy, soft, peaceful, romantic, morning, sunrise, fresh, gentle, meditation, cosy, tender vibes. ' +
              'Be strict: only pick a mood if the text clearly matches one of these vibes, even loosely — ' +
              'do not force a mood onto neutral or unrelated text (e.g. names, random words, greetings, unrelated topics). ' +
              'If someone mentions a time of day, weather, or activity without more emotional context (e.g. "morning songs", "night songs", "study songs", "soft songs"), pick the mood that best fits that general vibe using the categories above. ' +
              'Reply with ONLY one lowercase word from that list, nothing else. ' +
              'If the text does not describe a feeling, activity, or vibe at all, reply with: none',
          },
          { role: 'user', content: text },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });

    if (!response.ok) {
      console.log('Groq request failed:', response.status);
      return { mood: null, failed: true };
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim().toLowerCase();
    const isValidMood = VALID_MOODS.some(mood => mood === raw);

    if (isValidMood) {
      return { mood: raw as Mood, failed: false };
    }

    return { mood: null, failed: false }; // AI ran fine, just found no mood
  } catch (error) {
    console.log('Groq mood match error:', error);
    return { mood: null, failed: true };
  }
};