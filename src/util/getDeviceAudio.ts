import RNFS from 'react-native-fs';
import { pick, keepLocalCopy, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Platform } from 'react-native';

const AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.aac', '.flac', '.ogg', '.opus', '.wma'];
const SKIP_FOLDERS = ['Android', '.thumbnails', '.trashed'];

const isAudioFile = (fileName: string) =>
  AUDIO_EXTENSIONS.some(ext => fileName.toLowerCase().endsWith(ext));

const scanFolder = async (path: string) => {
  let results: RNFS.ReadDirItem[] = [];

  try {
    const items = await RNFS.readDir(path);

    for (const item of items) {
      if (item.isDirectory()) {
        if (SKIP_FOLDERS.includes(item.name)) {
          continue;
        }
        const nested = await scanFolder(item.path);
        results = results.concat(nested);
      } else if (isAudioFile(item.name)) {
        results.push(item);
      }
    }
  } catch (error) {
    console.log(`Could not read folder: ${path}`, error);
  }
  return results;
};

const getDeviceAudioFilesIOS = async () => {
  try {
    const pickedFiles = await pick({
      type: [types.audio],
      allowMultiSelection: true,
    });

    const audioFiles = pickedFiles.filter(file => isAudioFile(file.name ?? ''));
    if (audioFiles.length === 0) return [];

    // iOS only keeps the picker's uri readable for a short window — copy into app storage

    // so both playback AND tag-reading (jsmediatags) can read the file anytime after this.

    // cast to non-empty tuple: keepLocalCopy's type requires it, and length is already checked above

    const filesToCopy = audioFiles.map(f => ({ uri: f.uri, fileName: f.name ?? 'unknown' })) as [
      { uri: string; fileName: string },
      ...{ uri: string; fileName: string }[],
    ];

    const localCopies = await keepLocalCopy({
      files: filesToCopy,
      destination: 'documentDirectory',
    });

    return audioFiles.map((file, i) => {
      const copy = localCopies[i];
      if (copy?.status !== 'success') {
        console.log('[getDeviceAudioFilesIOS] keepLocalCopy failed for', file.name, copy);
      }

      const stableId = `ios-${(file.name ?? 'unknown').toLowerCase()}-${file.size ?? 0}`;

      return {
        name: file.name ?? 'Unknown',
        path: copy?.status === 'success' ? copy.localUri : file.uri,
        size: file.size ?? 0,
        ctime: undefined,
        mtime: undefined,
        isFile: () => true,
        isDirectory: () => false,
        id: stableId, // extra field — consumed in deviceAudioTosong.ts, not part of RNFS's real type
      };
    }) as unknown as RNFS.ReadDirItem[];
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return [];
    }
    console.log('iOS audio picker error:', error);
    return [];
  }
};

export const getDeviceAudioFiles = async () => {
  if (Platform.OS === 'ios') {
    return getDeviceAudioFilesIOS();
  }

  const rootPath = RNFS.ExternalStorageDirectoryPath;
  return scanFolder(rootPath);
};