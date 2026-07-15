import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../util/theme/theme';
import { useAppDispatch, useAppSelector } from '../redux/hook';
import { requestStopAnalysis } from '../redux/reduces/reducers';

const AnalysisLoader = ({ done, total, onClose }: any) => {
  const dispatch = useAppDispatch();
  const { stopRequested, analysisProgress } = useAppSelector(
    state => state.songs,
  );
  const [showComplete, setShowComplete] = useState(false);
  const wasAnalyzing = useRef(analysisProgress.isAnalyzing);

  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    const justFinished = wasAnalyzing.current && !analysisProgress.isAnalyzing;
    wasAnalyzing.current = analysisProgress.isAnalyzing;

    // started or resumed — make sure any old "complete" state is cleared
    if (analysisProgress.isAnalyzing) {
      setShowComplete(false);
      return;
    }

    if (!justFinished) return;

    if (total > 0 && done === total) {
      setShowComplete(true);
      const timer = setTimeout(() => {
        setShowComplete(false);
        onClose?.();
      }, 2500);
      return () => clearTimeout(timer);
    }

    // stopped early — just close, no extra message
    onClose?.();
  }, [analysisProgress.isAnalyzing, done, total, onClose]);

  // FIX: manual close — dismisses the overlay immediately regardless of
  // stopRequested/analyzing state, so the user is never stuck on this screen.
  // Note: this only hides the overlay, it does NOT stop the background
  // analysis job itself (that's still controlled separately by "Stop for now").
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
        {/* <TouchableOpacity style={styles.closeBtn} onPress={handleManualClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity> */}
        <Text style={styles.title}>
          {stopRequested ? 'Stopping…' : 'Analyzing your music'}
        </Text>
        <Text style={styles.subtitle}>
          {done}/{total} songs · {percent}%
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
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
    position: 'relative', // FIX: needed so closeBtn can be absolutely positioned inside
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