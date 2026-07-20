// ReusableComponent/AnalysisLoader.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../util/theme/theme';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { requestStopAnalysis } from '../redux/reduces/reducers';
import { checkInternet } from '../util/checkInternet';

const OFFLINE_POLL_MS = 5000;

const AnalysisLoader = ({ done, total, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { stopRequested, analysisProgress } = useAppSelector(
    state => state.songs,
  );

  // if this mounts when everything's already analyzed, show the complete
  // card right away instead of the in-progress one
  const [showComplete, setShowComplete] = useState(
    () => !analysisProgress.isAnalyzing && total > 0 && done === total,
  );
  const wasAnalyzing = useRef(analysisProgress.isAnalyzing);

  const [isOffline, setIsOffline] = useState(false);

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    const justFinished = wasAnalyzing.current && !analysisProgress.isAnalyzing;
    wasAnalyzing.current = analysisProgress.isAnalyzing;

    if (analysisProgress.isAnalyzing) {
      setShowComplete(false);
      return;
    }

    if (!justFinished) return;

    if (total > 0 && done === total) {
      setShowComplete(true);
    } else {
      // stopped early — just close, no extra message
      onClose?.();
    }
  }, [analysisProgress.isAnalyzing, done, total, onClose]);

  // Only poll for connectivity while analysis is actually in progress —
  // no point checking once it's finished or on the complete screen.
  useEffect(() => {
    if (!analysisProgress.isAnalyzing) {
      setIsOffline(false);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      const online = await checkInternet();
      if (cancelled) return;
      setIsOffline(!online);
    };

    poll();
    const interval = setInterval(poll, OFFLINE_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [analysisProgress.isAnalyzing]);

  const handleManualClose = () => {
    setShowComplete(false);
    onClose?.();
  };

  if (showComplete) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleManualClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.completeIcon}>✓</Text>
          <Text style={styles.title}>All songs analyzed!</Text>
          <Text style={styles.subtitle}>
            {total} songs ready for mood-based search
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {stopRequested ? 'Stopping…' : 'Analyzing your music'}
        </Text>
        <Text style={styles.subtitle}>
          {done}/{total} songs · {percent}%
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineDot} />
            <Text style={styles.offlineBannerText}>No internet connection</Text>
          </View>
        )}

        <Text style={styles.hint}>
          The more songs analyzed, the better your mood-based song search and
          suggestions will be.
        </Text>
        <TouchableOpacity
          style={[styles.stopBtn, stopRequested && styles.stopBtnDisabled]}
          onPress={() => dispatch(requestStopAnalysis())}
          disabled={stopRequested}
        >
          <Text style={styles.stopBtnText}>
            {stopRequested ? 'Stopping…' : 'Stop for now'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.resumeHint}>
          You can continue anytime — already analyzed songs won't be redone.
        </Text>
      </View>
    </View>
  );
};

export default AnalysisLoader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 999,
  },
  card: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  completeIcon: {
    fontSize: 32,
    color: colors.success,
    marginBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textPrimary,
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 16,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A22',
    borderWidth: 1,
    borderColor: '#3A3A45',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 14,
    alignSelf: 'stretch',
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF5252',
    marginRight: 8,
  },
  offlineBannerText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hint: {
    color: colors.textPrimary,
    fontSize: 11,
    opacity: 0.6,
    marginTop: 14,
    textAlign: 'center',
  },
  stopBtn: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  stopBtnDisabled: {
    opacity: 0.5,
  },
  stopBtnText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  resumeHint: {
    color: colors.textPrimary,
    fontSize: 10,
    opacity: 0.4,
    marginTop: 10,
    textAlign: 'center',
  },
});