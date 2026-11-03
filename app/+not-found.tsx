import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/components/Screen';
import { Button, EmptyState } from '@/components/ui';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen contentContainerStyle={styles.container}>
      <EmptyState
        icon="compass"
        title="Página não encontrada"
        message="O caminho que você tentou acessar não existe."
      />
      <Button
        title="Voltar ao início"
        icon="home"
        onPress={() => router.replace('/')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
