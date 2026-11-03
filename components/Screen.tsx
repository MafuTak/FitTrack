import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Gradients, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: React.ReactNode;
  /** Quando true, envolve o conteúdo em uma ScrollView. */
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
};

/**
 * Fundo padrão de todas as telas: degradê laranja + brilho no topo.
 */
export function Screen({
  children,
  scroll = false,
  contentContainerStyle,
  style,
  keyboardShouldPersistTaps = 'handled',
}: ScreenProps) {
  return (
    <LinearGradient
      colors={Gradients.screen}
      locations={[0, 0.45, 1]}
      style={styles.fill}
    >
      <LinearGradient
        colors={Gradients.glow}
        style={styles.glow}
        pointerEvents="none"
      />
      <SafeAreaView style={[styles.fill, style]} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, contentContainerStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + Spacing.md,
  },
});
