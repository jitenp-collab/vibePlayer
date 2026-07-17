import { ViewStyle, DimensionValue, TouchableOpacityProps, TextInputProps as RNTextInputProps, StyleProp, TextStyle } from "react-native";


export type TabPrope = {
  activeTab?: string;
  onTabPress?: (key: string) => void;
};

export type SongProp = {
  id: string;
  title: string;
  artist: string;
  movie: string;
  genres: string[];
  artwork: string;
  url: string;
};

// raw tag data read from a file via jsmediatags — either field may be missing if untagged
export type AudioTagResult = {
  title?: string;
  artist?: string;
  artwork?: string; // add this line
  movie?:string
};

export type MarqueeTextProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  duration?: number;
  loop?: boolean;
  bounce?: boolean;
  repeatSpacer?: number;
  marqueeDelay?: number;
  scrollSpeed?: number;
}

export type lastPlayedData = {
  position: number;
  songIndex: number
  source: 'offline' | 'device' | "favourite" | "playList" | "Reccomandation" | "MoodSongs";
  playlistId?: string;
  songId?: string
  mood?: string
}

export type SongsState = {
  songs: SongProp[];
  deviceSong: SongProp[]
  favouriteSong: []
  favouriteState: boolean
  PlayList: PlaylistProp[]
  recommendedSong?: any[]
  songAnalys: Record<string, SongFeatures>
  songMoods: Record<string, MoodResult>
  analysisProgress: { done: number; total: number; isAnalyzing: boolean }
  stopRequested: boolean
}

export type ItemListProps = {
  data: any[];
  keyExtractor: (item: any) => string;
  getTitle: (item: any) => string;
  getSubtitle?: (item: any) => string;
  getArtwork?: (item: any) => string | undefined;
  onPressItem?: (item: any, index: number) => void;
  showIndex?: boolean;
  ListEmptyComponent?: React.ReactElement | null;
  refreshControl?: any
  isFavourite?: (item: any) => boolean;
  onToggleFavourite?: (item: any, index: number) => void;
  isSearch?: boolean
  onDeleteItem?: (item: any, index: number) => void;
  isAdded?: (item: any) => boolean;
  onToggleAdd?: (item: any, index: number) => void;
  Paddingbottom?: DimensionValue
  ListHeaderComponent?: React.ReactElement | null
};

export type ItenCardProps = {
  item: any;
  index: number;
  getTitle: (item: any) => string;
  getSubtitle?: (item: any) => string;
  getArtwork?: (item: any) => string | undefined;
  onPressItem?: (item: any, index: number) => void;
  showIndex?: boolean;
  isFavourite?: (item: any) => boolean;
  onToggleFavourite?: (item: any, index: number) => void;
  onDeleteItem?: (item: any, index: number) => void;
  isAdded?: (item: any) => boolean;
  onToggleAdd?: (item: any, index: number) => void;
}

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  style?: any;
}

export type PlaylistProp = {
  id: string;
  name: string;
  songs: SongProp[];
  createdAt: number;
}

export type AppModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  cardStyle?: ViewStyle;
  animationType?: 'fade' | 'slide' | 'none';
  cardHeight?: DimensionValue;
  maxCardHeight?: DimensionValue;
  variant?: 'card' | 'fullscreen';
  transparentBackdrop?: boolean
}

export type TouchableProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: TouchableOpacityProps['hitSlop'];
  activeOpacity?: number;
  onLongPress?: () => void
};


export type ReuseInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: RNTextInputProps['keyboardType'];
  returnKeyType?: RNTextInputProps['returnKeyType'];
  multiline?: boolean;
  maxLength?: number;
};


export type SongFeatures = {
  id?: string;
  rms: number;
  zcr: number;
};

export type MoodResult = SongFeatures & {
  energyLevel: 'low' | 'high';
  brightness: 'warm' | 'bright';
  mood: 'chill' | 'airy' | 'energetic' | 'intense';
};

export type LoaderAnalys = {
  done: number;
  total: number;
};

export type Mood = 'energetic' | 'intense' | 'chill' | 'airy';