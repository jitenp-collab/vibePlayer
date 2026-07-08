import RNFS from 'react-native-fs';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
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


const getDeviceAudioFilesIOS = async (): Promise<RNFS.ReadDirItem[]> => {
  try {
    const pickedFiles = await pick({
      type: [types.audio],
      allowMultiSelection: true,
    });

    return pickedFiles
      .filter(file => isAudioFile(file.name ?? ''))
      .map(file => ({
        name: file.name ?? 'Unknown',
        path: file.uri, // already a full usable iOS file URI
        size: file.size ?? 0,
        ctime: undefined,
        mtime: undefined,
        isFile: () => true,
        isDirectory: () => false,
      })) as unknown as RNFS.ReadDirItem[];
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return [];
    }
    console.log('iOS audio picker error:', error);
    return [];
  }
};


export const getDeviceAudioFiles = async () => {

  if (Platform.OS === "ios") {
    return getDeviceAudioFilesIOS()
  }

  const rootPath = RNFS.ExternalStorageDirectoryPath;
  const allFiles = await scanFolder(rootPath);

  // console.log(`Total audio files found: ${allFiles}`);
  // console.log(`Total audio files found: ${allFiles}`);
  return allFiles;
};