import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { FolderSvg } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import { useAudioPermission } from '../customeHook/useAudioPernission';
import { useDeviceAudio } from '../customeHook/useDeviceAudio';
import ItemList from '../ReusableComponent/ItemList';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite } from '../redux/actions/actions';
import ReuseButton from '../ReusableComponent/ReuseButton';

const MediaSongComponent = () => {

  const { isAllowed, openSettings } = useAudioPermission();
  const { deviceSong, isLoading, error, refresh } = useDeviceAudio();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { favouriteSong } = useAppSelector(state => state.songs);


  // useEffect(() => {
  //   console.log(deviceSong);
  // }, [deviceSong]);

  // Permission not granted
  if (!isAllowed) {
    return (
      <View style={styles.folderBox}>
        <View style={styles.folder}>
          <FolderSvg />
        </View>
        <Text style={styles.deniedText}>Audio permission not granted</Text>
        <ReuseButton onPress={openSettings} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>Open Settings</Text>
        </ReuseButton>
      </View>
    );
  }

  // First-time loading (no files yet)
  if (isLoading && deviceSong.length === 0) {
    return (
      <View style={styles.folderBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.deniedText}>
          Scanning device for audio files...
        </Text>
      </View>
    );
  }

  // Scan failed
  if (error && deviceSong.length === 0) {
    return (
      <View style={styles.folderBox}>
        <Text style={styles.deniedText}>{error}</Text>
        <ReuseButton onPress={refresh} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>Try Again</Text>
        </ReuseButton>
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.allMedia}>All Media Songs</Text>
      <ItemList
        data={deviceSong}
        keyExtractor={item => item.id}
        getTitle={item => item.title}
        getSubtitle={item => item.artist}
        getArtwork={item => item.artwork}
        showIndex={false}
        onPressItem={(item, index) =>
          navigation.navigate('PlaySong', {
            songIndex: index,
            songId: item.id,
            source: 'device',
          })
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.folderBox}>
            <Text style={styles.deniedText}>
              No audio files found on this device
            </Text>
          </View>
        }
        onToggleFavourite={item => dispatch(AddFavourite(item))}
        isFavourite={item =>
          favouriteSong.some((fav: any) => fav.id === item.id)
        }
        Paddingbottom={288}
      />
    </View>
  );
};

export default MediaSongComponent;

const styles = StyleSheet.create({
  folder: {
    backgroundColor: colors.folderBg,
    borderRadius: 5,
  },
  folderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deniedText: {
    color: colors.textPrimary,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  settingsBtn: {
    backgroundColor: colors.primary,
    marginTop: 12,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  settingsBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },

  allMedia: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    paddingStart: 15,
     paddingTop: 15,
  },

  searchBar: {
    marginHorizontal: 5,
    marginTop: 12,
    marginBottom: 15,
  },
});
