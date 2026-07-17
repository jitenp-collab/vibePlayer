import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../redux/hook';
import { colors } from '../util/theme/theme';
import {
  getSongsForMood,
  matchMoodFromTextAI,
} from '../customeHook/testDecode';
import ItemList from '../ReusableComponent/ItemList';
import ReuseInput from '../ReusableComponent/ReuseInput';
import { AiWaveformIcon } from '../assets/svg/SVGs';

const MoodSearchFab = () => {
  const navigation = useNavigation<any>();
  const { deviceSong, songMoods } = useAppSelector(state => state.songs);

  const [showMoodSearch, setShowMoodSearch] = useState(false);
  const [moodText, setMoodText] = useState('');
  const [moodResult, setMoodResult] = useState<string | null>(null);
  const [moodSongs, setMoodSongs] = useState<any[]>([]);
  const [isAiChecking, setIsAiChecking] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [aiHasRun, setAiHasRun] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTextRef = useRef('');

  const handleMoodTextChange = (value: string) => {
    setMoodText(value);
    latestTextRef.current = value;
    setAiHasRun(false);
    setAiFailed(false);

    // instant local match, free and immediate
    const { mood, results } = getSongsForMood(value, deviceSong, songMoods);
    setMoodResult(mood);
    setMoodSongs(results);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setIsAiChecking(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsAiChecking(true);
      const { mood: aiMood, failed } = await matchMoodFromTextAI(value);

      // if the user typed more while we were waiting, this response is stale — ignore it
      if (latestTextRef.current !== value) {
        setIsAiChecking(false);
        return;
      }

      setIsAiChecking(false);
      setAiHasRun(true);
      setAiFailed(failed);

      if (aiMood) {
        const aiResults = deviceSong.filter(
          s => songMoods[s.id]?.mood === aiMood,
        );
        setMoodResult(aiMood);
        setMoodSongs(aiResults);
      }
      // if aiMood is null, we just keep whatever the local keyword match already found
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const closeMoodSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowMoodSearch(false);
    setMoodText('');
    setMoodResult(null);
    setMoodSongs([]);
    setIsAiChecking(false);
    setAiFailed(false);
    setAiHasRun(false);
  };

  // MoodSearchFab.tsx — replace getEmptyMessage with this
  const getEmptyMessage = () => {
    if (moodText.length === 0) {
      return 'Type how you feel, and I\'ll find songs to match — try "happy", "chill night", "workout energy"...';
    }
    if (aiFailed) {
      return 'AI matching is unavailable right now — try simple words like happy, sad, calm, or angry.';
    }
    if (!moodResult) {
      return aiHasRun
        ? 'Hmm, couldn\'t quite place a mood from that — try describing the vibe differently, like "calm evening" or "party energy".'
        : "Couldn't tell your mood yet — try words like happy, sad, calm, angry...";
    }
    return `No analyzed songs match "${moodResult}" yet — try analyzing more songs from your library first.`;
  };

  return (
    <>
      {!showMoodSearch && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowMoodSearch(true)}
          activeOpacity={0.85}
        >
          <AiWaveformIcon size={26} color="#fff" />
        </TouchableOpacity>
      )}

      {showMoodSearch && (
        <View style={styles.moodOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeMoodSearch}
          />

          <View style={styles.moodCard}>
            <View style={styles.grabber} />

            <View style={styles.moodHeader}>
              <Text style={styles.headerTitle}>Find your vibe</Text>
              <TouchableOpacity
                onPress={closeMoodSearch}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ReuseInput
              value={moodText}
              onChangeText={handleMoodTextChange}
              placeholder="How are you feeling?"
              style={styles.moodInput}
              autoFocus
            />

            {isAiChecking && (
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>Thinking...</Text>
              </View>
            )}

            {!isAiChecking && aiFailed && (
              <View style={styles.statusRow}>
                <Text style={styles.statusTextWarn}>
                  AI unavailable, using basic match
                </Text>
              </View>
            )}

            {/* {!isAiChecking && !aiFailed && moodResult && (
              <View style={styles.moodChip}>
                <View style={styles.moodDot} />
                <Text style={styles.moodChipText}>
                  Matched mood: {moodResult}
                </Text>
              </View>
            )} */}

            <View style={styles.divider} />

            <ItemList
              data={moodSongs}
              keyExtractor={item => item.id}
              getTitle={item => item.title}
              getSubtitle={item => item.artist}
              getArtwork={item => item.artwork}
              showIndex={false}
              isSearch={false}
              onPressItem={(item, index) => {
                navigation.navigate('PlaySong', {
                  songIndex: index,
                  songId: item.id,
                  source: 'MoodSongs',
                  mood: moodResult,
                });
              }}
              ListEmptyComponent={
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>
                    {moodText.length === 0 ? '🎧' : !moodResult ? '🤔' : '🔍'}
                  </Text>
                  <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
                </View>
              }
              Paddingbottom={180}
            />
          </View>
        </View>
      )}
    </>
  );
};

export default MoodSearchFab;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 185,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  moodOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  moodCard: {
    height: '78%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: 14,
  },

  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },

  moodInput: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },

  statusRow: {
    marginBottom: 8,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusTextWarn: {
    color: colors.textMuted,
    fontSize: 12,
  },

  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  moodChipText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginBottom: 8,
  },

  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
