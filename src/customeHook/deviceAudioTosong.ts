// util/customeHook/deviceAudioTosong.ts
import RNFS from 'react-native-fs';
import jsmediatags from 'jsmediatags';
import { SongProp, AudioTagResult } from '../util/const/Type';

const DEFAULT_ARTWORK = 'https://via.placeholder.com/300?text=Music';

const MAX_ARTWORK_BYTES = 2 * 1024 * 1024; // 2MB safety cap per embedded image

const ARTWORK_DIR = `${RNFS.CachesDirectoryPath}/artwork`;
let artworkDirReady: Promise<void> | null = null;

// Ensure the artwork cache folder exists exactly once, not once-per-file.
const ensureArtworkDir = () => {
  if (!artworkDirReady) {
    artworkDirReady = RNFS.mkdir(ARTWORK_DIR).catch(() => {
      // mkdir on an already-existing dir throws on some platforms — safe to ignore
    });
  }
  return artworkDirReady;
};

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Manual base64 encode — avoids btoa/Buffer, neither guaranteed on Hermes.
// Builds via array+join (not +=) to avoid O(n^2) string concat on larger images.
const bytesToBase64 = (bytes: number[]): string => {
  const out: string[] = [];
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : undefined;
    const b3 = i + 2 < len ? bytes[i + 2] : undefined;

    out.push(BASE64_CHARS[b1 >> 2]);
    out.push(BASE64_CHARS[((b1 & 3) << 4) | (b2 !== undefined ? b2 >> 4 : 0)]);
    out.push(
      b2 !== undefined
        ? BASE64_CHARS[((b2 & 15) << 2) | (b3 !== undefined ? b3 >> 6 : 0)]
        : '=',
    );
    out.push(b3 !== undefined ? BASE64_CHARS[b3 & 63] : '=');
  }
  return out.join('');
};

// djb2 — cheap, dependency-free string hash. Only used to build a stable filename
// per song path, not for anything security-sensitive.
const hashString = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

// Writes the embedded picture to a cache file and returns a file:// URI.
// Reuses the file across app runs (same song path -> same hash -> same filename),
// so re-scanning a library doesn't re-write artwork that's already on disk.
// Never throws — any failure just returns undefined (caller falls back to placeholder).
const extractArtworkToFile = async (
  picture: any,
  songPath: string,
): Promise<string | undefined> => {
  try {
    if (!picture?.data?.length) return undefined;
    if (picture.data.length > MAX_ARTWORK_BYTES) return undefined;

    await ensureArtworkDir();

    const ext = picture.format?.includes('png') ? 'png' : 'jpg';
    const filePath = `${ARTWORK_DIR}/${hashString(songPath)}.${ext}`;

    const alreadyExists = await RNFS.exists(filePath);
    if (!alreadyExists) {
      const base64 = bytesToBase64(picture.data);
      await RNFS.writeFile(filePath, base64, 'base64');
    }

    return `file://${filePath}`;
  } catch {
    return undefined;
  }
};

const stripFileScheme = (path: string) => path.replace(/^file:\/\//, '');

const readTags = (path: string): Promise<AudioTagResult> =>
  new Promise(resolve => {
    jsmediatags.read(stripFileScheme(path), {
      onSuccess: async tag => {
        const artwork = await extractArtworkToFile(tag?.tags?.picture, path);
        resolve({
          title: tag?.tags?.title,
          artist: tag?.tags?.artist,
          artwork,
        });
      },
      onError: () => resolve({}), // untagged/unreadable file — caller falls back to filename/placeholder
    });
  });

export const deviceFileToSong = async (file: RNFS.ReadDirItem): Promise<SongProp> => {
  const titleWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
  const url = file.path.startsWith('file://') ? file.path : `file://${file.path}`;

  const tags = await readTags(file.path);

  return {
    id: file.path,
    title: tags.title?.trim() || titleWithoutExtension,
    artist: tags.artist?.trim() || 'Unknown Artist',
    movie: tags.movie?.trim() || 'Unknown NAme',
    genres: [],
    artwork: tags.artwork || DEFAULT_ARTWORK, // now a file:// path, not a base64 string
    url,
  };
};

export const deviceFilesToSongs = async (
  files: RNFS.ReadDirItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<SongProp[]> => {
  const results: SongProp[] = [];
  for (let i = 0; i < files.length; i++) {
    results.push(await deviceFileToSong(files[i]));
    onProgress?.(i + 1, files.length);
  }
  return results;
};