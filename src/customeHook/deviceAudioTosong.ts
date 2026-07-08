// util/customeHook/deviceAudioToSong.ts
import RNFS from 'react-native-fs';
import { SongProp } from '../util/const/Type';

const DEFAULT_ARTWORK = 'https://via.placeholder.com/300?text=Music';

export const deviceFileToSong = (file: RNFS.ReadDirItem): SongProp => {
  const titleWithoutExtension = file.name.replace(/\.[^/.]+$/, '');

  // Android RNFS paths are raw filesystem paths (need `file://` prefix).
  // iOS picker paths are already full URIs (already prefixed) — don't double-prefix.
  
  const url = file.path.startsWith('file://') ? file.path : `file://${file.path}`;

  return {
    id: file.path,
    title: titleWithoutExtension,
    artist: 'Unknown Artist',
    movie: '',
    genres: [],
    artwork: DEFAULT_ARTWORK,
    url,
  };
};

export const deviceFilesToSongs = (files: RNFS.ReadDirItem[]): SongProp[] =>
  files.map(deviceFileToSong);