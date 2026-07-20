import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../util/theme/theme';
import { AppModalProps } from '../util/const/Type';
import ReuseButton from './ReuseButton';

const AppModal = ({
  visible,
  onClose,
  children,
  cardStyle,
  animationType,
  cardHeight = '75%',
  maxCardHeight = '85%',
  variant = 'card',
  transparentBackdrop = true,
}: AppModalProps) => {
  if (variant === 'fullscreen') {
    return (
      <Modal
        visible={visible}
        animationType={animationType ?? 'slide'}
        onRequestClose={onClose}
      >
        <SafeAreaView
          style={styles.fullscreenContainer}
          edges={['top', 'bottom']}
        >
          {children}
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType={animationType ?? 'fade'}
      transparent
      onRequestClose={onClose}
    >
      <ReuseButton
        style={[styles.modalBackdrop, {}]}
        activeOpacity={1}
        onPress={onClose}
      >
        <ReuseButton
          activeOpacity={1}
          style={[
            styles.modalCard,
            {
              height: cardHeight,
              maxHeight: maxCardHeight,
              backgroundColor: transparentBackdrop ? '#09090f57' : '#09090f',
            },
            cardStyle,
          ]}
          onPress={() => {}}
        >
          {children}
        </ReuseButton>
      </ReuseButton>
    </Modal>
  );
};

export default AppModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
});