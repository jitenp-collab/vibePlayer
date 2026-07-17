import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FolderSvg } from '../assets/svg/SVGs';
import { colors } from '../util/theme/theme';
import { useAudioPermission } from '../customeHook/useAudioPernission';
import { useDeviceAudio } from '../customeHook/useDeviceAudio';
import ItemList from '../ReusableComponent/ItemList';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { AddFavourite, analyzeAndSaveSongs } from '../redux/actions/actions';
import ReuseButton from '../ReusableComponent/ReuseButton';
import AnalysisLoader from '../ReusableComponent/AnalysisLoader';
import MoodSearch from './MoodSearch';

const MediaSongComponent = () => {
  const isFocused = useIsFocused();
  const { isAllowed, openSettings } = useAudioPermission();
  const { deviceSong, isLoading, error, refresh } = useDeviceAudio();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const favouriteSong = useAppSelector(state => state.songs.favouriteSong);
  const analysisProgress = useAppSelector(
    state => state.songs.analysisProgress,
  );

  const hasPartialProgress =
    analysisProgress.done > 0 && analysisProgress.done < analysisProgress.total;

  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);

  useEffect(() => {
    if (analysisProgress.isAnalyzing) {
      setShowAnalysisOverlay(true);
    }
  }, [analysisProgress.isAnalyzing]);

  const handleAnalyze = () => {
    setShowAnalysisOverlay(true);
    dispatch(analyzeAndSaveSongs(deviceSong));
  };

  const handleToggleFavourite = useCallback(
    (item: any) => dispatch(AddFavourite(item)),
    [dispatch],
  );

  const checkIsFavourite = useCallback(
    (item: any) => favouriteSong.some((fav: any) => fav.id === item.id),
    [favouriteSong],
  );

  if (!isFocused) {
    return <View style={{ flex: 1 }} />;
  }

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
    <View style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <Text style={styles.allMedia}>All Media Songs</Text>
        {!analysisProgress.isAnalyzing && (
          <ReuseButton onPress={handleAnalyze} style={styles.analyzeBtn}>
            <Text style={styles.analyzeBtnText}>
              {hasPartialProgress ? 'Resume Analysis' : 'Analyze'}
            </Text>
          </ReuseButton>
        )}
      </View>

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
        onToggleFavourite={handleToggleFavourite}
        isFavourite={checkIsFavourite}
        Paddingbottom={240}
      />

      {showAnalysisOverlay && (
        <AnalysisLoader
          done={analysisProgress.done}
          total={analysisProgress.total}
          onClose={() => setShowAnalysisOverlay(false)}
        />
      )}
      <MoodSearch />
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

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingStart: 15,
    paddingEnd: 15,
    paddingTop: 15,
  },

  allMedia: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },

  analyzeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  analyzeBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  searchBar: {
    marginHorizontal: 5,
    marginTop: 12,
    marginBottom: 15,
  },
});
